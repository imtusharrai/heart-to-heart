import React from 'react';
import AboutAdminClient from '@/components/AboutAdminClient';

export default function AdminAboutPage() {
  return (
    <div className="bg-card p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-card-foreground">Manage About Page</h1>
      <p className="text-muted-foreground mb-8">
        Edit the content displayed on the About Us page. Changes will be reflected immediately after saving.
      </p>
      
      {/* Client component for managing about page content */}
      <AboutAdminClient />
    </div>
  );
}