"use client";

import { ThumbsUp, ThumbsDown, FileText, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { truncateText, formatDate } from "@/lib/utils";
import type { NoteWithUploader } from "@/types";

interface NoteCardProps {
  note: NoteWithUploader;
  onVote?: (noteId: string, voteType: "UP" | "DOWN") => void;
}

export function NoteCard({ note, onVote }: NoteCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-pink-100 p-2.5">
          <FileText className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug">{note.title}</h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            {truncateText(note.description, 120)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {note.department && (
              <Badge variant="blue" className="text-xs">{note.department}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Avatar name={note.uploader.name} src={note.uploader.avatarUrl || undefined} size="xs" />
            <span>{note.uploader.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatDate(note.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote?.(note.id, "UP")}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{note.upvotes}</span>
          </button>
          <button
            onClick={() => onVote?.(note.id, "DOWN")}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{note.downvotes}</span>
          </button>
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1"
          >
            <Button size="sm" variant="outline" className="text-xs gap-1">
              View PDF
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
