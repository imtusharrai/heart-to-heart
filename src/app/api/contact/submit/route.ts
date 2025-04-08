import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the submissions file
const submissionsFilePath = path.resolve(process.cwd(), 'src/data/submissions.json');

interface SubmissionData {
  name: string;
  email: string;
  message: string;
  submittedAt: string; // Add a timestamp
}

// Helper function to read existing submissions
async function readSubmissions(): Promise<SubmissionData[]> {
  try {
    await fs.access(submissionsFilePath); // Check if file exists
    const fileData = await fs.readFile(submissionsFilePath, 'utf-8');
    return JSON.parse(fileData) as SubmissionData[];
  } catch (error: any) {
    // If file doesn't exist or is empty/invalid JSON, return empty array
    if (error.code === 'ENOENT') {
        console.log('Submissions file not found, creating a new one.');
        await fs.writeFile(submissionsFilePath, '[]', 'utf-8'); // Create file if it doesnt exist
        return [];
    } else if (error instanceof SyntaxError) {
        console.error('Error parsing submissions file, initializing as empty array:', error);
         await fs.writeFile(submissionsFilePath, '[]', 'utf-8'); // Reset if corrupted
        return [];
    }
    console.error('Error reading submissions file:', error);
    throw new Error('Could not read submissions.'); // Re-throw other errors
  }
}

// Handler for POST requests (submit form)
export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { name, email, message } = formData;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ message: 'Missing required fields (name, email, message).' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const newSubmission: SubmissionData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    // ---- Core Logic for Multiple Submissions ----
    // 1. Read the current array from the file
    const submissions = await readSubmissions();

    // 2. Add the newly received submission to that array
    submissions.push(newSubmission);

    // 3. Write the entire updated array back to the file
    await fs.writeFile(submissionsFilePath, JSON.stringify(submissions, null, 2), 'utf-8');
    // ---- End Core Logic ----

    return NextResponse.json({ message: 'Submission received successfully!' });

  } catch (error) {
    console.error('Failed to process submission:', error);
    return NextResponse.json({ message: 'Failed to process submission.' }, { status: 500 });
  }
}