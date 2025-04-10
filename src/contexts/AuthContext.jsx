import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { app, auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date(),
        settings: {
          workDuration: 25 * 60,
          breakDuration: 5 * 60,
          soundEnabled: true,
        },
      });
      setUserName(name);
      setError(null);
      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password).catch((error) => {
      setError(error.message);
      throw error;
    });
  };

  const logout = () => {
    return signOut(auth).catch((error) => {
      setError(error.message);
      throw error;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || 'User');
          } else {
            setUserName('User');
            await setDoc(userDocRef, {
              name: 'User',
              email: user.email,
              createdAt: new Date(),
              settings: { workDuration: 25 * 60, breakDuration: 5 * 60, soundEnabled: true },
            });
          }
          setError(null);
          setIsOffline(false);
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          setError('Failed to load user data');
          setUserName('User');
          setIsOffline(error.code === 'unavailable' || error.message.includes('offline'));
        }
      } else {
        setUserName('');
        setIsOffline(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, userName, signup, login, logout, loading, error, isOffline };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};