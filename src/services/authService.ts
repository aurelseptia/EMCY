import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/db';
import { firebaseAuth, firestoreDb, isFirebaseConfigured } from './firebase';
import type { User, UserRole } from '../types';

const STORAGE_KEY = 'sarpras_current_user';

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface LoginParams {
  email: string;
  password: string;
}

// Terjemahan pesan error ke bahasa Indonesia
export function translateAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/weak-password':
      return 'Kata sandi minimal harus terdiri dari 8 karakter.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini tidak ditemukan.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi beberapa saat lagi.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan terputus. Menggunakan penyimpanan offline.';
    default:
      return error?.message || 'Terjadi kesalahan pada sistem autentikasi.';
  }
}

export const authService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  async register(params: RegisterParams): Promise<User> {
    const { name, email, password, confirmPassword, role } = params;

    // 1. Validasi Input
    if (!name.trim()) {
      throw new Error('Nama lengkap tidak boleh kosong.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email tidak valid.');
    }
    if (password.length < 8) {
      throw new Error('Kata sandi harus minimal 8 karakter.');
    }
    if (password !== confirmPassword) {
      throw new Error('Konfirmasi kata sandi tidak cocok.');
    }
    if (!role || !['ob', 'pj_sarpras', 'ketua_sarpras'].includes(role)) {
      throw new Error('Role wajib dipilih.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();
    let uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    // 2. Cek apakah email sudah terdaftar di IndexedDB lokal
    const existingLocalUser = await db.users.where('email').equals(cleanEmail).first();
    if (existingLocalUser) {
      throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
    }

    // 3. Jika Firebase terkonfigurasi & online, buat akun di Firebase Auth
    if (isFirebaseConfigured() && firebaseAuth && firestoreDb && navigator.onLine) {
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        uid = userCredential.user.uid;

        // Simpan ke Firestore
        await setDoc(doc(firestoreDb, 'users', uid), {
          uid,
          name: name.trim(),
          email: cleanEmail,
          role,
          createdAt: now,
        });
      } catch (err: any) {
        console.error('Firebase Register Error:', err);
        throw new Error(translateAuthError(err));
      }
    }

    const newUser: User = {
      uid,
      name: name.trim(),
      email: cleanEmail,
      role,
      createdAt: now,
    };

    // 4. Simpan ke IndexedDB lokal untuk offline-first
    await db.users.put(newUser);
    // Simpan password hash sederhana di storage lokal untuk offline login
    localStorage.setItem(`pwd_${cleanEmail}`, btoa(password));

    // 5. Langsung set user aktif (login)
    this.setCurrentUser(newUser);

    return newUser;
  },

  async login(params: LoginParams): Promise<User> {
    const { email, password } = params;

    if (!email.trim()) {
      throw new Error('Email tidak boleh kosong.');
    }
    if (!password) {
      throw new Error('Kata sandi tidak boleh kosong.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Coba Firebase jika online & terkonfigurasi
    if (isFirebaseConfigured() && firebaseAuth && firestoreDb && navigator.onLine) {
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
        const uid = userCredential.user.uid;

        // Ambil data user dari Firestore
        const userDoc = await getDoc(doc(firestoreDb, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          await db.users.put(userData);
          localStorage.setItem(`pwd_${cleanEmail}`, btoa(password));
          this.setCurrentUser(userData);
          return userData;
        }
      } catch (err: any) {
        // Jika error jaringan dan user ada di lokal, fallback ke lokal
        if (err.code !== 'auth/network-request-failed') {
          console.error('Firebase Login Error:', err);
          throw new Error(translateAuthError(err));
        }
      }
    }

    // 2. Fallback / Mode Offline via IndexedDB
    const localUser = await db.users.where('email').equals(cleanEmail).first();
    if (!localUser) {
      throw new Error('Akun tidak ditemukan. Pastikan Anda telah mendaftar terlebih dahulu.');
    }

    const savedPwd = localStorage.getItem(`pwd_${cleanEmail}`);
    if (savedPwd && savedPwd !== btoa(password)) {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }

    this.setCurrentUser(localUser);
    return localUser;
  },

  async logout(): Promise<void> {
    if (isFirebaseConfigured() && firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (err) {
        console.warn('Firebase signout error:', err);
      }
    }
    this.setCurrentUser(null);
  },
};
