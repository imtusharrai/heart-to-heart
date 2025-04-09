import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

const SUBMISSIONS_COLLECTION = 'submissions';

interface Submission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

export async function GET() {
  try {
    const submissionsRef = firestore.collection(SUBMISSIONS_COLLECTION);
    const snapshot = await submissionsRef.orderBy('submittedAt', 'desc').get();

    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const submissions: Submission[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      submissions.push({
        name: data.name,
        email: data.email,
        message: data.message,
        submittedAt: data.submittedAt instanceof Timestamp 
          ? data.submittedAt.toDate().toISOString() 
          : data.submittedAt
      });
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { submittedAt } = await request.json();
    
    if (!submittedAt) {
      return NextResponse.json(
        { message: 'Submission timestamp is required' },
        { status: 400 }
      );
    }

    const submissionsRef = firestore.collection(SUBMISSIONS_COLLECTION);
    const snapshot = await submissionsRef
      .where('submittedAt', '==', submittedAt)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }

    // Delete the first matching document
    await snapshot.docs[0].ref.delete();

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { message: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}