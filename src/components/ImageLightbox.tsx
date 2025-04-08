'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryImage {
  id: string;
  url: string;
  albumId: string;
  caption: string;
  date: string;
  createdAt: string;
}

interface ImageLightboxProps {
  images: GalleryImage[];
  albumName: string;
}

export default function ImageLightbox({ images, albumName }: ImageLightboxProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
      setSelectedImage(images[currentIndex > 0 ? currentIndex - 1 : images.length - 1]);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
      setSelectedImage(images[currentIndex < images.length - 1 ? currentIndex + 1 : 0]);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);

  return (
    <>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            onClick={() => openLightbox(image, index)}
          >
            <div className="relative w-full aspect-square">
              <Image
                src={image.url}
                alt={image.caption || `Image from ${albumName}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.caption}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {/* Close button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            
            {/* Navigation buttons */}
            <button 
              onClick={() => navigateImage('prev')}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
            
            <button 
              onClick={() => navigateImage('next')}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
            
            {/* Image container */}
            <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
              <Image
                src={selectedImage.url}
                alt={selectedImage.caption || `Image from ${albumName}`}
                fill
                style={{ objectFit: 'contain' }}
                sizes="100vw"
                priority
                quality={90}
              />
            </div>
            
            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-8 left-0 right-0 text-center text-white p-4 bg-black bg-opacity-50">
                <p>{selectedImage.caption}</p>
              </div>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p>{currentIndex + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}