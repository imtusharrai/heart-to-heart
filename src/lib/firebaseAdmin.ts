import * as admin from 'firebase-admin';

// Check if the app is already initialized
if (!admin.apps.length) {
  try {
    // Option 1: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    // Ensure this variable is set to the path of your service account key file
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Add your databaseURL if needed, though usually inferred with applicationDefault
      // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com' 
    });

    // Option 2: Use environment variable containing the JSON key content
    /*
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'
    });
    */

    console.log('Firebase Admin SDK Initialized');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // Avoid exiting the process in a serverless environment
    // process.exit(1); 
  }
} else {
  console.log('Firebase Admin SDK already initialized.');
}


export const firestore = admin.firestore();
export default admin; // Export the initialized admin instance if needed elsewhere