import React from 'react';
import { Metadata } from 'next';
import ContactClientWrapper from '@/components/ContactClientWrapper'; // Import the wrapper
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Contact Us | Heart2Heart',
  description: 'Get in touch with Heart2Heart Welfare Society. Find our contact details, location, and send us a message.',
};

export default function ContactPage() {
  return (
    // --- EDIT: Use Container for consistent padding/width ---
    // Removed container classes from main, added py-* to Container
    <main className="bg-background text-foreground min-h-screen animate-in">
       <Container className="py-12 md:py-16">
          {/* Render the client wrapper which handles fetching and displaying */}
          <ContactClientWrapper />
      </Container>
    </main>
    // --- EDIT END ---
  );
}