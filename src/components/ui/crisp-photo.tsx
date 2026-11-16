"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * High-definition licensed photographs with a local, offline-safe fallback.
 * Source URLs supply ~2200px wide originals. Next.js delivers responsive
 * variants at quality 90 (or the Unsplash CDN provides them on Cloudflare).
 */
export const photos = {
  formation: {
    url: "https://images.unsplash.com/photo-1758270705317-3ef6142d306f?auto=format&fit=crop&w=2200&q=90",
    fallback: "/media/atelier-numerique.webp",
  },
  logiciels: {
    url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=2200&q=90",
    fallback: "/media/developpement-logiciel.webp",
  },
  projets: {
    url: "https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?auto=format&fit=crop&w=2200&q=90",
    fallback: "/media/travail-equipe.webp",
  },
} as const;

export type PhotoCategory = keyof typeof photos;
type CrispPhotoProps = Omit<ImageProps, "src" | "quality"> & { category: PhotoCategory };

export function CrispPhoto({ category, onError, ...props }: CrispPhotoProps) {
  const [failed, setFailed] = useState(false);
  const photo = photos[category];
  return (
    <Image
      {...props}
      src={failed ? photo.fallback : photo.url}
      quality={failed ? undefined : 90}
      onError={(event) => {
        if (!failed) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
