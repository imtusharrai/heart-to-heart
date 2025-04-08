"use client"; // Mark this as a Client Component

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from 'react';
import Loading from '@/app/loading'; // Assuming Loading component is compatible or adjust as needed

// Define the Member interface (can also be imported from a shared types file)
interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

// Helper function (can also be imported)
const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
};

// Define props for the component
interface MemberImageCardProps {
  member: Member;
}

export function MemberImageCard({ member }: MemberImageCardProps) {
  const isUrlValid = isValidUrl(member.imageUrl);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Error loading image for ${member.name} from src: ${member.imageUrl}`, e.target);
  };

  return (
    <Card key={member.id} className="overflow-hidden flex flex-col">
      {/* Removed bg-gray-200 from this div */}
      <div className="relative h-64 w-full">
        {isUrlValid ? (
          <Image
            src={member.imageUrl!}
            alt={`Photo of ${member.name}`}
            fill
            style={{ objectFit: 'contain' }} // Or 'cover' if you reverted
            onError={handleImageError}
          />
        ) : (
          // The placeholder div remains, but its parent container no longer has a grey background
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-center px-4">Image URL invalid</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{member.name}</CardTitle>
        <CardDescription>{member.role}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3">{member.bio}</p>
      </CardContent>
      <CardFooter>
        {/* Suspense might still be useful here if Link/Button have client needs */}
        <Suspense fallback={<div className="h-10 w-full bg-gray-300 animate-pulse rounded"></div>}> 
          <Link href={`/members/${encodeURIComponent(member.name.toLowerCase().replace(/\s+/g, '-'))}`}>
            <Button variant="outline" className="w-full">
              Read Full Profile
            </Button>
          </Link>
        </Suspense>
      </CardFooter>
    </Card>
  );
}