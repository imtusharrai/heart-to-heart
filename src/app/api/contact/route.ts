import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { firestore } from '@/lib/firebaseAdmin'; // Import initialized Firestore instance

// Define the structure based on contact.json
interface ContactData {
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string; // Added example
    linkedin?: string;
  };
  email?: string;
  phone?: string;
  address?: string;
  mapEmbedUrl?: string;
  mapEnabled?: boolean;
  formEnabled?: boolean;
  contactHeadline?: string;
  contactDescription?: string;
  [key: string]: any; // Allow other fields
}

// Firestore details
const SITE_CONFIG_COLLECTION = 'siteConfig'; // Use the same collection
const CONTACT_DOC_ID = 'contactData';        // Specific document for Contact content

// Define default data (optional, based on your needs)
const defaultContactData: ContactData = {
  email: "",
  phone: "",
  address: "",
  mapEnabled: false,
  formEnabled: true,
  contactHeadline: "Get In Touch",
  contactDescription: "Reach out with any questions.",
  socialLinks: {}
};

// --- GET Handler ---
export async function GET() {
  try {
    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(CONTACT_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(`Document ${CONTACT_DOC_ID} not found in ${SITE_CONFIG_COLLECTION}. Returning default.`);
      return NextResponse.json(defaultContactData);
    }

    const data = docSnap.data() as ContactData;
    const mergedData = { ...defaultContactData, ...data }; // Ensure defaults are present
    return NextResponse.json(mergedData);

  } catch (error) {
    console.error("Firestore GET Error (Contact):", error);
    return NextResponse.json(defaultContactData, { status: 500, statusText: 'Failed to fetch contact data.' });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    const newData: ContactData = await request.json();

    // Optional: Add validation
    if (!newData || typeof newData !== 'object') {
        return NextResponse.json({ message: 'Invalid data format provided.' }, { status: 400 });
    }

    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(CONTACT_DOC_ID);
    await docRef.set(newData, { merge: true });

    return NextResponse.json({ success: true, message: 'Contact data saved successfully!' });
  } catch (error) {
    console.error("Firestore POST Error (Contact):", error);
    return NextResponse.json(
      { message: 'Failed to save contact content.' },
      { status: 500 }
    );
  }
}

// Remove old read/write functions using fs