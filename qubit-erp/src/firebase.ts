import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
}) : getApp();

// Use the specific firestoreDatabaseId from config
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
const auth = getAuth(app);

export { db, auth };

// Sign in anonymously and return user ID
export async function authenticateUser(): Promise<string> {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch (error) {
    console.warn("Firebase authentication failed, falling back to LocalStorage:", error);
    return "local-fallback-user";
  }
}

// ---------------------------------------------------------
// Helper functions with LocalStorage Fallback
// ---------------------------------------------------------

const IS_LOCAL_KEY = "qubit_erp_use_local";

export function isUsingLocalFallback(): boolean {
  return localStorage.getItem(IS_LOCAL_KEY) === "true";
}

export function setUseLocalFallback(value: boolean) {
  localStorage.setItem(IS_LOCAL_KEY, value ? "true" : "false");
}
