"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package, MapPin, Clock, MessageCircle, Flag, Tag,
  ChevronLeft, ChevronRight, ShieldCheck, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingImage, usableListingImages } from "@/components/items/listing-image";
import { useToast } from "@/components/ui/toaster";
import { formatPrice, formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { ItemWithSeller } from "@/types";

const conditionLabels: Record<string, string> = {
  BRAND_NEW: "Brand New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair",
};
const conditionColors: Record<string, string> = {
  BRAND_NEW: "green", LIKE_NEW: "blue", GOOD: "yellow", FAIR: "gray",
};
const statusColors: Record<string, string> = {
  AVAILABLE: "green", RESERVED: "yellow", SOLD: "gray",
};
const categoryLabels: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label])
);

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [item, setItem] = useState<ItemWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      const itemId = Array.isArray(params.id) ? params.id[0] : params.id;
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        if (json.success) setItem(json.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchItem();
  }, [params.id]);

  const handleMessageSeller = async () => {
    if (!session) { router.push("/auth/signin"); return; }
    if (!item) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: item.sellerId }),
      });
      const json = await res.json();
      if (json.success) router.push("/chat");
      else toast(json.error || "Failed to start conversation", "error");
    } catch { toast("Failed to start conversation", "error"); }
  };

  const handleReport = async () => {
    if (!session) { router.push("/auth/signin"); return; }
    if (!item) return;
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, reason: "Suspicious listing reported by user" }),
      });
      const json = await res.json();
      if (json.success) toast("Report submitted. Thank you!", "success");
      else toast(json.error || "Failed to submit report", "error");
    } catch { toast("Failed to submit report", "error"); }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3"><Skeleton className="aspect-[4/3] w-full rounded-2xl" /></div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Item not found</h2>
        <Link href="/browse"><Button variant="outline" className="mt-4">Back to Browse</Button></Link>
      </div>
    );
  }

  const images = usableListingImages(item.images);
  const isOwner = session?.user?.id === item.sellerId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Image Gallery */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden">
            <ListingImage
              src={images[currentImage]}
              alt={item.title}
              fallbackClassName="h-full w-full"
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${i === currentImage ? "border-blue-500" : "border-transparent hover:border-gray-300"}`}>
                  <ListingImage src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              <Badge variant={statusColors[item.status] as "green" | "yellow" | "gray"} className="shrink-0">
                {item.status}
              </Badge>
            </div>
            <p className="mt-2 text-3xl font-bold text-blue-600">{formatPrice(item.price)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{categoryLabels[item.category]}</Badge>
            <Badge variant={conditionColors[item.condition] as "green" | "blue" | "yellow" | "gray"}>
              {conditionLabels[item.condition]}
            </Badge>
            {item.courseCode && <Badge variant="gray"><Tag className="h-3 w-3 mr-1" />{item.courseCode}</Badge>}
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {item.campusZone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Meetup Zone: <span className="font-medium">{item.campusZone}</span></span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Posted {formatDate(item.createdAt)}</span>
          </div>

          {/* Seller Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <Link href={`/profile/${item.seller.id}`} className="flex items-center gap-3 group">
              <Avatar name={item.seller.name} src={item.seller.avatarUrl || undefined} size="md" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{item.seller.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RatingStars rating={item.seller.rating} size="sm" />
                  <span className="text-xs text-gray-500">({item.seller.reviewCount})</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!isOwner && item.status === "AVAILABLE" && (
              <Button onClick={handleMessageSeller} className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" /> Message Seller
              </Button>
            )}
            {!isOwner && (
              <Button onClick={handleReport} variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50">
                <Flag className="h-4 w-4" /> Report Listing
              </Button>
            )}
            {isOwner && (
              <Link href={`/items/${item.id}/edit`}>
                <Button variant="outline" className="w-full">Edit Listing</Button>
              </Link>
            )}
          </div>

          {/* Safety Tip */}
          <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Safety Tip</p>
              <p className="mt-1 text-green-700">Always meet in a public campus safe zone. We recommend the Library Foyer or Student Union.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
