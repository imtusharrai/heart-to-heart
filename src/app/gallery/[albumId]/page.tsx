import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ImageLightbox from '@/components/ImageLightbox';

// --- Define Interfaces (align with API response) ---
interface GalleryAlbum {
  id: string;
  albumName: string;
  description: string;
  date: string; // ISO string from API
  createdAt: string; // ISO string from API
}

interface GalleryImage {
  id: string;
  url: string;
  albumId: string;
  caption: string;
  date: string; // ISO string from API
  createdAt: string; // ISO string from API
}

interface GalleryData {
  albums: GalleryAlbum[];
  images: GalleryImage[];
}

// --- Data Fetching Function ---
async function getGalleryData(): Promise<GalleryData> {
    // Use absolute URL for server-side fetching or environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${apiUrl}/api/gallery`, {
            next: { revalidate: 900 } // Revalidate every 15 minutes
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch gallery data: ${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Error fetching gallery data:", error);
        // Return empty structure on error to avoid breaking the page
        return { albums: [], images: [] };
    }
}


// --- Page Component ---
export default async function AlbumDetailPage({ params }: { params: { albumId: string } }) {
  const albumId = decodeURIComponent(params.albumId);
  const galleryData = await getGalleryData();

  // Find the specific album
  const album = galleryData.albums.find((a) => a.id === albumId);

  // If album not found, trigger a 404
  if (!album) {
    notFound();
  }

  // Filter images for this album
  const albumImages = galleryData.images.filter((img) => img.albumId === albumId);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/gallery">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Albums
        </Link>
      </Button>

      {/* Album Header */}
      <div className="mb-10 text-center border-b pb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{album.albumName}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 w-full mx-auto mb-4">
          {album.description}
        </p>
        <Badge variant="secondary">{new Date(album.date).toLocaleDateString()}</Badge>
      </div>

      {/* Image Grid with Client-side Lightbox */}
      {albumImages.length > 0 ? (
        <ImageLightbox images={albumImages} albumName={album.albumName} />
      ) : (
        <p className="text-center text-gray-500 mt-8">No images found in this album.</p>
      )}
    </div>
  );
}

// --- Optional: generateStaticParams for build-time generation (if desired) ---
export async function generateStaticParams() {
    const galleryData = await getGalleryData();
    return galleryData.albums.map((album) => ({
        albumId: album.id,
    }));
}