"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/note-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { useDebounce } from "@/hooks/use-debounce";
import type { NoteWithUploader } from "@/types";

export default function NotesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [notes, setNotes] = useState<NoteWithUploader[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (courseCode) params.set("courseCode", courseCode);

    try {
      const res = await fetch(`/api/notes?${params.toString()}`);
      const json = await res.json();
      if (json.success) setNotes(json.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, courseCode]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleVote = async (noteId: string, voteType: "UP" | "DOWN") => {
    if (!session) { toast("Please sign in to vote", "info"); return; }
    try {
      const res = await fetch(`/api/notes/${noteId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      const json = await res.json();
      if (json.success) fetchNotes();
      else toast(json.error || "Vote failed", "error");
    } catch { toast("Vote failed", "error"); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-pink-600" /> Study Notes
          </h1>
          <p className="mt-2 text-gray-600">Share and discover academic resources from your peers.</p>
        </div>
        {session && (
          <Link href="/notes/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Upload Note</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
          placeholder="Course Code (e.g. CS101)"
          className="rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full sm:w-48" />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex gap-3"><Skeleton className="h-12 w-12 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /></div></div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState title="No Notes Found" description="Be the first to share study notes for your courses!"
          actionLabel="Upload Note" onAction={() => window.location.href = "/notes/new"} />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
}
