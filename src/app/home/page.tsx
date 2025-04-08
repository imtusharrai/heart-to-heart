// Ensure this import matches the EXACT casing of the component filename
// Remove the .tsx extension and ensure 'HomeClientWrapper' has the correct casing
import { HomeClientWrapper } from "@/components/HomeClientWrapper"; // Corrected import - Make sure the actual file name casing is exactly this.
import { MemberImageCard } from "@/components/MemberImageCard";
import { HomeData } from "@/app/api/home/route"; // Ensure this import exists
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  role: string; // Ensure roles like "President", "General Secretary", "Treasurer" exist in your data
  bio: string;
  imageUrl: string;
}

// Function to fetch members
async function getMembers(): Promise<Member[]> {
  // Use environment variable for API URL, fallback to localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/members';
  try {
    // Use revalidation instead of 'no-store' for better performance
    // Revalidate every 15 minutes (900 seconds)
    const res = await fetch(apiUrl, { next: { revalidate: 900 } });
    if (!res.ok) {
        // Log more details on failure
        const errorText = await res.text().catch(() => 'Failed to read error body');
        console.error(`Failed to fetch members: ${res.status} ${res.statusText} - ${errorText}`);
        throw new Error(`Failed to fetch members: ${res.statusText}`);
    }
    const data = await res.json(); // Expecting { headline: ..., members: [...] }

    // --- CHANGE: Check the object structure and extract the members array ---
    // Check if data is an object and has a 'members' property which is an array
    if (data && typeof data === 'object' && Array.isArray(data.members)) {
        return data.members as Member[]; // Return the array from the object
    } else {
      console.error("Fetched members data is not the expected object format or 'members' is not an array:", data);
      // Don't throw an error, just return empty to allow the page to render
      return [];
    }
    // --- END CHANGE ---

  } catch (error) {
    console.error("Error fetching members:", error);
    return []; // Return empty array on any fetch or processing error
  }
}

// Function to fetch home data
async function getHomeData(): Promise<HomeData> {
  // Use environment variable for API URL, fallback to localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/home';
  // Default structure used on error or if data is incomplete
  const defaultData: HomeData = {
      siteTitle: "Heart2Heart Welfare",
      hero: { headline: "Welcome", description: "...", button1Text: 'Learn More', button1Link: '/about', button2Text: 'Contact', button2Link: '/contact', backgroundImage: "/images/default-hero.jpg" },
      aboutSummary: { title: 'About Us', description: '...', buttonText: 'Read More', buttonLink: '/about' },
      cta: { title: 'Get Involved', description: '...', button1Text: 'Volunteer', button1Link: '/volunteer', button2Text: 'Donate Now', button2Link: '/donate' },
      featuredMemberIds: [] // Ensure default includes the array
  };
  try {
    // Use revalidation (e.g., every 15 minutes) - restore this for production
    const res = await fetch(apiUrl, { next: { revalidate: 900 } });
    // Or use 'no-store' for testing if needed
    // const res = await fetch(apiUrl, { cache: 'no-store' }); // Temporarily disable cache

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Failed to read error response');
        console.error(`Failed to fetch home data: ${res.status} ${res.statusText} - ${errorText}`);
        // Return default data on fetch failure to keep the page working
        return defaultData;
    }
    const data = await res.json();

    // --- CHANGE: Ensure all fields, including featuredMemberIds, are included ---
    // Validate the structure slightly, provide defaults if necessary
     return {
        siteTitle: data.siteTitle || defaultData.siteTitle,
        hero: { ...defaultData.hero, ...(data.hero || {}) },
        aboutSummary: { ...defaultData.aboutSummary, ...(data.aboutSummary || {}) },
        cta: { ...defaultData.cta, ...(data.cta || {}) },
        // Ensure featuredMemberIds is included and is an array
        featuredMemberIds: Array.isArray(data.featuredMemberIds) ? data.featuredMemberIds : defaultData.featuredMemberIds
    };
    // --- END CHANGE ---

  } catch (error) {
    console.error("Error fetching home data:", error);
    return defaultData; // Return default data on error
  }
}

// The main page component
export default async function HomePage() {
  // Fetch data concurrently
  const [allMembers, homeData] = await Promise.all([
    getMembers(), // Fetches all members [{ id, name, ... }]
    getHomeData() // Fetches home config { siteTitle, hero, ..., featuredMemberIds: [...] }
  ]);

  // --- Logic to filter members based on IDs stored in homeData.featuredMemberIds ---
  // (This part should already be correct from the previous update)
  const featuredIds = Array.isArray(homeData.featuredMemberIds) ? homeData.featuredMemberIds : [];

  // Create a map for quick lookup
  const memberMap = new Map(allMembers.map(member => [member.id, member]));

  // Get the featured members based on the stored IDs, maintaining the order from featuredIds
  const featuredMembers = featuredIds
      .map(id => memberMap.get(id)) // Get member object by ID
      .filter((member): member is Member => member !== undefined); // Filter out any undefined results

  // --- Define the Team Section JSX ---
  // (This part should also be correct)
  const teamSection = (
    <section className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Meet Our Featured Team</h2>
        <div className={`grid grid-cols-1 ${featuredMembers.length > 1 ? 'md:grid-cols-2' : ''} ${featuredMembers.length > 2 ? 'lg:grid-cols-3' : ''} gap-8 justify-center`}>
          {featuredMembers.length > 0 ? (
            featuredMembers.map((member) => (
              <MemberImageCard key={member.id} member={member} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              No featured team members selected or found.
            </p>
          )}
        </div>
        {/* Button to view all members */}
        {allMembers.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/members">View All Members</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );

  // --- Render the wrapper, passing the teamSection as a prop ---
  // (This part remains unchanged)
  return (
    <>
      <HomeClientWrapper homeData={homeData} teamSection={teamSection} />
    </>
  );
}