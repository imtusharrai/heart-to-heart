// Remove fs and path imports
// import { promises as fs } from 'fs';
// import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin'; // Import initialized Firestore instance

// Define the structure of the homepage data
export interface HomeData {
  siteTitle: string;
  hero: {
    headline: string;
    description: string;
    button1Text: string;
    button1Link: string;
    button2Text: string;
    button2Link: string;
    backgroundImage: string;
  };
  aboutSummary: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  cta: {
    title: string;
    description: string;
    button1Text: string;
    button1Link: string;
    button2Text: string;
    button2Link: string;
  };
  featuredMemberIds: string[]; // Add field for featured member IDs
}

// Define Firestore details
const SITE_CONFIG_COLLECTION = 'siteConfig';
const HOME_DOC_ID = 'homeData';

// Default data remains useful for initialization or errors
const defaultHomeData: HomeData = {
  siteTitle: "Heart2Heart Welfare",
  hero: {
    headline: 'Welcome',
    description: '...',
    button1Text: 'Learn More',
    button1Link: '/about',
    button2Text: 'Contact',
    button2Link: '/contact',
    backgroundImage: '/images/default-hero.jpg' // Default image if none found
  },
  aboutSummary: { title: 'About Us', description: '...', buttonText: 'Read More', buttonLink: '/about' },
  cta: { title: 'Get Involved', description: '...', button1Text: 'Volunteer', button1Link: '/volunteer', button2Text: 'Donate Now', button2Link: '/donate' }
};


// --- GET Handler ---
export async function GET() {
  try {
    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(HOME_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`Document ${HOME_DOC_ID} not found in ${SITE_CONFIG_COLLECTION}. Returning default data.`);
      return NextResponse.json(defaultHomeData);
    }

    const data = docSnap.data() as HomeData;
    // Merge with defaults to ensure all fields exist
    const mergedData = {
        ...defaultHomeData, // Start with defaults
        ...data,            // Overwrite with fetched data
        hero: {             // Deep merge hero
            ...defaultHomeData.hero,
            ...(data.hero || {}),
            backgroundImage: data.hero?.backgroundImage || defaultHomeData.hero.backgroundImage
        },
        aboutSummary: { ...defaultHomeData.aboutSummary, ...(data.aboutSummary || {}) }, // Deep merge about
        cta: { ...defaultHomeData.cta, ...(data.cta || {}) },                           // Deep merge cta
        featuredMemberIds: data.featuredMemberIds || [] // Ensure featuredMemberIds exists, default to empty array
    };
    return NextResponse.json(mergedData);

  } catch (error) {
    console.error("Firestore GET Error (Home):", error);
    return NextResponse.json(defaultHomeData, { status: 500, statusText: 'Failed to fetch homepage data from database.' });
  }
}


// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    // Expect the full HomeData structure potentially, but allow partial updates via merge
    const newData: Partial<HomeData> = await request.json();

    if (!newData || typeof newData !== 'object') {
        return NextResponse.json({ message: 'Invalid data format provided.' }, { status: 400 });
    }

    // Ensure featuredMemberIds is an array if provided, otherwise default handling applies
    if (newData.featuredMemberIds && !Array.isArray(newData.featuredMemberIds)) {
       return NextResponse.json({ message: 'Invalid data format for featuredMemberIds.' }, { status: 400 });
    }


    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(HOME_DOC_ID);
    await docRef.set(newData, { merge: true }); // Use merge: true

    return NextResponse.json({ message: 'Homepage data updated successfully!' });
  } catch (error) {
    console.error("Firestore POST Error (Home):", error);
    return NextResponse.json({ message: 'Error saving homepage data to database' }, { status: 500 });
  }
}

// Remove the old readHomeData and writeHomeData functions using fs/path