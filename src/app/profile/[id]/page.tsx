"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar, Building, BookOpen, GraduationCap, MapPin,
  Star, Package, FileText, MessageCircle, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { ItemCard } from "@/components/items/item-card";
import { NoteCard } from "@/components/notes/note-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { UserProfile, ItemWithSeller, NoteWithUploader, ReviewWithReviewer } from "@/types";

type Tab = "listings" | "notes" | "reviews";

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (res.status === 401) {
          // Silent return for guests
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        if (json.success) setProfile(json.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-5 w-64" /><Skeleton className="h-5 w-32" /></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: "listings", label: "Listings", icon: Package, count: profile.items.length },
    { key: "notes", label: "Notes", icon: FileText, count: profile.notes.length },
    { key: "reviews", label: "Reviews", icon: Star, count: profile.reviewsReceived.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar name={profile.name} src={profile.avatarUrl || undefined} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="mt-1 text-gray-600">{profile.email}</p>
              </div>
              {isOwnProfile && (
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Building className="h-4 w-4 text-blue-500" />{profile.collegeName}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-purple-500" />{profile.department}</span>
              {profile.graduationYear && (
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4 text-green-500" />Class of {profile.graduationYear}</span>
              )}
              {profile.hostel && (
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-orange-500" />{profile.hostel}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400" />Joined {formatDate(profile.createdAt)}</span>
            </div>

            {isOwnProfile && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Sell your own products</p>
                    <p className="text-xs text-blue-700">Turn your profile into a campus store</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-100 text-blue-600 border-blue-200"
                  onClick={() => router.push(`/profile/${params.id}/listings`)}
                >
                  Open Shop
                </Button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={profile.rating} size="sm" />
              <span className="text-sm text-gray-500">({profile.reviewCount} reviews)</span>
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "listings" && (
          profile.items.length === 0 ? (
            <EmptyState title="No Listings" description="This user hasn't posted any listings yet." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {profile.items.map((item) => (
                <ItemCard key={item.id} item={{ ...item, seller: { id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl, rating: profile.rating, reviewCount: profile.reviewCount } }} />
              ))}
            </div>
          )
        )}

        {activeTab === "notes" && (
          profile.notes.length === 0 ? (
            <EmptyState title="No Notes" description="This user hasn't shared any study notes yet." />
          ) : (
            <div className="space-y-4">
              {profile.notes.map((note) => (
                <NoteCard key={note.id} note={{ ...note, uploader: { id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl, rating: profile.rating, reviewCount: profile.reviewCount } }} />
              ))}
            </div>
          )
        )}

        {activeTab === "reviews" && (
          profile.reviewsReceived.length === 0 ? (
            <EmptyState title="No Reviews" description="This user hasn't received any reviews yet." />
          ) : (
            <div className="space-y-4">
              {profile.reviewsReceived.map((review) => (
                <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={review.reviewer.name} src={review.reviewer.avatarUrl || undefined} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.reviewer.name}</p>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
