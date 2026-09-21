import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  /* ── register (customer only) ── */
  const register = async (name, email, password, phone = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    try { await updateProfile(cred.user, { displayName: name }) } catch (_) {}
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, name, email, phone,
      role: 'customer',
      photoURL: '',
      createdAt: serverTimestamp(),
    })
    const p = { uid: cred.user.uid, name, email, phone, role: 'customer', photoURL: '' }
    setProfile(p)
    return cred.user
  }

  /* ── user login ── */
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  /* ── Google login (customer) ── */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    // create Firestore doc only if first time
    const ref  = doc(db, 'users', cred.user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:       cred.user.uid,
        name:      cred.user.displayName || '',
        email:     cred.user.email,
        role:      'customer',
        createdAt: serverTimestamp(),
      })
    }
    return cred.user
  }

  /* ── admin login — checks role after login ── */
  const loginAsAdmin = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists() || snap.data().role !== 'admin') {
      await signOut(auth)   // kick them out immediately
      throw new Error('NOT_ADMIN')
    }
    setProfile(snap.data())
    return cred.user
  }

  /* ── logout ── */
  const logout = () => signOut(auth)

  /* ── update profile (name, phone, photoURL) ── */
  const updateUserProfile = async (data) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, data, { merge: true })
    if (data.name) {
      try { await updateProfile(user, { displayName: data.name }) } catch (_) {}
    }
    if (data.photoURL !== undefined) {
      try { await updateProfile(user, { photoURL: data.photoURL }) } catch (_) {}
    }
    setProfile(p => ({ ...p, ...data }))
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAdmin,
      register, login, loginWithGoogle, loginAsAdmin, logout, updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
