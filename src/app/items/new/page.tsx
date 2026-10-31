"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { CATEGORIES, CONDITIONS, CAMPUS_ZONES } from "@/lib/constants";

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", description: "", category: "TEXTBOOKS", condition: "GOOD",
    price: "", campusZone: "",
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Please sign in to create a listing</h2>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">Sign In</Button>
      </div>
    );
  }

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 4 - imagePreviews.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") return;
        setImagePreviews((prev) => [...prev, result].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const isFreeCategory = form.category === "FREE_DONATIONS";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          condition: form.condition,
          price: isFreeCategory ? 0 : parseFloat(form.price) || 0,
          campusZone: form.campusZone || undefined,
          images: imagePreviews,
        }),
      });

      if (res.status === 401) {
        toast("Your session has expired. Please sign in again.", "error");
        router.push("/auth/signin");
        return;
      }

      const json = await res.json();
      if (json.success) {
        toast("Listing created successfully!", "success");
        router.push(`/items/${json.data.id}`);
      } else {
        toast(json.error || "Failed to create listing", "error");
      }
    } catch {
      toast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Create a Listing</h1>
      <p className="mt-2 text-gray-600">List an item for your campus community.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos (up to 4)</label>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 rounded-full bg-white/80 p-0.5 hover:bg-white">
                  <X className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 4 && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <ImagePlus className="h-6 w-6 text-gray-400" />
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input type="text" required minLength={3} value={form.title} onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Calculus Textbook 4th Edition" className={selectClass} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea required minLength={10} rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe the item, its condition, and any details buyers should know..."
            className={`${selectClass} resize-none`} />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className={selectClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
            <select value={form.condition} onChange={(e) => updateField("condition", e.target.value)} className={selectClass}>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        {!isFreeCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (\$)</label>
            <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)}
              placeholder="0.00" className={selectClass} />
          </div>
        )}
        {isFreeCategory && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            🎁 This item will be listed as <strong>free</strong> in the Giveaway Corner.
          </div>
        )}

        {/* Meetup Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Meetup Zone</label>
          <select value={form.campusZone} onChange={(e) => updateField("campusZone", e.target.value)} className={selectClass}>
            <option value="">Select a zone</option>
            {CAMPUS_ZONES.map((z) => (
              <option key={z.value} value={z.label}>{z.label}</option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={loading} className="w-full gap-2" size="lg">
          <Upload className="h-5 w-5" /> Publish Listing
        </Button>
      </form>
    </div>
  );
}
