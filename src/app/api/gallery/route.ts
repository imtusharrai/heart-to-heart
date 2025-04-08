import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

const SITE_CONFIG_COLLECTION = 'siteConfig';
const GALLERY_DOC_ID = 'galleryData';

interface GalleryAlbum {
  id: string;
  albumName: string;
  description: string;
  date: string | Timestamp;
  createdAt: string | Timestamp;
}

interface GalleryImage {
  id: string;
  url: string;
  albumId: string;
  caption: string;
  date: string | Timestamp;
  createdAt: string | Timestamp;
}

interface GalleryData {
  albums: GalleryAlbum[];
  images: GalleryImage[];
  updatedAt?: Timestamp;
}

export async function GET() {
  try {
    const docRef = firestore.collection(SITE_CONFIG_COLLECTION).doc(GALLERY_DOC_ID);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ albums: [], images: [] });
    }

    const data = docSnap.data() as GalleryData;
    
    // Convert Timestamps to ISO strings
    const processedData = {
      albums: data.albums.map(album => ({
        ...album,
        date: album.date instanceof Timestamp ? album.date.toDate().toISOString() : album.date,
        createdAt: album.createdAt instanceof Timestamp ? album.createdAt.toDate().toISOString() : album.createdAt
      })),
      images: data.images.map(image => ({
        ...image,
        date: image.date instanceof Timestamp ? image.date.toDate().toISOString() : image.date,
        createdAt: image.createdAt instanceof Timestamp ? image.createdAt.toDate().toISOString() : image.createdAt
      }))
    };

    return NextResponse.json(processedData);

  } catch (error) {
    console.error("Firestore GET Error (Gallery):", error);
    return NextResponse.json(
      { message: 'Failed to fetch gallery data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { albums, images } = await request.json();

    if (!Array.isArray(albums) || !Array.isArray(images)) {
      return NextResponse.json(
        { message: 'Invalid data format' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const dataToSave = {
      albums: albums.map(album => ({
        ...album,
        date: Timestamp.fromDate(new Date(album.date)),
        createdAt: Timestamp.fromDate(new Date(album.createdAt))
      })),
      images: images.map(image => ({
        ...image,
        date: Timestamp.fromDate(new Date(image.date)),
        createdAt: Timestamp.fromDate(new Date(image.createdAt))
      })),
      updatedAt: now
    };

    await firestore
      .collection(SITE_CONFIG_COLLECTION)
      .doc(GALLERY_DOC_ID)
      .set(dataToSave, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Firestore POST Error (Gallery):", error);
    return NextResponse.json(
      { message: 'Failed to save gallery data' },
      { status: 500 }
    );
  }
}