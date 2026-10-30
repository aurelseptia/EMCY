import { db } from '../lib/db';
import { isFirebaseConfigured, firestoreDb } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export type SyncStatusType = 'Tersimpan lokal' | 'Mengunggah' | 'Tersinkron' | 'Gagal sinkron';

class SyncService {
  private isSyncing = false;
  private listeners: Array<(status: SyncStatusType) => void> = [];
  private currentStatus: SyncStatusType = 'Tersinkron';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingData();
      });
    }
  }

  public subscribe(callback: (status: SyncStatusType) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private setStatus(status: SyncStatusType) {
    this.currentStatus = status;
    this.listeners.forEach(cb => cb(status));
  }

  public getStatus(): SyncStatusType {
    return this.currentStatus;
  }

  public async getPendingCount(): Promise<number> {
    const queueCount = await db.syncQueue.where('status').equals('pending').count();
    const unsyncedInspections = await db.inspections.where('synced').equals(0).count();
    return queueCount + unsyncedInspections;
  }

  public async syncPendingData(): Promise<void> {
    if (this.isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('Tersimpan lokal');
      return;
    }

    this.isSyncing = true;
    this.setStatus('Mengunggah');

    try {
      // 1. Ambil queue pending
      const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();

      for (const item of pendingItems) {
        if (isFirebaseConfigured() && firestoreDb) {
          try {
            await setDoc(doc(firestoreDb, item.entityType, item.data.inspection.id), item.data.inspection);
          } catch (err) {
            console.warn('Sync item failed:', err);
          }
        }
        await db.syncQueue.delete(item.id);
      }

      // 2. Tandai inspeksi yang belum synced menjadi synced
      const unsynced = await db.inspections.filter(i => !i.synced && i.status !== 'draft').toArray();
      for (const insp of unsynced) {
        await db.inspections.update(insp.id, { synced: true });
      }

      this.setStatus('Tersinkron');
    } catch (err) {
      console.error('Sync failed:', err);
      this.setStatus('Gagal sinkron');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
