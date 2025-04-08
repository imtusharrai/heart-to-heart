import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// Define the structure based on likely submission fields
interface Submission {
  id?: string; // Firestore ID
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt?: Timestamp;
  // Add any other fields from your contact form / submissions.json
}

// Firestore details
const SUBMISSIONS_COLLECTION = 'submissions';

// --- GET Handler ---
// Fetches all submissions (potentially password-protected or admin-only in a real app)
export async function GET() {
  try {
    const submissionsCol = firestore.collection(SUBMISSIONS_COLLECTION);
    const snapshot = await submissionsCol.orderBy('submittedAt', 'desc').get(); // Sort by submission time

    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const submissions: Submission[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Convert timestamp if needed
      const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt;
      submissions.push({
        id: doc.id,
        ...data,
        submittedAt: submittedAt
      } as Submission);
    });

    return NextResponse.json(submissions);

  } catch (error) {
    console.error("Firestore GET Error (Submissions):", error);
    return NextResponse.json({ message: 'Failed to fetch submissions.' }, { status: 500 });
  }
}


// --- POST Handler ---
// Adds a single new submission or batch-adds submissions if request body is an array
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const submissionsToAdd: Submission[] = Array.isArray(payload) ? payload : [payload];

    if (submissionsToAdd.length === 0 || !submissionsToAdd.every(s => typeof s === 'object' && s !== null)) {
       return NextResponse.json({ message: 'Invalid data format. Expecting object or array of objects.' }, { status: 400 });
    }

    const batch = firestore.batch();
    const now = Timestamp.now();

    submissionsToAdd.forEach(submissionData => {
      // Basic validation (expand as needed)
      if (!submissionData.name || !submissionData.email || !submissionData.message) {
          throw new Error(`Incomplete data for submission: ${JSON.stringify(submissionData)}`);
      }
      const docRef = firestore.collection(SUBMISSIONS_COLLECTION).doc(); // Firestore generates ID
      const dataWithTimestamp = {
          ...submissionData,
          // Use existing timestamp if provided (during migration), otherwise set new one
          submittedAt: submissionData.submittedAt instanceof Timestamp ? submissionData.submittedAt :
                       (submissionData.submittedAt ? Timestamp.fromDate(new Date(submissionData.submittedAt)) : now)
      };
      delete dataWithTimestamp.id; // Remove original ID if present
      batch.set(docRef, dataWithTimestamp);
    });

    await batch.commit();

    const message = submissionsToAdd.length > 1 ? `${submissionsToAdd.length} submissions added successfully!` : 'Submission added successfully!';
    return NextResponse.json({ success: true, message: message });

  } catch (error: any) {
    console.error("Firestore POST Error (Submissions):", error);
    return NextResponse.json({ message: `Error adding submission(s): ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}