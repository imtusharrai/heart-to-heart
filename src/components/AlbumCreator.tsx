'use client';

import React, { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Album {
  id: string;
  albumName: string;
  description: string;
  date: string;
  createdAt?: string;
}

export default function AlbumCreator() {
  const [newAlbum, setNewAlbum] = useState<Album>({
    id: '',
    albumName: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newAlbum.albumName.trim()) {
      setError("Album name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Generate a unique ID for the album
      const albumId = `album-${uuidv4().slice(0, 8)}`;
      
      // Create the album entry
      const albumEntry = {
        id: albumId,
        albumName: newAlbum.albumName,
        description: newAlbum.description || "",
        date: newAlbum.date,
        createdAt: new Date().toISOString()
      };
      
      // Add the new album to gallery.json
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumEntry),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create album');
      }
      
      // Reset form and show success message
      setNewAlbum({
        id: '',
        albumName: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setSuccess(`Album "${newAlbum.albumName}" created successfully!`);
      
      // Refresh the page after a short delay to show the new album
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Album</CardTitle>
        <CardDescription>Add a new album to organize your gallery images</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="albumName" className="block text-sm font-medium mb-1">
              Album Name
            </label>
            <Input
              id="albumName"
              type="text"
              placeholder="Enter album name"
              value={newAlbum.albumName}
              onChange={(e) => setNewAlbum({...newAlbum, albumName: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Enter album description"
              value={newAlbum.description}
              onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Event Date
            </label>
            <Input
              id="date"
              type="date"
              value={newAlbum.date}
              onChange={(e) => setNewAlbum({...newAlbum, date: e.target.value})}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-500 text-sm p-2 bg-green-50 rounded">
              {success}
            </div>
          )}
          
          <Button type="submit" disabled={isSubmitting || !newAlbum.albumName.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Album'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}