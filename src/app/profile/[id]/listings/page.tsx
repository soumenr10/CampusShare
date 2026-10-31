"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Package, Trash2, Edit3, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import type { ItemWithSeller } from "@/types";

export default function MyListingsPage() {
  const { id: profileId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [listings, setListings] = useState<ItemWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyListings() {
      try {
        const res = await fetch(`/api/items?sellerId=${profileId}`);
        const json = await res.json();
        if (json.success) {
          setListings(json.data);
        }
      } catch (err) {
        toast("Failed to load your listings", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchMyListings();
  }, [profileId, toast]);

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast("Listing removed successfully", "success");
        setListings(listings.filter(item => item.id !== itemId));
      } else {
        toast(json.error || "Couldn't delete listing", "error");
      }
    } catch {
      toast("An unexpected error occurred", "error");
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">Please sign in to view your shop</h2>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Campus Shop</h1>
          <p className="text-gray-600">Manage the items you've listed for the community.</p>
        </div>
        <Button onClick={() => router.push("/items/new")} className="gap-2">
          <Package className="h-4 w-4" /> New Listing
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="Your shop is empty"
          description="You haven't listed any items yet. Start by posting something your peers might need!"
          actionLabel="Post First Listing"
          onAction={() => router.push("/items/new")}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(item => (
            <div key={item.id} className="group relative">
              <ItemCard item={item} />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
                  onClick={() => router.push(`/items/${item.id}/edit`)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-red-500/90 hover:bg-red-500 shadow-sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
