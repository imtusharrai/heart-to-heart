import React from 'react';
// Ensure the named import is correct
import { HomeAdminClient } from '@/components/HomeAdminClient';

export default function AdminHomePageManagement() {
  return (
    <div className="bg-card p-6 md:p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-card-foreground">Manage Home Page Content</h1>
      <p className="text-muted-foreground mb-8">
        Edit the content for the Hero, About Summary, and Call to Action sections displayed on the public homepage.
      </p>

      {/* Render the client component for the form */}
      <HomeAdminClient />

    </div>
  );
}