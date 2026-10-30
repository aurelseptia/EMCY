import { db } from '../lib/db';
import { assetService } from './assetService';
import { isFirebaseConfigured, firestoreDb } from './firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type {
  Inspection,
  InspectionResult,
  ItemResultStatus,
  FollowUpStatus,
  AssetStatus,
  MaintenanceFollowUp,
} from '../types';

export interface SubmitChecklistPayload {
  inspectionId?: string;
  scheduleId?: string;
  assetId: string;
  obId: string;
  obName: string;
  templateId: string;
  notes?: string;
  isDraft?: boolean;
  items: Array<{
    checklistItemId: string;
    question: string;
    result: ItemResultStatus;
    note?: string;
    photoUrl?: string;
  }>;
}

export const inspectionService = {
  // Ambil draft yang sedang aktif untuk aset tertentu atau schedule tertentu
  async getActiveDraft(assetId: string, obId: string): Promise<{
    inspection: Inspection | undefined;
    results: InspectionResult[];
  }> {
    const inspection = await db.inspections
      .where('assetId')
      .equals(assetId)
      .and(i => i.obId === obId && i.status === 'draft')
      .first();

    if (!inspection) {
      return { inspection: undefined, results: [] };
    }

    const results = await db.inspectionResults
      .where('inspectionId')
      .equals(inspection.id)
      .toArray();

    return { inspection, results };
  },

  // Simpan draft secara otomatis (Auto-save) atau manual
  async saveDraft(payload: SubmitChecklistPayload): Promise<Inspection> {
    const now = new Date().toISOString();
    const asset = await assetService.getAssetById(payload.assetId);
    const template = await assetService.getTemplateById(payload.templateId);

    const inspectionId = payload.inspectionId || 'insp_' + Date.now();

    // Tentukan overall status sementara
    let overallStatus: AssetStatus = 'good';
    if (payload.items.some(i => i.result === 'broken')) {
      overallStatus = 'broken';
    } else if (payload.items.some(i => i.result === 'needs_repair')) {
      overallStatus = 'needs_repair';
    }

    const inspection: Inspection = {
      id: inspectionId,
      scheduleId: payload.scheduleId,
      assetId: payload.assetId,
      assetCode: asset?.code,
      assetName: asset?.name,
      assetLocation: asset?.location,
      assetCategory: asset?.category,
      templateId: payload.templateId,
      templateName: template?.name,
      obId: payload.obId,
      obName: payload.obName,
      startedAt: now,
      status: 'draft',
      overallStatus,
      notes: payload.notes || '',
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.inspections.put(inspection);

    // Simpan item results
    for (const item of payload.items) {
      const resultId = `${inspectionId}_${item.checklistItemId}`;
      const res: InspectionResult = {
        id: resultId,
        inspectionId,
        checklistItemId: item.checklistItemId,
        question: item.question,
        result: item.result,
        note: item.note || '',
        photoUrl: item.photoUrl,
        followUpStatus: item.result !== 'pass' ? 'waiting' : undefined,
        createdAt: now,
        updatedAt: now,
      };
      await db.inspectionResults.put(res);
    }

    return inspection;
  },

  // Kirim hasil pemeriksaan final oleh OB
  async submitInspection(payload: SubmitChecklistPayload): Promise<Inspection> {
    const now = new Date().toISOString();
    const asset = await assetService.getAssetById(payload.assetId);
    const template = await assetService.getTemplateById(payload.templateId);

    const inspectionId = payload.inspectionId || 'insp_' + Date.now();

    // Hitung overall status
    let overallStatus: AssetStatus = 'good';
    if (payload.items.some(i => i.result === 'broken')) {
      overallStatus = 'broken';
    } else if (payload.items.some(i => i.result === 'needs_repair')) {
      overallStatus = 'needs_repair';
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    const inspection: Inspection = {
      id: inspectionId,
      scheduleId: payload.scheduleId,
      assetId: payload.assetId,
      assetCode: asset?.code,
      assetName: asset?.name,
      assetLocation: asset?.location,
      assetCategory: asset?.category,
      templateId: payload.templateId,
      templateName: template?.name,
      obId: payload.obId,
      obName: payload.obName,
      startedAt: now,
      submittedAt: now,
      status: 'submitted',
      overallStatus,
      notes: payload.notes || '',
      synced: isOnline,
      createdAt: now,
      updatedAt: now,
    };

    await db.inspections.put(inspection);

    // Simpan semua results
    for (const item of payload.items) {
      const resultId = `${inspectionId}_${item.checklistItemId}`;
      const res: InspectionResult = {
        id: resultId,
        inspectionId,
        checklistItemId: item.checklistItemId,
        question: item.question,
        result: item.result,
        note: item.note || '',
        photoUrl: item.photoUrl,
        followUpStatus: item.result !== 'pass' ? 'waiting' : undefined,
        createdAt: now,
        updatedAt: now,
      };
      await db.inspectionResults.put(res);
    }

    // Update status aset di sistem
    await assetService.updateAssetStatus(payload.assetId, overallStatus);

    // Update status jadwal jika ada
    if (payload.scheduleId) {
      await assetService.updateScheduleStatus(payload.scheduleId, 'completed');
    }

    // Tambahkan ke antrean sinkronisasi jika offline
    if (!isOnline) {
      await db.syncQueue.put({
        id: 'sync_' + inspectionId,
        entityType: 'inspections',
        action: 'create',
        data: { inspection, items: payload.items },
        timestamp: Date.now(),
        status: 'pending',
      });
    } else if (isFirebaseConfigured() && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'inspections', inspectionId), inspection);
      } catch (err) {
        console.warn('Firebase inspection write failed:', err);
      }
    }

    return inspection;
  },

  // Ambil semua pemeriksaan untuk OB tertentu
  async getInspectionsByOB(obId: string): Promise<Inspection[]> {
    return await db.inspections
      .where('obId')
      .equals(obId)
      .reverse()
      .sortBy('createdAt');
  },

  // Ambil seluruh pemeriksaan untuk PJ Sarpras / Ketua Sarpras
  async getAllInspections(): Promise<Inspection[]> {
    return await db.inspections
      .orderBy('createdAt')
      .reverse()
      .toArray();
  },

  async getInspectionById(id: string): Promise<{
    inspection: Inspection | undefined;
    results: InspectionResult[];
  }> {
    const inspection = await db.inspections.get(id);
    const results = await db.inspectionResults.where('inspectionId').equals(id).toArray();
    return { inspection, results };
  },

  // Delete Inspection (Ketua Sarpras hak akses)
  async deleteInspection(id: string): Promise<void> {
    await db.inspections.delete(id);
    await db.inspectionResults.where('inspectionId').equals(id).delete();

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'inspections', id));
      } catch (err) {
        console.warn('Firebase inspection delete failed:', err);
      }
    }
  },

  // Verifikasi oleh Penanggung Jawab Sarpras
  async verifyInspection(inspectionId: string, pjId: string, pjName: string): Promise<void> {
    const now = new Date().toISOString();
    await db.inspections.update(inspectionId, {
      status: 'verified',
      updatedAt: now,
    });

    const results = await db.inspectionResults.where('inspectionId').equals(inspectionId).toArray();
    for (const r of results) {
      await db.inspectionResults.update(r.id, {
        verifiedBy: pjId,
        verifiedByName: pjName,
        verifiedAt: now,
        updatedAt: now,
      });
    }

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'inspections', inspectionId), {
          status: 'verified',
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Firebase verify update failed:', err);
      }
    }
  },

  // Ambil semua item yang Perlu Perbaikan atau Rusak
  async getDefectiveItems(): Promise<Array<InspectionResult & { inspection?: Inspection; asset?: any }>> {
    const results = await db.inspectionResults
      .filter(r => r.result === 'needs_repair' || r.result === 'broken')
      .toArray();

    const inspectionIds = Array.from(new Set(results.map(r => r.inspectionId)));
    const inspections = await db.inspections.where('id').anyOf(inspectionIds).toArray();
    const inspectionMap = new Map(inspections.map(i => [i.id, i]));

    return results.map(r => ({
      ...r,
      inspection: inspectionMap.get(r.inspectionId),
    }));
  },

  // Update tindak lanjut oleh PJ Sarpras
  async updateFollowUp(resultId: string, status: FollowUpStatus, note?: string): Promise<void> {
    const now = new Date().toISOString();
    const updateData: Partial<InspectionResult> = {
      followUpStatus: status,
      followUpDate: now,
      updatedAt: now,
    };
    if (note !== undefined) {
      updateData.followUpNote = note;
    }
    await db.inspectionResults.update(resultId, updateData);

    // Cek jika semua item rusak dalam inspeksi sudah selesai
    const item = await db.inspectionResults.get(resultId);
    if (item && status === 'done') {
      const allItemsInInspection = await db.inspectionResults.where('inspectionId').equals(item.inspectionId).toArray();
      const stillBroken = allItemsInInspection.some(i => i.result !== 'pass' && i.followUpStatus !== 'done');
      if (!stillBroken) {
        const inspection = await db.inspections.get(item.inspectionId);
        if (inspection) {
          // Pulihkan status aset menjadi Baik
          await assetService.updateAssetStatus(inspection.assetId, 'good');
        }
      }
    }
  },

  // ===================== CRUD MAINTENANCE FOLLOW UPS =====================
  async getAllFollowUps(): Promise<MaintenanceFollowUp[]> {
    return await db.maintenanceFollowUps.orderBy('createdAt').reverse().toArray();
  },

  async createFollowUp(params: Omit<MaintenanceFollowUp, 'id' | 'createdAt'>): Promise<MaintenanceFollowUp> {
    const id = 'mfu-' + Date.now();
    const now = new Date().toISOString();

    const followUp: MaintenanceFollowUp = {
      ...params,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.maintenanceFollowUps.put(followUp);

    // Update status di inspectionResult juga jika ada
    if (params.inspectionResultId) {
      await this.updateFollowUp(params.inspectionResultId, params.status, params.followUpNote);
    }

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await setDoc(doc(firestoreDb, 'maintenanceFollowUps', id), followUp);
      } catch (err) {
        console.warn('Firebase followUp sync failed:', err);
      }
    }

    return followUp;
  },

  async updateFollowUpItem(id: string, updates: Partial<MaintenanceFollowUp>): Promise<void> {
    const now = new Date().toISOString();
    const updateData = {
      ...updates,
      updatedAt: now,
    };
    await db.maintenanceFollowUps.update(id, updateData);

    const followUp = await db.maintenanceFollowUps.get(id);
    if (followUp && followUp.inspectionResultId && updates.status) {
      await this.updateFollowUp(followUp.inspectionResultId, updates.status, updates.followUpNote);
    }

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'maintenanceFollowUps', id), updateData);
      } catch (err) {
        console.warn('Firebase followUp update failed:', err);
      }
    }
  },

  async deleteFollowUp(id: string): Promise<void> {
    await db.maintenanceFollowUps.delete(id);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'maintenanceFollowUps', id));
      } catch (err) {
        console.warn('Firebase followUp delete failed:', err);
      }
    }
  },
};
