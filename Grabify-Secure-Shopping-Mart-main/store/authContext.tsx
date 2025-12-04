'use client';

/**
 * ============================================================================
 * AUTH CONTEXT - Firebase Authentication Provider
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/database/firebaseConfig';
import { useStore } from './useStore';
import toast from 'react-hot-toast';

interface UserData {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, role?: 'admin' | 'user') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser, clearCart } = useStore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const userData: UserData = {
              uid: user.uid,
              email: data.email,
              role: data.role,
            };
            setUserData(userData);
            setUser(userData);
          } else {
            // User document doesn't exist, create it
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email || '',
              role: 'user',
            };
            
            await setDoc(userRef, {
              ...newUserData,
              createdAt: Timestamp.now(),
            });
            
            setUserData(newUserData);
            setUser(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  // Sign up
  const signUp = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Create user document in Firestore with the specified role
      const userRef = doc(db, 'users', userCredential.user.uid);
      const newUserData: UserData = {
        uid: userCredential.user.uid,
        email,
        role, // Use the role parameter (defaults to 'user')
      };
      
      await setDoc(userRef, {
        ...newUserData,
        createdAt: Timestamp.now(),
      });
      
      // Update local state immediately so UI reflects the correct role
      setUserData(newUserData);
      setUser(newUserData);
      
      // Log registration
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userCredential.user.uid,
        },
        body: JSON.stringify({ email, password, role }),
      });
      
      toast.success(role === 'admin' ? 'Admin account created successfully!' : 'Account created successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Log login
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userCredential.user.uid,
        },
        body: JSON.stringify({ email }),
      });
      
      toast.success('Welcome back!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
      setUser(null);
      clearCart(); // Clear the cart on sign out
      toast.success('Signed out successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    firebaseUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: userData?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

