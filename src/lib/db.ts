import Dexie, { type Table } from 'dexie';
import type {
  User,
  Asset,
  ChecklistTemplate,
  ChecklistItem,
  InspectionSchedule,
  Inspection,
  InspectionResult,
  MaintenanceFollowUp,
  Report,
  SyncQueueItem,
} from '../types';

export class SarprasDatabase extends Dexie {
  users!: Table<User, string>;
  assets!: Table<Asset, string>;
  checklistTemplates!: Table<ChecklistTemplate, string>;
  checklistItems!: Table<ChecklistItem, string>;
  inspectionSchedules!: Table<InspectionSchedule, string>;
  inspections!: Table<Inspection, string>;
  inspectionResults!: Table<InspectionResult, string>;
  reports!: Table<Report, string>;
  maintenanceFollowUps!: Table<MaintenanceFollowUp, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('SarprasCheckDB');
    this.version(1).stores({
      users: 'uid, email, role, createdAt',
      assets: 'id, code, category, status, location, createdAt',
      checklistTemplates: 'id, assetCategory, frequency, createdAt',
      checklistItems: 'id, templateId, orderNumber',
      inspectionSchedules: 'id, assetId, templateId, assignedTo, dueDate, status',
      inspections: 'id, scheduleId, assetId, obId, status, overallStatus, synced, createdAt',
      inspectionResults: 'id, inspectionId, checklistItemId, result, followUpStatus',
      reports: 'id, reportStatus, createdBy, approvedBy, createdAt',
      syncQueue: 'id, entityType, status, timestamp',
    });
    this.version(2).stores({
      maintenanceFollowUps: 'id, inspectionResultId, inspectionId, assetId, status, followUpDate, pjId, createdAt',
    });
  }
}

export const db = new SarprasDatabase();

/**
 * Inisialisasi Data Awal (Seed Data)
 * Dijalankan sekali saat aplikasi dibuka pertama kali jika data aset kosong
 */
export async function seedInitialData() {
  const assetCount = await db.assets.count();
  if (assetCount > 0) return;

  const now = new Date().toISOString();

  // 1. Aset Awal
  const seedAssets: Asset[] = [
    {
      id: 'asset-1',
      code: 'BNK-001',
      name: 'Bangku Kelas 1',
      category: 'Mebel',
      location: 'Ruang Kelas 1',
      status: 'good',
      lastInspectionAt: undefined,
      createdAt: now,
    },
    {
      id: 'asset-2',
      code: 'ELK-001',
      name: 'Proyektor Kelas 1',
      category: 'Elektronik',
      location: 'Ruang Kelas 1',
      status: 'good',
      lastInspectionAt: undefined,
      createdAt: now,
    },
    {
      id: 'asset-3',
      code: 'TRN-001',
      name: 'Mobil Operasional Sekolah',
      category: 'Transportasi',
      location: 'Parkir Sekolah',
      status: 'good',
      lastInspectionAt: undefined,
      createdAt: now,
    },
    {
      id: 'asset-4',
      code: 'ELK-002',
      name: 'AC Ruang Guru',
      category: 'Elektronik',
      location: 'Ruang Guru Lantai 1',
      status: 'needs_repair',
      lastInspectionAt: undefined,
      createdAt: now,
    },
    {
      id: 'asset-5',
      code: 'BNK-002',
      name: 'Meja Komputer Lab A',
      category: 'Mebel',
      location: 'Lab Komputer 1',
      status: 'good',
      lastInspectionAt: undefined,
      createdAt: now,
    },
  ];

  await db.assets.bulkAdd(seedAssets);

  // 2. Template Ceklis
  const seedTemplates: ChecklistTemplate[] = [
    {
      id: 'tpl-1',
      name: 'Ceklis Bangku dan Meja',
      assetCategory: 'Mebel',
      frequency: 'daily',
      createdBy: 'system',
      createdAt: now,
    },
    {
      id: 'tpl-2',
      name: 'Ceklis Elektronik',
      assetCategory: 'Elektronik',
      frequency: 'weekly',
      createdBy: 'system',
      createdAt: now,
    },
    {
      id: 'tpl-3',
      name: 'Ceklis Transportasi',
      assetCategory: 'Transportasi',
      frequency: 'weekly',
      createdBy: 'system',
      createdAt: now,
    },
  ];

  await db.checklistTemplates.bulkAdd(seedTemplates);

  // 3. Butir Ceklis (Checklist Items)
  const seedItems: ChecklistItem[] = [
    // Template 1: Bangku dan Meja
    {
      id: 'item-1-1',
      templateId: 'tpl-1',
      question: 'Bangku tidak rusak',
      orderNumber: 1,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-1-2',
      templateId: 'tpl-1',
      question: 'Meja tidak rusak',
      orderNumber: 2,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-1-3',
      templateId: 'tpl-1',
      question: 'Tidak ada bagian yang longgar',
      orderNumber: 3,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-1-4',
      templateId: 'tpl-1',
      question: 'Permukaan bersih',
      orderNumber: 4,
      isRequired: true,
      createdAt: now,
    },

    // Template 2: Elektronik
    {
      id: 'item-2-1',
      templateId: 'tpl-2',
      question: 'Perangkat menyala normal',
      orderNumber: 1,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-2-2',
      templateId: 'tpl-2',
      question: 'Kabel dan colokan aman',
      orderNumber: 2,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-2-3',
      templateId: 'tpl-2',
      question: 'Tidak ada suara abnormal',
      orderNumber: 3,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-2-4',
      templateId: 'tpl-2',
      question: 'Perangkat bersih',
      orderNumber: 4,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-2-5',
      templateId: 'tpl-2',
      question: 'Tidak ada peringatan error',
      orderNumber: 5,
      isRequired: true,
      createdAt: now,
    },

    // Template 3: Transportasi
    {
      id: 'item-3-1',
      templateId: 'tpl-3',
      question: 'Kondisi ban baik',
      orderNumber: 1,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-3-2',
      templateId: 'tpl-3',
      question: 'Lampu berfungsi',
      orderNumber: 2,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-3-3',
      templateId: 'tpl-3',
      question: 'Rem berfungsi',
      orderNumber: 3,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-3-4',
      templateId: 'tpl-3',
      question: 'Tidak ada kebocoran',
      orderNumber: 4,
      isRequired: true,
      createdAt: now,
    },
    {
      id: 'item-3-5',
      templateId: 'tpl-3',
      question: 'Dokumen kendaraan lengkap',
      orderNumber: 5,
      isRequired: true,
      createdAt: now,
    },
  ];

  await db.checklistItems.bulkAdd(seedItems);

  // 4. Jadwal Pemeriksaan Awal
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const seedSchedules: InspectionSchedule[] = [
    {
      id: 'sch-1',
      assetId: 'asset-1',
      templateId: 'tpl-1',
      dueDate: todayStr,
      frequency: 'daily',
      status: 'pending',
      createdAt: now,
    },
    {
      id: 'sch-2',
      assetId: 'asset-2',
      templateId: 'tpl-2',
      dueDate: todayStr,
      frequency: 'weekly',
      status: 'pending',
      createdAt: now,
    },
    {
      id: 'sch-3',
      assetId: 'asset-3',
      templateId: 'tpl-3',
      dueDate: tomorrow,
      frequency: 'weekly',
      status: 'pending',
      createdAt: now,
    },
    {
      id: 'sch-4',
      assetId: 'asset-4',
      templateId: 'tpl-2',
      dueDate: todayStr,
      frequency: 'weekly',
      status: 'pending',
      createdAt: now,
    },
  ];

  await db.inspectionSchedules.bulkAdd(seedSchedules);
}
