import { NextRequest, NextResponse } from 'next/server';
// Remove fs and path imports
// import fs from 'fs';
// import path from 'path';
import { firestore } from '@/lib/firebaseAdmin'; // Import initialized Firestore instance

// Define a basic structure for About data (adjust based on your actual about.json structure)
interface AboutData {
  title?: string;
  sections?: Array<{ title?: string; content?: string }>;
  // Add other fields based on your actual about.json structure
  [key: string]: any; // Allow arbitrary fields if structure is flexible
}

// Firestore details
const SITE_CONFIG_COLLECTION = 'siteConfig'; // Use the same collection
const ABOUT_DOC_ID = 'aboutData';          // Specific document for About content

// Define default data (optional, but good for fallbacks)
const defaultAboutData: AboutData = {
  title: "About Us",
  sections: [{ title: "Our Mission", content: "..." }]
};

// --- GET Handler ---
export async function GET() {
  try {
    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(ABOUT_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(`Document ${ABOUT_DOC_ID} not found in ${SITE_CONFIG_COLLECTION}. Returning default data.`);
      // You might want to return an empty object or specific default state
      return NextResponse.json(defaultAboutData);
    }

    const data = docSnap.data() as AboutData;
    // Merge with defaults if your structure requires it
    const mergedData = { ...defaultAboutData, ...data };
    return NextResponse.json(mergedData);

  } catch (error) {
    console.error("Firestore GET Error (About):", error);
    // Return default or empty object on error
    return NextResponse.json(defaultAboutData, { status: 500, statusText: 'Failed to fetch about page data from database.' });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const newData: AboutData = await request.json();

    // Optional: Add validation for newData format/content
     if (!newData || typeof newData !== 'object') {
        return NextResponse.json({ message: 'Invalid data format provided.' }, { status: 400 });
    }

    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(ABOUT_DOC_ID);
    // Use set with merge: true to update/overwrite fields, or just set() to replace the whole document
    await docRef.set(newData, { merge: true });

    // Return success response
    return NextResponse.json({ success: true, message: 'About data saved successfully!' });
  } catch (error) {
    console.error("Firestore POST Error (About):", error);
    return NextResponse.json(
      { message: 'Failed to save about content to database' },
      { status: 500 }
    );
  }
}