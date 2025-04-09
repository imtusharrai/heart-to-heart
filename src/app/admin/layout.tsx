'use client';

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Container } from '@/components/Container';
import ProtectedRoute from '@/components/ProtectedRoute';
import LogoutButton from '@/components/LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/40">
        <nav className="bg-card border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/admin" className="font-bold text-xl text-foreground">Admin Dashboard</Link>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/" target="_blank" rel="noopener noreferrer">View Site</Link>
                </Button>
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Container className="py-6 md:py-8">
            {children}
          </Container>
        </main>
      </div>
    </ProtectedRoute>
  );
}