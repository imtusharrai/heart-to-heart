import React from 'react';
import AlbumCreator from '@/components/AlbumCreator';
import GalleryAdminClient from '@/components/GalleryAdminClient';

export default function AdminGalleryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Gallery Administration</h1>
        <p className="text-gray-600 mb-6">Manage albums and images in the gallery</p>
        
        {/* Album Creator Component */}
        <div className="mb-8">
          <AlbumCreator />
        </div>
        
        {/* Gallery Admin Component for managing images */}
        <GalleryAdminClient />
      </div>
    </main>
  );
}