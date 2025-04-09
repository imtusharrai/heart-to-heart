import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from "@/components/ui/button"; // Add this import
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Heart2Heart',
  description: 'Heart2Heart Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="bg-card border-b">
        {/* Keep existing container for nav */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="font-bold text-xl text-foreground">Admin Dashboard</Link>
            {/* Optional: Add View Site link or other nav items if needed */}
             <div>
                 <Button asChild variant="outline" size="sm">
                     <Link href="/" target="_blank" rel="noopener noreferrer">View Site</Link>
                 </Button>
             </div>
          </div>
        </div>
      </nav>
      {/* --- EDIT: Apply Container to main content area --- */}
      <main>
          <Container className="py-6 md:py-8">
              {children}
          </Container>
      </main>
      {/* --- EDIT END --- */}
      {/* Optional: Add a footer for the admin area */}
    </div>
  );
}