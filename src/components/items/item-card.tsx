"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ListingImage, usableListingImages } from "@/components/items/listing-image";
import { formatPrice, formatDate, truncateText } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { ItemWithSeller } from "@/types";

const conditionColors: Record<string, string> = {
  BRAND_NEW: "green",
  LIKE_NEW: "blue",
  GOOD: "yellow",
  FAIR: "gray",
};

const conditionLabels: Record<string, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
};

const categoryLabels: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label])
);

interface ItemCardProps {
  item: ItemWithSeller;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`} className="group">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <ListingImage
            src={usableListingImages(item.images)[0]}
            alt={item.title}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="blue" className="text-xs backdrop-blur-sm bg-blue-600/90">
              {categoryLabels[item.category] || item.category}
            </Badge>
          </div>
          {item.status === "RESERVED" && (
            <div className="absolute top-3 right-3">
              <Badge variant="yellow" className="text-xs">Reserved</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
              {truncateText(item.title, 50)}
            </h3>
            <span className="shrink-0 text-lg font-bold text-blue-600">
              {formatPrice(item.price)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant={conditionColors[item.condition] as "green" | "blue" | "yellow" | "gray"} className="text-xs">
              {conditionLabels[item.condition]}
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Avatar name={item.seller.name} src={item.seller.avatarUrl || undefined} size="xs" />
              <span>{item.seller.name}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.campusZone && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[80px]">{item.campusZone}</span>
                  <span className="mx-1">·</span>
                </>
              )}
              <Clock className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
