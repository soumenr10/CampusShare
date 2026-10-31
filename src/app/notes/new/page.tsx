"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

export default function UploadNotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", description: "", department: "", fileUrl: "",
  });
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Please sign in to upload notes</h2>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">Sign In</Button>
      </div>
    );
  }

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          department: form.department || undefined,
          fileUrl: form.fileUrl || "https://example.com/sample-notes.pdf",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast("Note uploaded successfully!", "success");
        router.push("/notes");
      } else {
        toast(json.error || "Failed to upload note", "error");
      }
    } catch {
      toast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FileText className="h-7 w-7 text-pink-600" /> Upload Study Notes
      </h1>
      <p className="mt-2 text-gray-600">Share your notes to help fellow students.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input type="text" required minLength={3} value={form.title} onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Data Structures Final Review Notes" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea required minLength={10} rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)}
            placeholder="Brief description of what these notes cover..."
            className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Department (optional)</label>
          <input type="text" value={form.department} onChange={(e) => updateField("department", e.target.value)}
            placeholder="Computer Science" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF File URL</label>
          <input type="url" value={form.fileUrl} onChange={(e) => updateField("fileUrl", e.target.value)}
            placeholder="https://drive.google.com/your-pdf-link" className={inputClass} />
          <p className="mt-1 text-xs text-gray-500">Upload your PDF to Google Drive or Cloudinary and paste the link here.</p>
        </div>

        <Button type="submit" loading={loading} className="w-full gap-2" size="lg">
          <Upload className="h-5 w-5" /> Upload Note
        </Button>
      </form>
    </div>
  );
}
