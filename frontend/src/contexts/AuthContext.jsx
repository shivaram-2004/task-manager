import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Signup and store role in Firestore
  const signup = async (email, password, userRole = "member") => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const ref = doc(db, "users", userCred.user.uid);

    await setDoc(doc(db, "users", userCred.user.uid), {
      uid: userCred.user.uid,
      email: email.toLowerCase(),   // ✅ ensure this exists
      name: email.split("@")[0],
      role: userRole,
      createdAt: new Date().toISOString(),
    });
    setUser(userCred.user);
    setRole(userRole);
    return userCred;
  };

  // 🔹 Login and fetch role from Firestore
  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const ref = doc(db, "users", userCred.user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setRole(snap.data().role);
    } else {
      console.warn("⚠️ No role found for this user in Firestore. Defaulting to 'member'.");
      setRole("member");
    }

    setUser(userCred.user);
    return userCred;
  };

  // 🔹 Realtime Firestore role listener (auto updates on change)
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setRole(snap.data().role);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 🔹 Auth state persistence (on refresh)
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      const ref = doc(db, "users", firebaseUser.uid);
      let snap = await getDoc(ref);

      // ✅ Create doc if it doesn't exist
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.email.split("@")[0],
          role: "member",
          createdAt: new Date().toISOString(),
        });
        snap = await getDoc(ref);
      }

      setRole(snap.data()?.role || "member");
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, signup, login, logout }}>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "4rem", color: "#666" }}>
          🔄 Checking authentication...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
