'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Card can be used for the row container
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Match Gallery API types
interface GalleryAlbum {
  id: string;
  albumName: string;
  description: string;
  date: string; // API returns ISO string
  createdAt: string; // API returns ISO string
  // Add coverImageUrl if needed, fetched separately or derived
  coverImageUrl?: string;
}

interface GalleryImage {
  id: string;
  url: string;
  albumId: string;
  caption: string;
  date: string; // API returns ISO string
  createdAt: string; // API returns ISO string
}

interface GalleryData {
  albums: GalleryAlbum[];
  images: GalleryImage[];
}

// findCoverImage function is no longer needed for this layout

export default function GalleryClientWrapper() {
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to fetch gallery data: ${res.statusText}`);
        }
        const data: GalleryData = await res.json();
        // No need to process cover images here anymore
        setGalleryData(data);

      } catch (err: any) {
        console.error("Gallery fetch error:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      // Skeleton for the new row layout
      <div className="space-y-8">
        {[...Array(2)].map((_, index) => (
           <Card key={index} className="flex flex-col md:flex-row overflow-hidden shadow-lg">
             <div className="p-6 md:w-1/2 flex flex-col justify-between">
               <div>
                 <Skeleton className="h-8 w-3/4 mb-3" />
                 <Skeleton className="h-4 w-full mb-2" />
                 <Skeleton className="h-4 w-5/6 mb-4" />
               </div>
               <div className="flex justify-between items-center mt-4">
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-4 w-16" />
               </div>
             </div>
             <div className="p-4 md:w-1/2 bg-muted/50 grid grid-cols-2 gap-2 aspect-square md:aspect-auto">
               {[...Array(4)].map((_, imgIndex) => (
                 <Skeleton key={imgIndex} className="aspect-square w-full" />
               ))}
             </div>
           </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">Error loading gallery: {error}</p>;
  }

  if (!galleryData || galleryData.albums.length === 0) {
    return <p className="text-gray-500 text-center">No albums found.</p>;
  }

  // --- IMPROVED LAYOUT ---
  return (
    <div className="space-y-8">
      {galleryData.albums.map((album) => {
        const albumImagesPreview = galleryData.images
          .filter(img => img.albumId === album.id)
          .slice(0, 4);
        const totalImageCount = galleryData.images.filter(img => img.albumId === album.id).length;

        return (
          <Card key={album.id} className="flex flex-col md:flex-row overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Left Column: Text Content */}
            <div className="p-6 md:w-2/5 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  <Link href={`/gallery/${album.id}`} className="hover:text-primary">
                    {album.albumName}
                  </Link>
                </h2>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    {album.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <Link href={`/gallery/${album.id}`} passHref>
                    <Button variant="outline" size="sm">View Album ({totalImageCount} images)</Button>
                  </Link>
                  <Badge variant="secondary">{new Date(album.date).toLocaleDateString()}</Badge>
                </div>
              </div>
            </div>

            {/* Right Column: Image Grid */}
            <div className="md:w-3/5">
              {albumImagesPreview.length > 0 ? (
                <div className="grid grid-cols-2 gap-0.5 h-full">
                  {albumImagesPreview.map((image) => (
                    <div key={image.id} className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.caption || `Preview for ${album.albumName}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - albumImagesPreview.length) }).map((_, i) => (
                    <div key={`placeholder-${i}`} className="aspect-square bg-muted/30"></div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full aspect-[4/3] text-sm text-muted-foreground bg-muted/30">
                  No image previews
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}