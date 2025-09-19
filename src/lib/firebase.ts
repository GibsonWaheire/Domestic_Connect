// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByEOXRuou5dtG1whWkG5uLhvbqbEm7AXw",
  authDomain: "domesticconnect-e1955.firebaseapp.com",
  projectId: "domesticconnect-e1955",
  storageBucket: "domesticconnect-e1955.firebasestorage.app",
  messagingSenderId: "893320295714",
  appId: "1:893320295714:web:8e439f859a8ad891d1617b",
  measurementId: "G-S6Z7459TB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to Firebase emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
