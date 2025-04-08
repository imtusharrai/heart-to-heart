import React from 'react';
// Import the client component we created
import ContactAdminClient from '@/components/ContactAdminClient';

export default function AdminContactPage() {
  return (
    <div className="bg-card p-6 md:p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-card-foreground">Manage Contact Page</h1>
      <p className="text-muted-foreground mb-6">
        Update contact information, social links, map settings, and manage the contact form visibility. Form submissions view is not yet implemented.
      </p>

      {/* Render the client component for management */}
      <ContactAdminClient />

      {/* Placeholder for future contact form submissions view */}
      {/* <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Contact Form Submissions</h2>
        <p className="text-muted-foreground">Submissions view will be available here soon.</p>
        {/* Add table or list for submissions here */}
      {/* </div> */}
    </div>
  );
}