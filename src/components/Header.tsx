import Link from 'next/link';
import React from 'react';
import { ThemeToggleButton } from './theme/ThemeToggleButton';
// Revert to using the path alias for better resolution
import type { HomeData } from '@/app/api/home/route';

// Function to fetch home data (could be moved to a lib/ folder)
async function getHomeData(): Promise<Partial<HomeData>> {
  try {
    // Use absolute URL for server-side fetching if needed, or relative if running on the same domain/port
    // For server components, ensure fetch uses the correct base URL or is configured for local fetches.
    // Using relative URL assuming it works within the Next.js server environment.
    // IMPORTANT: For production, you might need process.env.NEXT_PUBLIC_APP_URL or similar
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Ensure this env var is set
    const response = await fetch(`${baseUrl}/api/home`, {
      // Change from 'no-store' to time-based revalidation (e.g., 1 hour)
      // The site title is unlikely to change often.
      next: { revalidate: 3600 } 
    } as any); // Cast options to any to bypass TS check for 'next' property

    if (!response.ok) {
      console.error(`Failed to fetch home data: ${response.status} ${response.statusText}`);
      return {}; // Return empty object on error
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching header data:", error);
    return {}; // Return empty object on error
  }
}


// Make the Header component async
const Header = async () => {
  const homeData = await getHomeData();
  const siteTitle = homeData?.siteTitle || "Heart2Heart"; // Use fetched title or fallback

  return (
    <header className="bg-background border-b sticky top-0 z-50 transition-colors">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div>
          {/* Use the dynamic siteTitle here */}
          <Link href="/" prefetch={true} className="text-xl font-semibold">
            {siteTitle}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Navigation links remain the same */}
          <Link href="/" prefetch={true} className="text-foreground/80 hover:text-foreground">
            Home
          </Link>
          <Link href="/gallery" prefetch={true} className="text-foreground/80 hover:text-foreground">
            Gallery
          </Link>
          <Link href="/members" prefetch={true} className="text-foreground/80 hover:text-foreground">
            Members
          </Link>
          <Link href="/about" prefetch={true} className="text-foreground/80 hover:text-foreground">
            About
          </Link>
          <Link href="/contact" prefetch={true} className="text-foreground/80 hover:text-foreground">
            Contact
          </Link>

          <ThemeToggleButton />
        </div>
      </nav>
    </header>
  );
};

export default Header;