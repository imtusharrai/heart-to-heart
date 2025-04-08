import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// --- EDIT: Import Container ---
import { Container } from '@/components/Container';


// Define interfaces (Member, MembersData)
interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
}

interface MembersData {
  headline: string;
  description: string;
  callToAction?: string; // Optional based on your API response
  members: Member[];
  updatedAt?: string; // Optional timestamp string
}

// Function to fetch data (getMembersData)
async function getMembersData(): Promise<MembersData | null> {
  let res; // Define res outside try block to access it in catch/finally if needed
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`Fetching members data from: ${baseUrl}/api/members`); // Log URL
    res = await fetch(`${baseUrl}/api/members`, {
      // Temporarily disable caching for debugging
      cache: 'no-store',
    });

    console.log(`Fetch response status: ${res.status} ${res.statusText}`); // Log status

    if (!res.ok) {
      console.error(`Failed to fetch members data: ${res.status} ${res.statusText}`);
       const errorText = await res.text(); // Attempt to get error text
       console.error("Response body on error:", errorText);
      return null;
    }

    // Get raw text first for debugging
    const rawText = await res.text();
    // Log the raw response text immediately after receiving it
    console.log("Raw response text received from /api/members:", rawText);

    // Now try to parse it
    const data = JSON.parse(rawText);

    // Add a type check here too, before returning
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
       console.error("Parsed data is not a valid object:", data); // Log if it's not an object (e.g. if it's [])
       return null; // Treat non-objects (like []) as an error case
    }

    // Cast to MembersData only if it looks like a valid object
    console.log("Parsed data appears to be a valid object:", data); // Log the successfully parsed object
    return data as MembersData;

  } catch (error: any) {
    // Log fetch errors and potentially the response if available
    console.error("Error fetching or parsing members data:", error.message);
     if (res) {
       console.error(`Fetch status on catch: ${res.status} ${res.statusText}`);
       // Using rawText if available from above, otherwise attempt reading again (might fail if body already read)
       console.error("Response text leading to catch (if available):", typeof rawText !== 'undefined' ? rawText : 'N/A');
     }
    return null; // Return null on fetch/parse error
  }
}

// --- Helper function defined OUTSIDE the component ---
const generateSlug = (name: string): string => {
  // It's good practice to add an explicit return type
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
};

// The Page component (Server Component)
// --- EDIT: Define placeholder MemberImageCard component structure ---
// Replace with your actual MemberImageCard component import when ready
const MemberImageCard = ({ member }: { member: Member }) => (
    <div className="border rounded-lg p-4 shadow-sm bg-card">
        {member.imageUrl && (
            <Image src={member.imageUrl} alt={member.name} width={150} height={150} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"/>
        )}
        <h3 className="text-lg font-semibold text-center">{member.name}</h3>
        <p className="text-sm text-muted-foreground text-center mb-2">{member.role}</p>
        <p className="text-xs text-center text-muted-foreground mb-3 line-clamp-3">{member.bio}</p>
        <Link href={`/members/${member.name.toLowerCase().replace(/\s+/g, '-')}`} passHref className="block mx-auto w-fit">
            <Button variant="link" size="sm">View Profile →</Button>
        </Link>
    </div>
);
// --- EDIT END ---


export default async function MembersPage() {
  const data = await getMembersData();

  return (
    // --- EDIT: Use Container and apply responsive classes ---
    <main className="bg-background min-h-screen">
      <Container className="py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          {/* Responsive text sizes */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Our Team</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {data.description}
          </p>
          {data.callToAction && (
            <Button asChild className="mt-6" size="lg">
              <Link href="/contact">{data.callToAction}</Link>
            </Button>
          )}
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.members.map((member) => (
            <MemberImageCard key={member.id} member={member} />
          ))}
        </div>
      </Container>
    </main>
    // --- EDIT END ---
  );
}