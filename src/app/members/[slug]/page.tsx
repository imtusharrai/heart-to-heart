import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Suspense } from 'react';
import Loading from '@/app/loading';

// Define the Member interface
interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

// Function to fetch a single member by slug (name)
// Renamed function and updated logic to find by name slug
async function getMemberBySlug(slug: string): Promise<Member | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/members';
  try {
    const res = await fetch(apiUrl, { next: { revalidate: 900 } });
    
    if (!res.ok) throw new Error(`Failed to fetch members: ${res.statusText}`);
    
    // Get the full response and extract members array
    const response = await res.json();
    const members = response.members; // Access the members array from the response object
    
    // Add validation for members array
    if (!Array.isArray(members)) {
      console.error('API response members is not an array:', response);
      return null;
    }
    
    return members.find((member) => {
      const memberSlug = member.name.toLowerCase().replace(/\s+/g, '-');
      return memberSlug === decodeURIComponent(slug);
    }) || null;

  } catch (error) {
    console.error("Error fetching member:", error);
    return null;
  }
}

// Update parameter name from 'id' to 'slug'
export default async function MemberDetailPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      {/* Pass slug to the content component */}
      <MemberContent slug={params.slug} />
    </Suspense>
  );
}

// Update parameter name from 'id' to 'slug' and call getMemberBySlug
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';


async function MemberContent({ slug }: { slug: string }) {
  const member = await getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    // --- EDIT: Use Container for consistent padding/width ---
    // Removed padding from main, added to Container
    <main className="flex min-h-screen flex-col items-center bg-background">
      <Container className="py-8 md:py-16 w-full"> {/* Use Container */}
        <div className="w-full max-w-4xl mx-auto"> {/* Keep inner max-width for content focus */}
          <div className="mb-6">
             <Link href="/members" passHref>
               <Button variant="ghost">
                 ← Back to Members
               </Button>
             </Link>
          </div>

          {/* Card for Member Details */}
          <div className="bg-card shadow-lg rounded-lg overflow-hidden">
             {/* Consider responsive layout inside card: Image left, text right on md+? */}
             <div className="md:flex">
                <div className="md:flex-shrink-0 p-4 flex justify-center md:block">
                   <Image
                      src={member.imageUrl}
                      alt={member.name}
                      width={200} // Adjust size as needed
                      height={200}
                      className="rounded-lg object-cover w-40 h-40 md:w-48 md:h-48" // Responsive size example
                   />
                </div>
                <div className="p-6 md:p-8">
                   {/* Responsive text size */}
                   <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{member.name}</h1>
                   <p className="text-lg text-muted-foreground mb-4">{member.role}</p>
                   <p className="text-base leading-relaxed">{member.bio}</p>
                </div>
             </div>
          </div>
        </div>
      </Container>
    </main>
    // --- EDIT END ---
  );
}