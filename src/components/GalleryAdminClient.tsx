'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Loader2, Pencil, Check, X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

// Add Alert Dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface GalleryItem {
  id: string;
  url?: string;
  albumId: string;
  albumName: string;
  description?: string;
  caption?: string;
  date?: string;
  createdAt?: string;
}

// Add Album interface if not already present (it might be inferred)
interface Album {
    id: string;
    albumName: string;
    description?: string;
    date?: string;
    createdAt?: string;
}


export default function GalleryAdminClient() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemCaption, setNewItemCaption] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  // Add this state declaration for album deletion status
  const [isDeletingAlbum, setIsDeletingAlbum] = useState<string | null>(null);

  // Edit states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<string>('');
  const [editingCaption, setEditingCaption] = useState<string>('');
  const [editingDate, setEditingDate] = useState<string>('');
  const [editingAlbumId, setEditingAlbumId] = useState<string>('');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data: GalleryItem[] = await res.json();
      
      // Separate albums from images
      const albumItems = data.filter(item => !item.url) as Album[]; // Cast as Album[]
      const imageItems = data.filter(item => item.url) as GalleryItem[]; // Cast as GalleryItem[]
      
      setGalleryItems(imageItems);
      setAlbums(albumItems);
      
      // Set default selected album if available
      if (albumItems.length > 0 && !selectedAlbumId) {
        setSelectedAlbumId(albumItems[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setGalleryItems([]);
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new image
  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newItemUrl.trim() || !selectedAlbumId) {
      setError("Image URL and album selection are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const selectedAlbum = albums.find(album => album.id === selectedAlbumId);
      if (!selectedAlbum) {
        throw new Error("Selected album not found");
      }
      
      const newImage = {
        id: uuidv4(),
        url: newItemUrl,
        albumId: selectedAlbumId,
        albumName: selectedAlbum.albumName,
        caption: newItemCaption,
        date: newItemDate || selectedAlbum.date,
        createdAt: new Date().toISOString()
      };
      
      const res = await fetch('/api/gallery/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImage),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add image');
      }

      // Add the new image to the local state
      setGalleryItems(prevItems => [...prevItems, newImage]);
      
      // Reset form
      setNewItemUrl('');
      setNewItemCaption('');
      setNewItemDate('');
      setSuccess("Image added successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: string) => {
    setIsDeleting(id);
    setError(null);
    try {
      const res = await fetch('/api/gallery/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      setGalleryItems(prevItems => prevItems.filter(item => item.id !== id));
      setSuccess("Image deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during deletion');
    } finally {
      setIsDeleting(null);
    }
  };

  // Edit handlers
  const handleEditClick = (item: GalleryItem) => {
    setEditingItemId(item.id);
    setEditingUrl(item.url || '');
    setEditingCaption(item.caption || '');
    setEditingDate(item.date || '');
    setEditingAlbumId(item.albumId);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingUrl('');
    setEditingCaption('');
    setEditingDate('');
    setEditingAlbumId('');
  };

  const handleUpdateItem = async (id: string) => {
    if (!editingUrl.trim() || !editingItemId || id !== editingItemId || !editingAlbumId) return;

    const isUpdating = id;
    setError(null);
    try {
      const selectedAlbum = albums.find(album => album.id === editingAlbumId);
      if (!selectedAlbum) {
        throw new Error("Selected album not found");
      }
      
      const updatedItem = {
        id,
        url: editingUrl,
        albumId: editingAlbumId,
        albumName: selectedAlbum.albumName,
        caption: editingCaption,
        date: editingDate,
        updatedAt: new Date().toISOString()
      };
      
      const res = await fetch('/api/gallery/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      // Update the item in the local state
      setGalleryItems(prevItems =>
        prevItems.map(item => (item.id === id ? updatedItem : item))
      );

      // Exit editing mode
      handleCancelEdit();
      setSuccess("Image updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during update');
    }
  };

  // Handler for deleting an album
  const handleDeleteAlbum = async (albumId: string) => {
    // Use setIsDeletingAlbum here
    setIsDeletingAlbum(albumId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/gallery', { // Target the main /api/gallery route
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId }), // Send albumId in the body
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData); // Log detailed error
        throw new Error(errorData.message || 'Failed to delete album');
      }

      // Album deleted successfully, refetch data to update the UI
      await fetchGalleryItems(); // Refetching ensures both albums and images are updated correctly

      setSuccess("Album deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error deleting album:', err); // Log error for debugging
      setError(err instanceof Error ? err.message : 'An unknown error occurred during album deletion');
       // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      // Use setIsDeletingAlbum here
      setIsDeletingAlbum(null);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Gallery Images</CardTitle>
        <CardDescription>Add or remove images from the gallery</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add Image Form */}
        <form onSubmit={handleAddImage} className="space-y-4 mb-6">
          <h3 className="text-lg font-medium">Add New Image</h3>
          
          <div className="space-y-3">
            <Select 
              value={selectedAlbumId} 
              onValueChange={setSelectedAlbumId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Album" />
              </SelectTrigger>
              <SelectContent>
                {albums.map(album => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.albumName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="url"
              placeholder="Enter image URL"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              required
            />
            
            <Textarea
              placeholder="Image Caption (optional)"
              value={newItemCaption}
              onChange={(e) => setNewItemCaption(e.target.value)}
            />
            
            <Input
              type="date"
              value={newItemDate}
              onChange={(e) => setNewItemDate(e.target.value)}
              placeholder="Date (optional, will use album date if not specified)"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting || !newItemUrl.trim() || !selectedAlbumId}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Image
          </Button>
        </form>

        {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded mb-4">{error}</div>}
        {success && <div className="text-green-500 text-sm p-2 bg-green-50 rounded mb-4">{success}</div>}

        {/* Display Images by Album */}
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div>
            {albums.length === 0 ? (
              <p className="text-muted-foreground text-center">No albums found. Create an album first.</p>
            ) : (
              albums.map(album => {
                const albumImages = galleryItems.filter(item => item.albumId === album.id);
                // Add console log for debugging
                // Now 'isDeletingAlbum' should be defined and accessible
                console.log(`Rendering album: ${album.albumName}, isDeletingAlbum:`, isDeletingAlbum);
                return (
                  <div key={album.id} className="mb-8 border rounded-lg p-4">
                    {/* Album Header with Delete Button */}
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold">{album.albumName}</h3>
                      {/* Delete Album Button Trigger */}
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                              variant="destructive"
                              size="sm"
                              // Line 379: Ensure `isDeletingAlbum` is used correctly here
                              disabled={isDeletingAlbum === album.id || !!editingItemId}
                            >
                              {/* Line 381: Ensure `isDeletingAlbum` is used correctly here */}
                              {isDeletingAlbum === album.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete Album
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the album
                                <strong className="px-1">{`"${album.albumName}"`}</strong>
                                and all images within it.
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={(e) => {
                                 e.preventDefault(); // Prevent default form submission if applicable
                                 handleDeleteAlbum(album.id);
                               }}
                               className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Destructive action style
                             >
                               Yes, delete album
                             </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </div>

                    {album.description && <p className="text-muted-foreground mb-2">{album.description}</p>}

                    {albumImages.length === 0 ? (
                      <p className="text-muted-foreground">No images in this album yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {/* Image mapping */}
                        {albumImages.map((item) => (
                          <div key={item.id} className="relative group border rounded-md overflow-hidden aspect-square"> {/* Added aspect-square for consistent sizing */}
                            {/* Edit Mode */}
                            {editingItemId === item.id ? (
                              <div className="p-2 flex flex-col">
                                <Input
                                  type="url"
                                  value={editingUrl}
                                  onChange={(e) => setEditingUrl(e.target.value)}
                                  className="mb-2 text-xs"
                                  placeholder="Image URL"
                                  required
                                />
                                <Select 
                                  value={editingAlbumId} 
                                  onValueChange={setEditingAlbumId}
                                  required
                                >
                                  <SelectTrigger className="mb-2 text-xs">
                                    <SelectValue placeholder="Select Album" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {albums.map(album => (
                                      <SelectItem key={album.id} value={album.id}>
                                        {album.albumName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="text"
                                  value={editingCaption}
                                  onChange={(e) => setEditingCaption(e.target.value)}
                                  className="mb-2 text-xs"
                                  placeholder="Caption"
                                />
                                <Input
                                  type="date"
                                  value={editingDate}
                                  onChange={(e) => setEditingDate(e.target.value)}
                                  className="mb-2 text-xs"
                                />
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className='h-6 w-6'
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className='h-6 w-6 text-green-600 hover:text-green-700'
                                    onClick={() => handleUpdateItem(item.id)}
                                    disabled={!editingUrl.trim()}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Default Display Mode */
                              <>
                                {item.url ? (
                                  // Use Next.js Image component for optimization or standard img tag
                                  <Image
                                    src={item.url}
                                    alt={item.caption || item.albumName || 'Gallery image'} // Provide a meaningful alt text
                                    layout="fill" // Use fill layout to cover the container div
                                    objectFit="cover" // Crop image to cover the container
                                    className="transition-transform duration-300 group-hover:scale-105" // Example hover effect
                                    onError={(e) => {
                                        // Optional: Handle image loading errors, maybe show a placeholder
                                        console.error("Failed to load image:", item.url);
                                        e.currentTarget.src = "/placeholder-image.png"; // Path to a local placeholder image asset
                                    }}
                                  />
                                  /* Alternatively, use a standard img tag: */
                                  /*
                                  <img
                                     src={item.url}
                                     alt={item.caption || item.albumName || 'Gallery image'}
                                     className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" // Use Tailwind for styling
                                     loading="lazy" // Enable native lazy loading
                                     onError={(e) => { e.currentTarget.src = "/placeholder-image.png"; }} // Handle errors
                                  />
                                  */
                                ) : (
                                  // Display something if URL is missing (though ideally images always have URLs)
                                  <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                                    <span>Invalid Image</span>
                                  </div>
                                )}

                                {/* Image caption/overlay (optional) */}
                                {item.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                        <p className="text-xs text-white truncate">{item.caption}</p>
                                    </div>
                                )}


                                {/* Action Buttons Overlay */}
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"> {/* Ensure buttons are above caption */}
                                   {/* Edit Image Button */}
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className='h-6 w-6'
                                    onClick={() => handleEditClick(item)}
                                    disabled={isDeleting === item.id || !!editingItemId || !!isDeletingAlbum}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                   {/* Delete Image Button */}
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className='h-6 w-6'
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={isDeleting === item.id || !!editingItemId || !!isDeletingAlbum}
                                  >
                                    {isDeleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}