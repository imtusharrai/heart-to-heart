'use client';

import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Fix: Use default import for ContactAdminClient
import ContactAdminClient from "@/components/ContactAdminClient";
// Fix: Remove the incorrect named import for MembersAdminClient
// import { MembersAdminClient } from "@/components/MembersAdminClient";
import { HomeAdminClient } from '@/components/HomeAdminClient'; // Import the new component
import { Badge } from "@/components/ui/badge"; // Import Badge
// Import Trash2 and AlertDialog components
import { CalendarDays, FileText, Image, Users, Mail, Loader2, AlertCircle, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
// Keep the correct default import for MembersAdminClient
import MembersAdminClient from '@/components/MembersAdminClient';
// Removed AboutAdminClient import as it seems to be linked, not embedded
import Link from 'next/link';
import { format } from 'date-fns'; // Import date-fns for formatting
// Need to import buttonVariants if not already imported
import { buttonVariants } from "@/components/ui/button"; // Ensure this is here

// Define the structure for a submission
interface Submission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      setErrorSubmissions(null);
      try {
        // Fetch from the new GET route
        const response = await fetch('/api/submissions');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch submissions' }));
          throw new Error(errorData.message || `Failed to fetch submissions: ${response.statusText}`);
        }
        const data: Submission[] = await response.json();
        // Sorting is handled by the API now, but could be done here too:
        // data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(data);
      } catch (error: any) {
        console.error("Error fetching submissions:", error);
        setErrorSubmissions(error.message || 'Could not load messages.');
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, []); // Empty dependency array means this runs once on mount

  // ---- START NEW DELETE HANDLER ----
  const handleDeleteSubmission = async (submittedAt: string) => {
    setDeletingSubmissionId(submittedAt);
    setDeleteError(null); // Clear previous delete errors
    try {
      const response = await fetch('/api/submissions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submittedAt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete message' }));
        throw new Error(errorData.message || `Failed to delete: ${response.statusText}`);
      }

      // Remove the deleted submission from the local state
      setSubmissions(prevSubmissions => prevSubmissions.filter(sub => sub.submittedAt !== submittedAt));

    } catch (error: any) {
      console.error("Error deleting submission:", error);
      setDeleteError(error.message || 'Could not delete message.');
      // Optionally show a toast notification here
    } finally {
      setDeletingSubmissionId(null); // Clear deleting state regardless of outcome
    }
  };
  // ---- END NEW DELETE HANDLER ----


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Admin Dashboard</h1>

      {/* Update grid-cols to 6 for the new tab */}
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-transparent">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          {/* ---- START NEW TAB TRIGGER ---- */}
          <TabsTrigger value="messages">
            <div className="flex items-center gap-2">
              <span>Messages</span>
              {/* Show badge only if not loading and no error */}
              {!isLoadingSubmissions && !errorSubmissions && submissions.length > 0 && (
                 <Badge variant="secondary">{submissions.length}</Badge>
              )}
              {/* Optional: Show loading/error state in badge place */}
              {isLoadingSubmissions && <Loader2 className="h-4 w-4 animate-spin" />}
               {/* Optionally show error icon */}
              {errorSubmissions && !isLoadingSubmissions && <AlertCircle className="h-4 w-4 text-destructive" />}
            </div>
          </TabsTrigger>
          {/* ---- END NEW TAB TRIGGER ---- */}
        </TabsList>

        {/* ---- EDIT: Replace Home Tab Content with Link Card ---- */}
        <TabsContent value="home" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Home Page Management</CardTitle>
              <CardDescription>Edit content for the public homepage sections.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p>Manage the Hero, About Summary, and Call to Action sections displayed on your main landing page.</p>
                {/* This button now links to the dedicated page */}
                <Button asChild>
                  <Link href="/admin/home">Go to Home Page Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ---- END EDIT ---- */}

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Members Management</CardTitle>
              <CardDescription>Add, edit, or remove members</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure this uses the correctly imported MembersAdminClient */}
              <MembersAdminClient />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Management</CardTitle>
              <CardDescription>Upload and organize photos</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Replace placeholder with a link to the gallery admin page */}
              <div className="flex flex-col space-y-4">
                <p>Manage your photo gallery albums and images.</p>
                <Button asChild>
                  <Link href="/admin/gallery">Go to Gallery Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About Page Management</CardTitle>
              <CardDescription>Edit content for the About page</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Replace placeholder with a link to the about admin page */}
              <div className="flex flex-col space-y-4">
                <p>Manage your About page content including mission, vision, and values.</p>
                <Button asChild>
                  <Link href="/admin/about">Go to About Page Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add this section for the Contact Tab */}
        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Page Management</CardTitle>
              <CardDescription>Update contact details, map, and form settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p>Manage the information displayed on your public Contact Us page.</p>
                <Button asChild>
                  <Link href="/admin/contact">Go to Contact Management</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- START UPDATED MESSAGES TAB CONTENT ---- */}
        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Messages</CardTitle>
              <CardDescription>Messages submitted through the contact form.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Loading and Fetch Error states remain the same */}
              {isLoadingSubmissions && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading messages...
                </div>
              )}
              {errorSubmissions && !isLoadingSubmissions && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded flex items-center gap-2">
                   <AlertCircle className="h-5 w-5" /> {errorSubmissions}
                </div>
              )}
              {/* Optional: Display delete error */}
               {deleteError && (
                <div className="mt-4 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded flex items-center gap-2">
                   <AlertCircle className="h-5 w-5" /> {deleteError}
                </div>
              )}
              {/* No messages state remains the same */}
              {!isLoadingSubmissions && !errorSubmissions && submissions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No messages received yet.</p>
              )}
              {!isLoadingSubmissions && !errorSubmissions && submissions.length > 0 && (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.submittedAt} className="border shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          {/* Submission details */}
                          <div>
                            <CardTitle className="text-base font-semibold">{submission.name}</CardTitle>
                            <a href={`mailto:${submission.email}`} className="text-sm text-muted-foreground hover:underline">
                              {submission.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                                 {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                              {/* ---- START DELETE BUTTON & DIALOG FIX ---- */}
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  {/* Ensure the Button component is correctly closed and attributes are complete */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    disabled={deletingSubmissionId === submission.submittedAt} // Check this line
                                  >
                                    {/* Show loader when this specific item is deleting */}
                                    {deletingSubmissionId === submission.submittedAt ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the message from "{submission.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    {/* Disable Cancel while deleting */}
                                    <AlertDialogCancel disabled={deletingSubmissionId === submission.submittedAt}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className={buttonVariants({ variant: "destructive" })}
                                        onClick={(e) => {
                                            // Prevent dialog closing immediately if the delete function is async and we want to show loading
                                            e.preventDefault();
                                            handleDeleteSubmission(submission.submittedAt);
                                        }}
                                        disabled={deletingSubmissionId === submission.submittedAt}
                                    >
                                      {/* Show different text while deleting */}
                                      {deletingSubmissionId === submission.submittedAt ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              {/* ---- END DELETE BUTTON & DIALOG FIX ---- */}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* ---- END UPDATED MESSAGES TAB CONTENT ---- */}

        {/* ... Settings tab content (if applicable) ... */}
      </Tabs>
    </div>
  );
}