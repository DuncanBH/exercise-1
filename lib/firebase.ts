import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, DocumentSnapshot, getDocs, getFirestore, limit, query, where } from "firebase/firestore";

// Initialize firebase
const firebaseApp = initializeApp(firebaseConfig);

// Firestore exports
export const firestore = getFirestore(firebaseApp);

//Auth Exports
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export default firebaseApp;


/// Helper functions

/**
 * Gets a user/{uid} document with username
 * @param {string} username
 */
export async function getUserWithUsername(username: string) {
    const q = query(
        collection(firestore, 'users'),
        where('username', '==', username),
        limit(1)
    )

    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

/**
 * Converts a firestore document to JSON
 * @param {DocumentSnapshot} doc 
 */
export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        createdAt: data?.createdAt.toMillis() || 0,
        updatedAt: data?.updatedAt.toMillis() || 0,
    }
}