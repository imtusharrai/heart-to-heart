import React from 'react';
import { Metadata } from 'next';
import AboutClientWrapper from '@/components/AboutClientWrapper';
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'About Us | Heart2Heart',
  description: 'Learn about our mission, values, and the team behind Heart2Heart.',
};

export default function AboutPage() {
  return (
    // --- EDIT: Use Container for consistent padding/width ---
    // Removed container classes from main, added py-* to Container
    <main className="bg-background text-foreground min-h-screen animate-in">
      <Container className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto"> {/* Keep specific max-width for text content block if needed */}
          <div className="text-center mb-12">
            {/* Responsive text size example */}
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">About Us</h1>
            {/* Responsive text size example */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn more about Heart2Heart Welfare Society, our mission, and our commitment to healthcare
            </p>
          </div>

          {/* Client component that will fetch and display content */}
          <AboutClientWrapper />
        </div>
      </Container>
    </main>
    // --- EDIT END ---
  );
}