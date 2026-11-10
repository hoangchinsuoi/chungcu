export type UserRole = 'owner' | 'manager' | 'staff' | 'resident' | 'superadmin';

export interface TenantLegalInfo {
  companyName: string; // Tên pháp nhân đại diện (CĐT / Ban Quản trị / Đơn vị vận hành)
  taxCode: string; // Mã số thuế (MST)
  representativeName: string; // Họ tên người đại diện pháp luật
  representativeTitle: string; // Chức vụ
  representativePhone: string;
  representativeEmail: string;
}

export interface TenantContactInfo {
  hotline: string; // Hotline Ban Quản Lý (24/7)
  supportEmail: string; // Email tiếp nhận
  officeLocation: string; // Văn phòng BQL tại chung cư
  workingHours: string; // Giờ làm việc
}

export interface TenantInvitation {
  id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'manager' | 'owner';
  status: 'pending' | 'accepted' | 'expired';
  invitationCode: string;
  invitationLink: string;
  sentAt: string;
  invitedBy: string;
  notes?: string;
  acceptedAt?: string;
}

export interface SubscriptionPackage {
  id: string;
  code: string; // e.g. PKG-STD, PKG-PRO, PKG-ENT
  name: string; // Gói Standard, Gói Professional, Gói Enterprise
  tagline: string;
  monthlyPrice: number;
  annualDiscountPercent: number; // e.g. 15%
  maxApartments: number; // 300, 600, 99999
  status: 'active' | 'discontinued' | 'draft';
  isPopular?: boolean;
  features: string[];
  discontinuedReason?: string;
  discontinuedAt?: string;
  discontinuedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCondo {
  id: string;
  name: string;
  code: string;
  slug: string; // Slug cho tenant: mtd, vcp-p6 -> mtd.ezcondo.vn
  address: string;
  totalApartments: number;
  totalFloors?: number;
  totalBlocks?: number;
  occupancyRate: number;
  activeResidents: number;
  managerName: string;
  managerEmail?: string;
  managerPhone?: string;
  status: 'active' | 'trial' | 'suspended';
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  restoredAt?: string;
  restoredBy?: string;
  package: string;
  packageId?: string;
  monthlyFee: number;
  createdAt: string;
  legalInfo?: TenantLegalInfo;
  contactInfo?: TenantContactInfo;
}

export type ApartmentStatus = 'vacant' | 'occupied' | 'maintenance' | 'for_sale';
export type ApartmentType = 'Studio' | '1PN' | '2PN' | '3PN' | 'Penthouse' | 'Shophouse';

export interface ResidentHistoryItem {
  id: string;
  residentName: string;
  phone: string;
  role: 'Chủ hộ' | 'Khách thuê';
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface MaintenanceRecord {
  id: string;
  title: string;
  technician: string;
  cost: number;
  date: string;
  status: 'Đã hoàn thành' | 'Đang xử lý';
  notes: string;
}

export interface Apartment {
  id: string;
  code: string; // e.g. A-1204
  block: string;
  floor: number;
  area: number; // m²
  type: ApartmentType;
  status: ApartmentStatus;
  currentResident?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    isOwner: boolean;
  };
  contractId?: string;
  contractExpiry?: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  furnished: 'Cơ bản' | 'Đầy đủ nội thất' | 'Nhà thô';
  monthlyManagementFee: number;
  residentHistory: ResidentHistoryItem[];
  maintenanceHistory: MaintenanceRecord[];
  images: string[];
}

export interface Contract {
  id: string;
  contractNumber: string;
  apartmentCode: string;
  residentName: string;
  residentPhone: string;
  type: 'Hợp đồng thuê' | 'Hợp đồng mua bán / Sở hữu';
  startDate: string;
  endDate: string;
  monthlyRent?: number;
  deposit?: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
  fileUrl?: string;
}

export interface Resident {
  id: string;
  name: string;
  apartmentCode: string;
  phone: string;
  email: string;
  idCard: string;
  status: 'active' | 'pending_activation' | 'suspended';
  role: 'Chủ hộ' | 'Thành viên' | 'Khách thuê';
  moveInDate: string;
  vehicles: {
    type: 'Xe máy' | 'Ô tô' | 'Xe đạp điện';
    plate: string;
  }[];
  internalNotes?: string;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  apartmentCode: string;
  residentName: string;
  month: string; // "10/2026"
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  transactionId?: string;
}

export type ComplaintPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ComplaintStatus = 'new' | 'in_progress' | 'waiting_resident' | 'resolved' | 'closed';

export interface ComplaintMessage {
  id: string;
  senderName: string;
  senderRole: 'Cư dân' | 'Nhân viên kỹ thuật' | 'Ban Quản lý' | 'AI Assistant';
  content: string;
  timestamp: string;
  isAI?: boolean;
}

export interface Complaint {
  id: string;
  ticketCode: string;
  title: string;
  category: 'Kỹ thuật - Nước' | 'Kỹ thuật - Điện' | 'An ninh - Trật tự' | 'Vệ sinh môi trường' | 'Hành chính - Dịch vụ' | 'Thang máy';
  apartmentCode: string;
  residentName: string;
  residentPhone: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
  assignedTo?: string;
  deadline?: string;
  images: string[];
  messages: ComplaintMessage[];
  aiAnalysis?: {
    diagnosis: string;
    suggestedResponse: string;
    actionSteps: string[];
    estimatedCost: string;
    targetTime: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string; // Kỹ sư trưởng, Chuyên viên Lễ tân, Trưởng ca An ninh, Kế toán
  department: 'Kỹ thuật' | 'Dịch vụ cư dân' | 'An ninh' | 'Tài chính' | 'Vận hành';
  phone: string;
  email: string;
  status: 'active' | 'on_leave' | 'inactive';
  completedTasks: number;
  rating: number; // 4.9/5
  avatar?: string;
}

export interface ShiftSchedule {
  id: string;
  date: string;
  shiftName: 'Ca 1 (06:00 - 14:00)' | 'Ca 2 (14:00 - 22:00)' | 'Ca 3 (22:00 - 06:00)';
  staffAssigned: {
    staffId: string;
    staffName: string;
    department: string;
  }[];
  notes?: string;
}

export interface FacilityBooking {
  id: string;
  facilityName: 'Hồ bơi vô cực' | 'Khu tiệc nướng BBQ' | 'Phòng tập Gym' | 'Sân Tennis';
  apartmentCode: string;
  residentName: string;
  bookingDate: string;
  timeSlot: string;
  guestCount: number;
  status: 'Đã xác nhận' | 'Chờ duyệt' | 'Đã hủy';
}

export interface SalesLead {
  id: string;
  buildingName: string;
  contactPerson: string;
  phone: string;
  email: string;
  units: number;
  status: 'Mới liên hệ' | 'Đang tư vấn demo' | 'Chờ ký kết' | 'Đã chốt hợp đồng';
  plan: string;
  date: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  tenantId: string;
  apartmentCode?: string;
  avatar?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  requestCode: string;
  apartmentCode: string;
  residentName: string;
  residentPhone: string;
  type: 'Đăng ký thi công nội thất' | 'Đăng ký thang máy hàng (Chuyển đồ)' | 'Đăng ký cấp thẻ xe' | 'Đăng ký tạm trú / Vắng mặt dài ngày';
  startDate: string;
  endDate?: string;
  status: 'Chờ duyệt' | 'Đã phê duyệt' | 'Từ chối' | 'Đã hoàn tất';
  details: string;
  createdAt: string;
}

export interface ParcelItem {
  id: string;
  trackingCode: string;
  apartmentCode: string;
  recipientName: string;
  courier: string;
  arrivedAt: string;
  status: 'Chờ nhận tại lễ tân' | 'Đã nhận';
  receivedAt?: string;
  lockerNumber?: string;
}

// US15 - Cấu hình dịch vụ & Biểu phí
export type ServiceStatus = 'active' | 'inactive' | 'draft';
export type ServiceCategory = 'Quản lý vận hành' | 'Trông giữ xe' | 'Điện nước tiện ích' | 'Dịch vụ cư dân' | 'Thi công & Ký quỹ';

export interface ServiceConfig {
  id: string;
  serviceCode: string;
  name: string;
  category: ServiceCategory;
  description: string;
  unit: string; // m²/tháng, xe/tháng, m³, lượt, lần, căn/tháng
  unitPrice: number; // >= 0
  vatRate: number; // % (e.g. 10 or 8 or 0)
  status: ServiceStatus;
  effectiveDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  updatedAt: string;
  updatedBy: string;
}

export interface ServiceConfigAudit {
  id: string;
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  changedAt: string;
  changedBy: string;
  changeType: 'create' | 'update_price' | 'update_status' | 'update_general';
  oldPrice?: number;
  newPrice?: number;
  fieldChanges?: {
    field: string;
    fieldLabel: string;
    oldValue: string | number;
    newValue: string | number;
  }[];
  reason: string; // Bắt buộc khi điều chỉnh
}

// AI Hỗ trợ công việc cho Quản lý
export type AISuggestionStatus = 'pending' | 'accepted' | 'edited' | 'dismissed';

export interface AIWorkTaskSuggestion {
  id: string;
  ticketId?: string; // liên kết Complaint hoặc ServiceRequest nếu có
  taskTitle: string;
  category: 'Kỹ thuật - Sự cố' | 'Vận hành - Dịch vụ' | 'Tài chính - Công nợ' | 'Nhân sự - Ca trực' | 'PCCC & An toàn';
  targetApartment?: string;
  currentStatus: string;
  suggestedPriority: ComplaintPriority;
  suggestedAssignee: {
    staffId: string;
    staffName: string;
    role: string;
    department: string;
  };
  suggestedDeadline: string; // e.g. "Hôm nay trước 11:30"
  actionSteps: string[];
  reasoning: string; // Lý do đề xuất
  basisInfo: string; // Căn cứ kỹ thuật, SLA quy định, ca trực hiện tại
  status: AISuggestionStatus;
  userDecisionNotes?: string;
  decidedAt?: string;
  decidedBy?: string;
}


