import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBTKlQb9JaFs2j98VaUPozEojxgp8tOvso",
  authDomain: "coinburst-5bdc5.firebaseapp.com",
  databaseURL: "https://coinburst-5bdc5-default-rtdb.firebaseio.com",
  projectId: "coinburst-5bdc5",
  storageBucket: "coinburst-5bdc5.firebasestorage.app",
  messagingSenderId: "44180464714",
  appId: "1:44180464714:web:8bb56db76346b0b26632b3",
  measurementId: "G-6EWFMDMX7H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(result.user, { displayName: name });
  return result.user;
};

export const signInWithEmail = async (email: string, pass: string) => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export { updateProfile };
