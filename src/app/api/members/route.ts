import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// Define the structure of a single member
interface Member {
  id: string; // Keep original ID for initial load
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  // Add other member fields if needed
}

// Define the structure of the membersData document
interface MembersDataDocument {
  headline: string;
  description: string;
  callToAction: string;
  members: Member[];
  updatedAt?: Timestamp; // Track updates
}

// Firestore details
const SITE_CONFIG_COLLECTION = 'siteConfig';
const MEMBERS_DOC_ID = 'membersData';

// Default structure if document doesn't exist
const defaultMembersData: MembersDataDocument = {
  headline: 'Our Team',
  description: 'Meet the dedicated members of our team.',
  callToAction: 'Join Us',
  members: [],
};

// --- GET Handler ---
// Fetches the entire members section data from the single document
export async function GET() {
  try {
    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(MEMBERS_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(`Document ${MEMBERS_DOC_ID} not found in ${SITE_CONFIG_COLLECTION}. Returning default structure.`);
      return NextResponse.json({ ...defaultMembersData, updatedAt: Timestamp.now().toDate().toISOString() });
    }

    const data = docSnap.data() as MembersDataDocument;

    // Convert Timestamp to ISO string before sending (optional)
    const dataToSend = {
      ...data,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : undefined,
    };

    // ---- DEBUG LOGGING ----
    console.log("API /api/members - Data fetched from Firestore:", data);
    console.log("API /api/members - Data being sent to client:", dataToSend);
    // Check specifically if 'members' is an array *before* sending
    console.log("API /api/members - Is dataToSend.members an array?:", Array.isArray(dataToSend.members));
    // ---- END DEBUG LOGGING ----


    return NextResponse.json(dataToSend);

  } catch (error) {
    console.error("Firestore GET Error (Members Document):", error);
    return NextResponse.json(
      { message: 'Failed to fetch members data.' },
      { status: 500 }
    );
  }
}

// --- POST Handler ---
// Overwrites the entire membersData document with the provided payload.
// Assumes payload matches the MembersDataDocument structure.
export async function POST(request: NextRequest) {
  try {
    // We expect the exact structure from members.json
    const payload: MembersDataDocument = await request.json();

    // Basic validation
    if (!payload || typeof payload.headline !== 'string' || !Array.isArray(payload.members)) {
      return NextResponse.json({ message: 'Invalid payload structure. Expecting { headline: "", description: "", callToAction: "", members: [...] }.' }, { status: 400 });
    }

    // Prepare data for Firestore (ensure IDs are present, add timestamp)
    const now = Timestamp.now();
    const membersToSave = payload.members.map(member => ({
      ...member,
      id: member.id, // Keep original ID from the JSON
    }));

    const dataToSave: MembersDataDocument = {
      headline: payload.headline,
      description: payload.description,
      callToAction: payload.callToAction,
      members: membersToSave,
      updatedAt: now, // Set the update timestamp
    };

    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(MEMBERS_DOC_ID);
    // Use set() to completely overwrite the document
    await docRef.set(dataToSave);

    return NextResponse.json({ success: true, message: 'Members data saved successfully!' });

  } catch (error: any) {
    console.error("Firestore POST Error (Members Document):", error);
    return NextResponse.json({ message: `Error saving members data: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}