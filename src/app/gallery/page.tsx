import React from 'react';
import GalleryClientWrapper from '@/components/GalleryClientWrapper';
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';


export default function GalleryPage() {
  return (
    // --- EDIT: Use Container for consistent padding/width ---
    // Adjusted padding/margin structure
    <main className="flex min-h-screen flex-col items-center bg-background">
      <Container className="py-6 md:py-12 w-full"> {/* Let Container handle max-width */}
        {/* Responsive text size and margin examples */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Event Gallery</h1>
        <p className="mt-2 mb-6 md:mb-8 text-lg text-muted-foreground text-center"> {/* Adjusted text class */}
          Browse our event albums and memories
        </p>
        <GalleryClientWrapper />
      </Container>
    </main>
     // --- EDIT END ---
  );
}