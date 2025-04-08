import React from 'react';

export default function Loading() {
  // This is the central loading indicator that will be used.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 fixed inset-0 z-50">
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
}