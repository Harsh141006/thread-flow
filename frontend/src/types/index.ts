// ==========================================
// ThreadFlow — Core TypeScript Types
// ==========================================

// === Roles ===
export type UserRole = 'admin' | 'sales' | 'designer' | 'production' | 'qc' | 'customer';

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'designer', label: 'Designer' },
  { value: 'production', label: 'Production Manager' },
  { value: 'qc', label: 'QC Inspector' },
  { value: 'customer', label: 'Customer' },
];

// === User ===
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  customerId?: string; // links customer role to a Customer record
  createdAt: Date;
  updatedAt: Date;
}

// === Customer ===
export interface ICustomer {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Order ===
export type OrderStatus =
  | 'draft'
  | 'design'
  | 'approval'
  | 'scheduled'
  | 'production'
  | 'qc'
  | 'rework'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'rejected';

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'design', label: 'Design', color: 'blue' },
  { value: 'approval', label: 'Approval', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'indigo' },
  { value: 'qc', label: 'QC', color: 'purple' },
  { value: 'rework', label: 'Rework', color: 'red' },
  { value: 'packed', label: 'Packed', color: 'teal' },
  { value: 'dispatched', label: 'Dispatched', color: 'cyan' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'gray' },
];

// Valid status transitions
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['design', 'dispatched', 'rejected'],
  design: ['approval', 'dispatched', 'rejected'],
  approval: ['scheduled', 'design', 'dispatched', 'rejected'], // can go back for revision
  scheduled: ['production', 'dispatched', 'rejected'],
  production: ['qc', 'dispatched', 'rejected'],
  qc: ['packed', 'rework', 'dispatched', 'rejected'],
  rework: ['production', 'dispatched', 'rejected'],
  packed: ['dispatched', 'delivered', 'rejected'],
  dispatched: ['delivered'],
  delivered: [],
  rejected: [],
};

export interface IOrder {
  _id: string;
  orderId: string; // TF-1001
  customer: string | ICustomer;
  garmentType: string;
  quantity: number;
  sizes: string; // e.g. "S-10, M-20, L-15"
  embroideryPosition: string;
  designWidth: number; // in mm
  designHeight: number; // in mm
  stitchesPerItem: number;
  threadColors: string[];
  deadline: Date;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: string;
  designFile?: string; // Cloudinary URL
  paymentMethod?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Design Version ===
export interface IDesignVersion {
  _id: string;
  version: number;
  imageUrl: string;
  thumbnailUrl?: string;
  uploadedBy: string | IUser;
  notes?: string;
  createdAt: Date;
}

export interface IDesign {
  _id: string;
  order: string | IOrder;
  versions: IDesignVersion[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// === Approval ===
export type ApprovalDecision = 'approved' | 'revision';

export interface IApproval {
  _id: string;
  order: string | IOrder;
  design: string | IDesign;
  designVersion: number;
  decision: ApprovalDecision;
  comment: string;
  decidedBy: string | IUser;
  createdAt: Date;
}

// === Machine ===
export type MachineStatus = 'active' | 'maintenance' | 'idle';

export interface IMachine {
  _id: string;
  name: string;
  type: string;
  stitchesPerHour: number;
  status: MachineStatus;
  currentOrder?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Production ===
export type ProductionStatus = 'queued' | 'running' | 'paused' | 'done';

export interface IProduction {
  _id: string;
  order: string | IOrder;
  machine: string | IMachine;
  status: ProductionStatus;
  startTime?: Date;
  endTime?: Date;
  completedQuantity: number;
  totalQuantity: number;
  assignedBy: string | IUser;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// === Inventory ===
export type InventoryCategory = 'thread' | 'fabric' | 'needle' | 'stabilizer' | 'misc';

export interface IInventory {
  _id: string;
  name: string;
  category: InventoryCategory;
  color?: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// === QC ===
export interface IQCCheckItem {
  name: string;
  passed: boolean;
  notes?: string;
}

export type QCResult = 'pass' | 'rework';

export interface IQCRecord {
  _id: string;
  order: string | IOrder;
  checklist: IQCCheckItem[];
  result: QCResult;
  inspector: string | IUser;
  notes?: string;
  createdAt: Date;
}

// === Payment ===
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface IPaymentEntry {
  amount: number;
  method: string;
  date: Date;
  note?: string;
}

export interface IPayment {
  _id: string;
  order: string | IOrder;
  totalAmount: number;
  payments: IPaymentEntry[];
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// === Risk Assessment ===
export type RiskLevel = 'low' | 'medium' | 'high';

export interface IRiskAssessment {
  totalStitches: number;
  hoursNeeded: number;
  hoursAvailable: number;
  capacityShortfall: number;
  risk: RiskLevel;
  utilizationPercent: number;
}

// === Dashboard ===
export interface IDashboardStats {
  totalOrders: number;
  pendingApprovals: number;
  inProduction: number;
  qcPending: number;
  overdueOrders: number;
  highRiskOrders: number;
  lowStockItems: number;
  revenue: number;
  statusBreakdown: Record<OrderStatus, number>;
}

// === API Response ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// === Pagination ===
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// === Notification ===
export interface INotification {
  _id: string;
  user: string | IUser;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: Date;
}
