"use client";

import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function isUsableListingImage(src: string | undefined | null): src is string {
  if (!src) return false;
  if (src.startsWith("blob:")) return false;
  if (src.startsWith("data:image/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function usableListingImages(images: string[] | null | undefined): string[] {
  return (images ?? []).filter(isUsableListingImage);
}

interface ListingImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ListingImage({ src, alt, className, fallbackClassName }: ListingImageProps) {
  if (!isUsableListingImage(src)) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-gray-100", fallbackClassName)}>
        <Package className="h-12 w-12 text-gray-300" />
      </div>
    );
  }

  return (
    // User-supplied listing photos can be any host or a data URL; native img avoids next/image hostname errors.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />
  );
}
