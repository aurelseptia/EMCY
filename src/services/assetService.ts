import { db } from '../lib/db';
import { isFirebaseConfigured, firestoreDb } from './firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Asset, ChecklistTemplate, ChecklistItem, InspectionSchedule, User } from '../types';

export const assetService = {
  // ===================== CRUD SARANA PRASARANA / ASET =====================
  async getAllAssets(): Promise<Asset[]> {
    return await db.assets.orderBy('createdAt').reverse().toArray();
  },

  async getAssetById(id: string): Promise<Asset | undefined> {
    return await db.assets.get(id);
  },

  async createAsset(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
    const id = 'asset-' + Date.now();
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.assets.put(newAsset);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await setDoc(doc(firestoreDb, 'assets', id), newAsset);
      } catch (err) {
        console.warn('Firebase asset sync failed:', err);
      }
    }
    return newAsset;
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<void> {
    const now = new Date().toISOString();
    const updateData = {
      ...updates,
      updatedAt: now,
    };
    await db.assets.update(id, updateData);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'assets', id), updateData);
      } catch (err) {
        console.warn('Firebase asset update failed:', err);
      }
    }
  },

  async updateAssetStatus(assetId: string, status: Asset['status']): Promise<void> {
    await this.updateAsset(assetId, {
      status,
      lastInspectionAt: new Date().toISOString(),
    });
  },

  async deleteAsset(id: string): Promise<void> {
    await db.assets.delete(id);

    // Hapus juga jadwal terkait aset ini
    await db.inspectionSchedules.where('assetId').equals(id).delete();

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'assets', id));
      } catch (err) {
        console.warn('Firebase asset delete failed:', err);
      }
    }
  },

  // ===================== CRUD TEMPLATE CEKLIS =====================
  async getAllTemplates(): Promise<ChecklistTemplate[]> {
    return await db.checklistTemplates.orderBy('createdAt').reverse().toArray();
  },

  async getTemplateById(id: string): Promise<ChecklistTemplate | undefined> {
    return await db.checklistTemplates.get(id);
  },

  async getTemplateByCategory(category: string): Promise<ChecklistTemplate | undefined> {
    return await db.checklistTemplates.where('assetCategory').equals(category).first();
  },

  async createTemplate(
    template: Omit<ChecklistTemplate, 'id' | 'createdAt'>,
    items: Array<{ question: string; isRequired: boolean }>
  ): Promise<ChecklistTemplate> {
    const templateId = 'tpl-' + Date.now();
    const now = new Date().toISOString();

    const newTemplate: ChecklistTemplate = {
      ...template,
      id: templateId,
      createdAt: now,
      updatedAt: now,
    };

    await db.checklistTemplates.put(newTemplate);

    const checklistItems: ChecklistItem[] = items.map((item, index) => ({
      id: `item-${templateId}-${index + 1}`,
      templateId,
      question: item.question.trim(),
      orderNumber: index + 1,
      isRequired: item.isRequired,
      createdAt: now,
    }));

    await db.checklistItems.bulkAdd(checklistItems);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await setDoc(doc(firestoreDb, 'checklistTemplates', templateId), {
          ...newTemplate,
          items: checklistItems,
        });
      } catch (err) {
        console.warn('Firebase template create failed:', err);
      }
    }

    return newTemplate;
  },

  async updateTemplate(
    templateId: string,
    templateUpdates: Partial<ChecklistTemplate>,
    items?: Array<{ question: string; isRequired: boolean }>
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.checklistTemplates.update(templateId, {
      ...templateUpdates,
      updatedAt: now,
    });

    if (items) {
      // Hapus item lama, ganti dengan yang baru
      await db.checklistItems.where('templateId').equals(templateId).delete();
      const checklistItems: ChecklistItem[] = items.map((item, index) => ({
        id: `item-${templateId}-${index + 1}-${Date.now()}`,
        templateId,
        question: item.question.trim(),
        orderNumber: index + 1,
        isRequired: item.isRequired,
        createdAt: now,
      }));
      await db.checklistItems.bulkAdd(checklistItems);
    }

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'checklistTemplates', templateId), {
          ...templateUpdates,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Firebase template update failed:', err);
      }
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    await db.checklistTemplates.delete(templateId);
    await db.checklistItems.where('templateId').equals(templateId).delete();
    await db.inspectionSchedules.where('templateId').equals(templateId).delete();

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'checklistTemplates', templateId));
      } catch (err) {
        console.warn('Firebase template delete failed:', err);
      }
    }
  },

  // ===================== CRUD BUTIR CEKLIS (ITEMS) =====================
  async getItemsByTemplateId(templateId: string): Promise<ChecklistItem[]> {
    return await db.checklistItems
      .where('templateId')
      .equals(templateId)
      .sortBy('orderNumber');
  },

  // ===================== CRUD JADWAL PEMERIKSAAN =====================
  async getAllSchedules(): Promise<InspectionSchedule[]> {
    return await db.inspectionSchedules.orderBy('dueDate').toArray();
  },

  async getSchedulesWithDetails(forObId?: string): Promise<Array<InspectionSchedule & { asset?: Asset; template?: ChecklistTemplate }>> {
    let schedules = await db.inspectionSchedules.toArray();
    if (forObId) {
      schedules = schedules.filter(s => !s.assignedTo || s.assignedTo === forObId);
    }

    const assets = await db.assets.toArray();
    const templates = await db.checklistTemplates.toArray();

    const assetMap = new Map(assets.map(a => [a.id, a]));
    const templateMap = new Map(templates.map(t => [t.id, t]));

    return schedules.map(s => ({
      ...s,
      asset: assetMap.get(s.assetId),
      template: templateMap.get(s.templateId),
    }));
  },

  async createSchedule(schedule: Omit<InspectionSchedule, 'id' | 'createdAt'>): Promise<InspectionSchedule> {
    const id = 'sch-' + Date.now();
    const now = new Date().toISOString();

    const newSchedule: InspectionSchedule = {
      ...schedule,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.inspectionSchedules.put(newSchedule);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await setDoc(doc(firestoreDb, 'inspectionSchedules', id), newSchedule);
      } catch (err) {
        console.warn('Firebase schedule create failed:', err);
      }
    }

    return newSchedule;
  },

  async updateSchedule(scheduleId: string, updates: Partial<InspectionSchedule>): Promise<void> {
    const now = new Date().toISOString();
    await db.inspectionSchedules.update(scheduleId, {
      ...updates,
      updatedAt: now,
    });

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await updateDoc(doc(firestoreDb, 'inspectionSchedules', scheduleId), {
          ...updates,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Firebase schedule update failed:', err);
      }
    }
  },

  async updateScheduleStatus(scheduleId: string, status: InspectionSchedule['status']): Promise<void> {
    await this.updateSchedule(scheduleId, { status });
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    await db.inspectionSchedules.delete(scheduleId);

    if (isFirebaseConfigured() && firestoreDb && navigator.onLine) {
      try {
        await deleteDoc(doc(firestoreDb, 'inspectionSchedules', scheduleId));
      } catch (err) {
        console.warn('Firebase schedule delete failed:', err);
      }
    }
  },

  // ===================== DAFTAR USER OB =====================
  async getOBUsers(): Promise<User[]> {
    return await db.users.where('role').equals('ob').toArray();
  },
};
