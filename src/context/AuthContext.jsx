import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  const presenceInterval      = useRef(null)

  // ── Update presence every 60s while logged in ──
  const updatePresence = (uid) => {
    setDoc(doc(db, 'presence', uid), {
      lastSeen: serverTimestamp(),
      online: true,
    }, { merge: true }).catch(() => {})
  }

  const startPresence = (uid) => {
    updatePresence(uid) // immediate
    clearInterval(presenceInterval.current)
    presenceInterval.current = setInterval(() => updatePresence(uid), 60000)
  }

  const stopPresence = (uid) => {
    clearInterval(presenceInterval.current)
    if (uid) {
      setDoc(doc(db, 'presence', uid), {
        lastSeen: serverTimestamp(),
        online: false,
      }, { merge: true }).catch(() => {})
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
        startPresence(firebaseUser.uid)
      } else {
        if (user?.uid) stopPresence(user.uid)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => {
      unsub()
      clearInterval(presenceInterval.current)
    }
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

  /* ── owner login — checks role after login ── */
  const loginAsOwner = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists() || snap.data().role !== 'owner') {
      await signOut(auth)
      throw new Error('NOT_OWNER')
    }
    setProfile(snap.data())
    return cred.user
  }

  /* ── logout ── */
  const logout = async () => {
    if (user?.uid) stopPresence(user.uid)
    return signOut(auth)
  }

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
  const isOwner = profile?.role === 'owner'

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAdmin, isOwner,
      register, login, loginWithGoogle, loginAsAdmin, loginAsOwner, logout, updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
