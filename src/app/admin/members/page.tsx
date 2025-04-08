import React from 'react';
import MembersAdminClient from '@/components/MembersAdminClient';

export default function AdminMembersPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Members</h1>
      <p className="text-gray-600 mb-6">
        Add, edit, or remove member profiles from this page.
      </p>
      <MembersAdminClient />
    </div>
  );
}