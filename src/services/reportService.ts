import { db } from '../lib/db';
import { isFirebaseConfigured, firestoreDb } from './firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Report, ReportStatus } from '../types';

export const reportService = {
  async getAllReports(): Promise<Report[]> {
    return await db.reports.orderBy('createdAt').reverse().toArray();
  },

  async getReportById(id: string): Promise<Report | undefined> {
    return await db.reports.get(id);
  },

  async createReport(params: {
    title: string;
    period: string;
    inspectionIds: string[];
    createdBy: string;
    createdByName: string;
    summary: string;
    recommendations?: string;
    goodCount?: number;
    needsRepairCount?: number;
    brokenCount?: number;
    totalAssetsCount?: number;
  }): Promise<Report> {
    const now = new Date().toISOString();
    const id = 'rep_' + Date.now();

    // Hitung count jika belum ada
    let goodCount = params.goodCount;
    let needsRepairCount = params.needsRepairCount;
    let brokenCount = params.brokenCount;
    let totalAssetsCount = params.totalAssetsCount;

    if (goodCount === undefined) {
      const allAssets = await db.assets.toArray();
      totalAssetsCount = allAssets.length;
      goodCount = allAssets.filter(a => a.status === 'good').length;
      needsRepairCount = allAssets.filter(a => a.status === 'needs_repair').length;
      brokenCount = allAssets.filter(a => a.status === 'broken').length;
    }

    const report: Report = {
      id,
      title: params.title,
      period: params.period,
      inspectionIds: params.inspectionIds,
      goodCount,
      needsRepairCount,
      brokenCount,
      totalAssetsCount,
      createdBy: params.createdBy,
      createdByName: params.createdByName,
      reportStatus: 'submitted', // Langsung diajukan ke Ketua Sarpras
      summary: params.summary,
      recommendations: params.recommendations || '',
      createdAt: now,
      updatedAt: now,
    };

    await db.reports.put(report);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await setDoc(doc(firestoreDb, 'reports', id), report);
      } catch (err) {
        console.warn('Firebase report sync failed:', err);
      }
    }

    return report;
  },

  async approveReport(reportId: string, ketuaId: string, ketuaName: string): Promise<void> {
    const now = new Date().toISOString();
    const updates = {
      reportStatus: 'approved' as ReportStatus,
      approvedBy: ketuaId,
      approvedByName: ketuaName,
      updatedAt: now,
    };

    await db.reports.update(reportId, updates);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
      } catch (err) {
        console.warn('Firebase approve report update failed:', err);
      }
    }
  },

  async forwardToPrincipal(reportId: string): Promise<void> {
    const now = new Date().toISOString();
    const updates = {
      forwardedToPrincipalAt: now,
      updatedAt: now,
    };

    await db.reports.update(reportId, updates);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
      } catch (err) {
        console.warn('Firebase forward report update failed:', err);
      }
    }
  },

  async updateReport(
    reportId: string,
    updates: Partial<Omit<Report, 'id' | 'createdAt'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    const updateData = {
      ...updates,
      updatedAt: now,
    };

    await db.reports.update(reportId, updateData);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'reports', reportId), updateData);
      } catch (err) {
        console.warn('Firebase update report failed:', err);
      }
    }
  },

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    const now = new Date().toISOString();
    const updates = {
      reportStatus: status,
      updatedAt: now,
    };

    await db.reports.update(reportId, updates);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'reports', reportId), updates);
      } catch (err) {
        console.warn('Firebase report status update failed:', err);
      }
    }
  },

  async deleteReport(reportId: string): Promise<void> {
    await db.reports.delete(reportId);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'reports', reportId));
      } catch (err) {
        console.warn('Firebase delete report failed:', err);
      }
    }
  },
};
