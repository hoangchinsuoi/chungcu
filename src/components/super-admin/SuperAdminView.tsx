import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Layers,
  Activity,
  DollarSign,
  PhoneCall,
  Server,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  ExternalLink,
  Ban,
  RotateCcw,
  Mail,
  UserPlus,
  FileText,
  Copy,
  Info,
  Edit2,
  Trash2,
  Building,
  Check,
  ChevronRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  TenantCondo,
  SalesLead,
  SubscriptionPackage,
  TenantInvitation,
  UserRole,
} from '../../types';
import { INITIAL_SALES_LEADS } from '../../data/mockData';
import { Modal } from '../common/Modal';

interface SuperAdminViewProps {
  currentRole: UserRole;
  tenants: TenantCondo[];
  packages: SubscriptionPackage[];
  tenantInvitations: TenantInvitation[];
  onAddTenant: (newTenant: Partial<TenantCondo>) => void;
  onUpdateTenant: (tenantId: string, updated: Partial<TenantCondo>) => void;
  onSuspendTenant: (tenantId: string, reason: string) => void;
  onRestoreTenant: (tenantId: string) => void;
  onAddPackage: (newPackage: Omit<SubscriptionPackage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePackage: (packageId: string, updated: Partial<SubscriptionPackage>) => void;
  onDiscontinuePackage: (packageId: string, reason: string) => void;
  onReactivatePackage: (packageId: string) => void;
  onInviteTenantAdmin: (
    invitation: Omit<TenantInvitation, 'id' | 'sentAt' | 'status' | 'invitationCode' | 'invitationLink'>
  ) => void;
  onResendInvitation: (invitationId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  currentRole,
  tenants,
  packages,
  tenantInvitations,
  onAddTenant,
  onUpdateTenant,
  onSuspendTenant,
  onRestoreTenant,
  onAddPackage,
  onUpdatePackage,
  onDiscontinuePackage,
  onReactivatePackage,
  onInviteTenantAdmin,
  onResendInvitation,
}) => {
  // Strict Multi-tenant Authorization Gate:
  // Condominium Owners (Chủ chung cư) & Managers (Ban Quản lý) are strictly partitioned per tenant
  // and CANNOT access the SaaS System Administration Console.
  if (currentRole !== 'superadmin') {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Quyền truy cập bị từ chối</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Chức năng <strong>Quản trị hệ thống (SaaS Platform Console)</strong> chỉ dành riêng cho tài khoản <strong>Quản trị viên nền tảng (Super Admin)</strong>.
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-200/80 text-left space-y-2">
            <div className="font-semibold text-slate-800">Phân định quyền hạn theo mô hình Multi-tenant:</div>
            <div>
              • <strong>Chủ chung cư (Owner)</strong> & <strong>Ban Quản lý (Manager):</strong> Quản lý vận hành nội bộ, danh mục căn hộ, cư dân, hóa đơn và dịch vụ trong phạm vi chung cư được cấp phép.
            </div>
            <div>
              • <strong>Quản trị viên nền tảng (Super Admin):</strong> Duy nhất có thẩm quyền quản lý danh sách toàn bộ chung cư (tenants), chính sách thương mại, cấp gói bản quyền và giám sát hạ tầng cloud.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'tenants' | 'licensing' | 'invitations' | 'metrics' | 'leads'>('tenants');

  // Search & Filter for Tenants
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [tenantPackageFilter, setTenantPackageFilter] = useState<string>('all');

  // Search & Filter for Packages
  const [packageStatusFilter, setPackageStatusFilter] = useState<'all' | 'active' | 'discontinued' | 'draft'>('all');

  // Modal 1: Onboard / Initialize New Tenant Profile (Diagram 2 - Khởi tạo hồ sơ chung cư)
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [stepAddTenant, setStepAddTenant] = useState<1 | 2 | 3 | 4>(1);
  // Form Section 1: Tạo hồ sơ chung cư
  const [formTenantName, setFormTenantName] = useState('');
  const [formTenantUnits, setFormTenantUnits] = useState(350);
  const [formTenantFloors, setFormTenantFloors] = useState(25);
  const [formTenantBlocks, setFormTenantBlocks] = useState(2);
  const [formTenantAddress, setFormTenantAddress] = useState('');
  // Form Section 2: Nhập thông tin đại diện pháp lý
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formTaxCode, setFormTaxCode] = useState('');
  const [formRepName, setFormRepName] = useState('');
  const [formRepTitle, setFormRepTitle] = useState('Trưởng Ban Quản Trị');
  const [formRepPhone, setFormRepPhone] = useState('');
  const [formRepEmail, setFormRepEmail] = useState('');
  // Form Section 3: Cấp mã và slug cho tenant
  const [formTenantCode, setFormTenantCode] = useState('');
  const [formTenantSlug, setFormTenantSlug] = useState('');
  // Form Section 4: Cập nhật thông tin liên hệ & Gói bản quyền
  const [formHotline, setFormHotline] = useState('1900 6868');
  const [formSupportEmail, setFormSupportEmail] = useState('');
  const [formOfficeLocation, setFormOfficeLocation] = useState('Tầng 1 Sảnh chính');
  const [formWorkingHours, setFormWorkingHours] = useState('08:00 - 17:30 (Thứ 2 - Thứ 7)');
  const [formSelectedPackage, setFormSelectedPackage] = useState<string>('pkg-pro');

  // Modal 2: Suspend Tenant (Diagram 2 - Tạm ngưng Tenant)
  const [suspendingTenant, setSuspendingTenant] = useState<TenantCondo | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Modal 3: Restore Tenant (Diagram 2 - Khôi phục Tenant)
  const [restoringTenant, setRestoringTenant] = useState<TenantCondo | null>(null);

  // Modal 4: Invite Tenant Admin (Diagram 2 - Mời Tenant Admin)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTenantId, setInviteTenantId] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'owner'>('manager');
  const [inviteNotes, setInviteNotes] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Modal 5: Package Create / Edit (Diagram 1 - Tạo / Cập nhật gói bản quyền)
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [pkgCode, setPkgCode] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgTagline, setPkgTagline] = useState('');
  const [pkgPrice, setPkgPrice] = useState<number>(11000000);
  const [pkgDiscount, setPkgDiscount] = useState<number>(15);
  const [pkgMaxUnits, setPkgMaxUnits] = useState<number>(500);
  const [pkgIsPopular, setPkgIsPopular] = useState(false);
  const [pkgStatus, setPkgStatus] = useState<'active' | 'draft'>('active');
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');

  // Modal 6: Discontinue Package (Diagram 1 - Ngừng kinh doanh gói)
  const [discontinuingPackage, setDiscontinuingPackage] = useState<SubscriptionPackage | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState('');

  // Modal 7: View Package Details (Diagram 1 - Xem thông tin gói bản quyền)
  const [viewingPackage, setViewingPackage] = useState<SubscriptionPackage | null>(null);

  // Modal 8: View Tenants Using Package (Diagram 1 - Xem Tenant đang sử dụng từng gói)
  const [viewingPackageTenants, setViewingPackageTenants] = useState<SubscriptionPackage | null>(null);

  // Modal 9: View Tenant Full Profile Details
  const [viewingTenantDetail, setViewingTenantDetail] = useState<TenantCondo | null>(null);

  // Sales leads state
  const [salesLeads] = useState<SalesLead[]>(INITIAL_SALES_LEADS);

  // Platform metrics
  const totalPlatformUnits = tenants.reduce((s, t) => s + t.totalApartments, 0);
  const totalPlatformMRR = tenants.reduce((s, t) => s + (t.status === 'suspended' ? 0 : t.monthlyFee), 0);
  const activeTenantsCount = tenants.filter((t) => t.status === 'active').length;
  const suspendedTenantsCount = tenants.filter((t) => t.status === 'suspended').length;
  const trialTenantsCount = tenants.filter((t) => t.status === 'trial').length;

  // Auto generate slug and code from tenant name
  const handleNameChange = (name: string) => {
    setFormTenantName(name);
    // Generate code
    const words = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/);
    const codeGen = words
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    if (!formTenantCode || formTenantCode === '') {
      setFormTenantCode(codeGen || 'NEW');
    }
    // Generate slug
    const slugGen = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (!formTenantSlug || formTenantSlug === '') {
      setFormTenantSlug(slugGen || 'tenant');
    }
  };

  // Open Onboard Modal
  const handleOpenAddTenant = () => {
    setStepAddTenant(1);
    setFormTenantName('');
    setFormTenantUnits(350);
    setFormTenantFloors(25);
    setFormTenantBlocks(2);
    setFormTenantAddress('');
    setFormCompanyName('');
    setFormTaxCode('');
    setFormRepName('');
    setFormRepTitle('Trưởng Ban Quản Trị');
    setFormRepPhone('');
    setFormRepEmail('');
    setFormTenantCode('');
    setFormTenantSlug('');
    setFormHotline('1900 6868');
    setFormSupportEmail('');
    setFormOfficeLocation('Tầng 1 Sảnh chính');
    setFormWorkingHours('08:00 - 17:30 (Thứ 2 - Thứ 7)');
    setFormSelectedPackage('pkg-pro');
    setShowAddTenantModal(true);
  };

  // Submit Onboard Modal
  const handleSubmitOnboardTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTenantName.trim() || !formTenantCode.trim() || !formTenantSlug.trim()) return;

    const matchedPkg = packages.find((p) => p.id === formSelectedPackage || p.code === formSelectedPackage) || packages[0];

    onAddTenant({
      name: formTenantName.trim(),
      code: formTenantCode.trim().toUpperCase(),
      slug: formTenantSlug.trim().toLowerCase(),
      address: formTenantAddress.trim() || 'TP. Hồ Chí Minh',
      totalApartments: formTenantUnits,
      totalFloors: formTenantFloors,
      totalBlocks: formTenantBlocks,
      occupancyRate: 90.0,
      activeResidents: Math.round(formTenantUnits * 2.8),
      managerName: formRepName.trim() || 'Ban Quản Trị lâm thời',
      managerEmail: formRepEmail.trim() || undefined,
      managerPhone: formRepPhone.trim() || undefined,
      status: 'active',
      package: matchedPkg?.name || 'Professional',
      packageId: matchedPkg?.id || 'pkg-pro',
      monthlyFee: matchedPkg?.monthlyPrice || 11000000,
      legalInfo: {
        companyName: formCompanyName.trim() || `Ban Quản Trị ${formTenantName}`,
        taxCode: formTaxCode.trim() || '0300000000',
        representativeName: formRepName.trim() || 'Đại diện hợp pháp',
        representativeTitle: formRepTitle.trim() || 'Trưởng BQT',
        representativePhone: formRepPhone.trim() || '0900000000',
        representativeEmail: formRepEmail.trim() || 'rep@condo.vn',
      },
      contactInfo: {
        hotline: formHotline.trim() || '1900 6868',
        supportEmail: formSupportEmail.trim() || 'support@condo.vn',
        officeLocation: formOfficeLocation.trim() || 'Tầng 1',
        workingHours: formWorkingHours.trim() || '08:00 - 17:30',
      },
    });

    setShowAddTenantModal(false);
  };

  // Suspend action
  const handleConfirmSuspend = () => {
    if (!suspendingTenant) return;
    onSuspendTenant(suspendingTenant.id, suspendReason.trim() || 'Tạm ngưng theo quyết định của Quản trị viên hệ thống');
    setSuspendingTenant(null);
    setSuspendReason('');
  };

  // Restore action
  const handleConfirmRestore = () => {
    if (!restoringTenant) return;
    onRestoreTenant(restoringTenant.id);
    setRestoringTenant(null);
  };

  // Open Invite Modal
  const handleOpenInviteModal = (tenantId?: string) => {
    setInviteTenantId(tenantId || tenants[0]?.id || '');
    setInviteFullName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteRole('manager');
    setInviteNotes('');
    setShowInviteModal(true);
  };

  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTenantId || !inviteEmail.trim() || !inviteFullName.trim()) return;

    const targetTenant = tenants.find((t) => t.id === inviteTenantId);
    if (!targetTenant) return;

    onInviteTenantAdmin({
      tenantId: targetTenant.id,
      tenantName: targetTenant.name,
      fullName: inviteFullName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim(),
      role: inviteRole,
      invitedBy: 'Super Admin',
      notes: inviteNotes.trim() || undefined,
    });

    setShowInviteModal(false);
    setActiveTab('invitations');
  };

  // Open Create/Edit Package Modal
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPkgCode(`PKG-${Date.now().toString().slice(-4)}`);
    setPkgName('');
    setPkgTagline('');
    setPkgPrice(11000000);
    setPkgDiscount(15);
    setPkgMaxUnits(500);
    setPkgIsPopular(false);
    setPkgStatus('active');
    setPkgFeaturesText(
      'Quản lý căn hộ & hồ sơ cư dân\nHóa đơn điện tử & VietQR tự động\nCổng cư dân (Resident Portal)\nTrợ lý AI phân tích & gợi ý công việc\nHỗ trợ kỹ thuật 24/7'
    );
    setShowPackageModal(true);
  };

  const handleOpenEditPackage = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setPkgCode(pkg.code);
    setPkgName(pkg.name);
    setPkgTagline(pkg.tagline);
    setPkgPrice(pkg.monthlyPrice);
    setPkgDiscount(pkg.annualDiscountPercent);
    setPkgMaxUnits(pkg.maxApartments);
    setPkgIsPopular(!!pkg.isPopular);
    setPkgStatus(pkg.status === 'discontinued' ? 'draft' : pkg.status);
    setPkgFeaturesText(pkg.features.join('\n'));
    setShowPackageModal(true);
  };

  const handleSubmitPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgCode.trim() || !pkgName.trim()) return;

    const featuresList = pkgFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingPackage) {
      onUpdatePackage(editingPackage.id, {
        code: pkgCode.trim().toUpperCase(),
        name: pkgName.trim(),
        tagline: pkgTagline.trim(),
        monthlyPrice: Number(pkgPrice),
        annualDiscountPercent: Number(pkgDiscount),
        maxApartments: Number(pkgMaxUnits),
        isPopular: pkgIsPopular,
        status: pkgStatus,
        features: featuresList,
      });
    } else {
      onAddPackage({
        code: pkgCode.trim().toUpperCase(),
        name: pkgName.trim(),
        tagline: pkgTagline.trim(),
        monthlyPrice: Number(pkgPrice),
        annualDiscountPercent: Number(pkgDiscount),
        maxApartments: Number(pkgMaxUnits),
        isPopular: pkgIsPopular,
        status: pkgStatus,
        features: featuresList,
      });
    }

    setShowPackageModal(false);
  };

  const handleConfirmDiscontinuePackage = () => {
    if (!discontinuingPackage) return;
    onDiscontinuePackage(discontinuingPackage.id, discontinueReason.trim() || 'Ngừng kinh doanh theo chính sách sản phẩm mới');
    setDiscontinuingPackage(null);
    setDiscontinueReason('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  // Filtered lists
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.address.toLowerCase().includes(tenantSearch.toLowerCase());
    const matchesStatus = tenantStatusFilter === 'all' || t.status === tenantStatusFilter;
    const matchesPackage = tenantPackageFilter === 'all' || t.package === tenantPackageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const filteredPackages = packages.filter((p) => {
    if (packageStatusFilter === 'all') return true;
    return p.status === packageStatusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Quản trị viên Super Admin
            </span>
            <span className="text-xs text-slate-400">Nền tảng Multi-tenant EZCondo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Trung Tâm Quản Trị Hệ Thống SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý chính sách thương mại gói bản quyền & Quản lý toàn bộ hồ sơ chung cư (Tenants).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenInviteModal()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Mời Tenant Admin</span>
          </button>

          <button
            onClick={handleOpenAddTenant}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Khởi tạo hồ sơ chung cư</span>
          </button>
        </div>
      </div>

      {/* Platform KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng Chung Cư (Tenants)</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{tenants.length} Tòa nhà</div>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 font-semibold">{activeTenantsCount} Đang hoạt động</span>
            {suspendedTenantsCount > 0 && (
              <span className="text-rose-600 font-semibold">• {suspendedTenantsCount} Tạm ngưng</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Doanh Thu Thuê Bao (MRR)</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {(totalPlatformMRR / 1000000).toFixed(0)} Triệu đ
          </div>
          <span className="mt-1 text-[11px] text-slate-400 block">
            ARR quy năm: {((totalPlatformMRR * 12) / 1000000000).toFixed(2)} tỷ đ
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Gói Bản Quyền Thương Mại</span>
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{packages.length} Gói dịch vụ</div>
          <span className="mt-1 text-[11px] text-slate-500 block">
            {packages.filter((p) => p.status === 'active').length} gói đang kinh doanh
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Hạ Tầng AI & Cloud Uptime</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>99.98%</span>
          </div>
          <span className="mt-1 text-[11px] text-slate-400 block">Gemini 3.8 Flash • Latency 42ms</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tenants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Quản lý Chung Cư ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('licensing')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'licensing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Quản lý Chính Sách Thương Mại ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'invitations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Lời Mời Tenant Admin ({tenantInvitations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Giám Sát Hệ Thống Cloud</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'leads'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          <span>Khách Hàng Mới & Sales Leads ({salesLeads.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ CHUNG CƯ (Diagram 2) */}
      {/* ========================================================================= */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên chung cư, mã, slug, địa chỉ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={tenantStatusFilter}
                onChange={(e) => setTenantStatusFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="suspended">Tạm ngưng</option>
                <option value="trial">Dùng thử</option>
              </select>

              <select
                value={tenantPackageFilter}
                onChange={(e) => setTenantPackageFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả gói bản quyền</option>
                <option value="Standard">Gói Standard</option>
                <option value="Professional">Gói Professional</option>
                <option value="Enterprise">Gói Enterprise</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5">Chung Cư & Mã / Slug</th>
                    <th className="px-4 py-3.5">Quy Mô & Địa Chỉ</th>
                    <th className="px-4 py-3.5">Đại Diện Pháp Lý & MST</th>
                    <th className="px-4 py-3.5">Gói Bản Quyền</th>
                    <th className="px-4 py-3.5">Phí Thuê Bao</th>
                    <th className="px-4 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Không tìm thấy chung cư nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const isSuspended = t.status === 'suspended';
                      return (
                        <tr
                          key={t.id}
                          className={`transition ${
                            isSuspended ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-start gap-2">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{t.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                    {t.code}
                                  </span>
                                  <a
                                    href={`https://${t.slug}.ezcondo.vn`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.preventDefault()}
                                    className="font-mono text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
                                    title="Subdomain tenant"
                                  >
                                    <span>{t.slug}.ezcondo.vn</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 max-w-[210px]">
                            <div className="text-slate-800 font-semibold">
                              {t.totalApartments} căn
                              {t.totalBlocks ? ` • ${t.totalBlocks} tháp` : ''}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block mt-0.5" title={t.address}>
                              {t.address}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 max-w-[200px]">
                            <p className="font-semibold text-slate-900 truncate">
                              {t.legalInfo?.companyName || t.managerName}
                            </p>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>MST: {t.legalInfo?.taxCode || 'Chưa cập nhật'}</span>
                              <span>• {t.legalInfo?.representativeName || t.managerName}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                t.package.includes('Enterprise')
                                  ? 'bg-purple-100 text-purple-700'
                                  : t.package.includes('Professional')
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.package}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {t.monthlyFee.toLocaleString('vi-VN')} đ/tháng
                          </td>

                          <td className="px-4 py-3.5">
                            {isSuspended ? (
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                                  <Ban className="h-3 w-3" /> Tạm ngưng
                                </span>
                                {t.suspensionReason && (
                                  <span
                                    className="block text-[10px] text-rose-600 truncate max-w-[130px] mt-0.5"
                                    title={t.suspensionReason}
                                  >
                                    {t.suspensionReason}
                                  </span>
                                )}
                              </div>
                            ) : t.status === 'trial' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                Dùng thử
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingTenantDetail(t)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition"
                                title="Xem hồ sơ pháp lý & liên hệ"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenInviteModal(t.id)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-blue-600 hover:bg-blue-50 transition"
                                title="Mời Tenant Admin (Quản trị viên chung cư)"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </button>

                              {isSuspended ? (
                                <button
                                  onClick={() => setRestoringTenant(t)}
                                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                                  title="Khôi phục hoạt động cho Tenant"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Khôi phục</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSuspendingTenant(t);
                                    setSuspendReason('');
                                  }}
                                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition"
                                  title="Tạm ngưng Tenant"
                                >
                                  <Ban className="h-3 w-3" />
                                  <span>Tạm ngưng</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ CHÍNH SÁCH THƯƠNG MẠI (Diagram 1) */}
      {/* ========================================================================= */}
      {activeTab === 'licensing' && (
        <div className="space-y-6">
          {/* Sub Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Danh Sách Gói Thuê Bao Bản Quyền Nền Tảng
              </h2>
              <p className="text-xs text-slate-500">
                Thiết lập định mức tính năng, chính sách giá và theo dõi các chung cư đang sử dụng từng gói.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={packageStatusFilter}
                onChange={(e) => setPackageStatusFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả gói ({packages.length})</option>
                <option value="active">Đang kinh doanh ({packages.filter((p) => p.status === 'active').length})</option>
                <option value="discontinued">Ngừng kinh doanh ({packages.filter((p) => p.status === 'discontinued').length})</option>
                <option value="draft">Dự thảo</option>
              </select>

              <button
                onClick={handleOpenAddPackage}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo gói bản quyền mới</span>
              </button>
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => {
              const isDiscontinued = pkg.status === 'discontinued';
              const usingTenants = tenants.filter(
                (t) => t.packageId === pkg.id || t.package.toLowerCase().includes(pkg.name.toLowerCase().replace('gói ', ''))
              );
              const mrrFromThisPackage = usingTenants.reduce((s, t) => s + (t.status === 'suspended' ? 0 : t.monthlyFee), 0);

              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between bg-white shadow-xs transition relative ${
                    isDiscontinued
                      ? 'border-slate-300 bg-slate-50/70 opacity-80'
                      : pkg.isPopular
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Badges row */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {pkg.code}
                      </span>
                      {isDiscontinued ? (
                        <span className="rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-[10px] font-bold">
                          Ngừng kinh doanh
                        </span>
                      ) : pkg.isPopular ? (
                        <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Phổ biến nhất
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                          Đang kinh doanh
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{pkg.tagline}</p>

                    {/* Pricing */}
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-xl font-extrabold text-blue-700">
                        {pkg.monthlyPrice.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-500">/ tháng</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        Giảm {pkg.annualDiscountPercent}% khi thanh toán theo năm ({((pkg.monthlyPrice * 12 * (100 - pkg.annualDiscountPercent)) / 100 / 1000000).toFixed(1)} tr/năm)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-medium">
                        Quy mô: <strong>{pkg.maxApartments >= 9999 ? 'Không giới hạn căn hộ' : `Tối đa ${pkg.maxApartments} căn hộ`}</strong>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="mt-4 space-y-2 text-xs text-slate-700">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                        Tính năng gói:
                      </span>
                      {pkg.features.slice(0, 5).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-xs line-clamp-1">{feat}</span>
                        </div>
                      ))}
                      {pkg.features.length > 5 && (
                        <button
                          onClick={() => setViewingPackage(pkg)}
                          className="text-[11px] text-blue-600 font-semibold hover:underline"
                        >
                          + Xem thêm {pkg.features.length - 5} tính năng...
                        </button>
                      )}
                    </div>

                    {/* Discontinued reason notice */}
                    {isDiscontinued && pkg.discontinuedReason && (
                      <div className="mt-3 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700 border border-rose-200/60">
                        <span className="font-bold block">Lý do ngừng kinh doanh:</span>
                        <span>{pkg.discontinuedReason}</span>
                      </div>
                    )}

                    {/* Tenant usage metric */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Đang sử dụng:</span>
                        <strong className="text-slate-900">{usingTenants.length} chung cư</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[11px]">MRR đóng góp:</span>
                        <strong className="text-emerald-700">{(mrrFromThisPackage / 1000000).toFixed(1)} tr/tháng</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 space-y-2 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setViewingPackageTenants(pkg)}
                        className="rounded-xl border border-blue-200 bg-blue-50/80 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition text-center"
                      >
                        Xem {usingTenants.length} Tenant
                      </button>

                      <button
                        onClick={() => handleOpenEditPackage(pkg)}
                        className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
                      >
                        Cập nhật gói
                      </button>
                    </div>

                    {isDiscontinued ? (
                      <button
                        onClick={() => onReactivatePackage(pkg.id)}
                        className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        Mở bán lại gói này
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setDiscontinuingPackage(pkg);
                          setDiscontinueReason('');
                        }}
                        className="w-full rounded-xl border border-rose-200 bg-white py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Ngừng kinh doanh gói
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LỜI MỜI TENANT ADMIN (Diagram 2 - Mời Tenant Admin) */}
      {/* ========================================================================= */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Nhật Ký Lời Mời Quản Trị Viên Chung Cư (Tenant Admin Invitations)
              </h2>
              <p className="text-xs text-slate-500">
                Cấp quyền khởi tạo tài khoản quản trị viên sơ cấp cho Trưởng Ban Quản Lý hoặc Ban Quản Trị mới.
              </p>
            </div>

            <button
              onClick={() => handleOpenInviteModal()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>Gửi lời mời Quản trị viên mới</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5">Chung Cư Được Ủy Quyền</th>
                    <th className="px-4 py-3.5">Họ Tên Quản Trị Viên</th>
                    <th className="px-4 py-3.5">Email & SĐT</th>
                    <th className="px-4 py-3.5">Vai Trò Được Cấp</th>
                    <th className="px-4 py-3.5">Mã Mời & Link Kích Hoạt</th>
                    <th className="px-4 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Chưa có lời mời nào được gửi.
                      </td>
                    </tr>
                  ) : (
                    tenantInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <strong className="text-slate-900 block">{inv.tenantName}</strong>
                          <span className="text-[10px] text-slate-400">Gửi lúc: {inv.sentAt}</span>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-slate-800">{inv.fullName}</td>

                        <td className="px-4 py-3.5">
                          <span className="text-slate-700 block">{inv.email}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{inv.phone}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                            {inv.role === 'manager' ? 'Quản lý trưởng (Manager)' : 'Ban Quản trị (Owner)'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                              {inv.invitationCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(inv.invitationLink, inv.id)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Sao chép link mời"
                            >
                              {copySuccess === inv.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {inv.status === 'accepted' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Đã kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <Clock className="h-3 w-3" /> Chờ kích hoạt
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {inv.status === 'pending' ? (
                            <button
                              onClick={() => onResendInvitation(inv.id)}
                              className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                            >
                              Gửi lại thư mời
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Kích hoạt: {inv.acceptedAt}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYSTEM METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-semibold block">Hạ Tầng AI Server</span>
              <div className="text-xl font-bold text-slate-900">Google Gemini 3.8 Flash</div>
              <p className="text-[11px] text-slate-400">Thời gian phản hồi AI trung bình: 780ms</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-semibold block">Tải CPU & Bộ Nhớ Server</span>
              <div className="text-xl font-bold text-emerald-600">22% Tải trung bình</div>
              <p className="text-[11px] text-slate-400">Tự động Scale-out khi lượng giao dịch tăng</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-semibold block">An Toàn Thông Tin & Dữ Liệu</span>
              <div className="text-xl font-bold text-blue-700">SSL / TLS 1.3 Mã Hóa</div>
              <p className="text-[11px] text-slate-400">Sao lưu dữ liệu định kỳ mỗi 6 tiếng</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SALES LEADS */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Tòa Nhà / Chung Cư Quan Tâm</th>
                <th className="px-4 py-3.5">Người Đại Diện Liên Hệ</th>
                <th className="px-4 py-3.5">Số Điện Thoại</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Quy Mô</th>
                <th className="px-4 py-3.5">Gói Đề Xuất</th>
                <th className="px-4 py-3.5">Trạng Thái Bán Hàng</th>
                <th className="px-5 py-3.5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-bold text-slate-900">{lead.buildingName}</td>
                  <td className="px-4 py-4 text-slate-800">{lead.contactPerson}</td>
                  <td className="px-4 py-4 text-slate-600 font-mono">{lead.phone}</td>
                  <td className="px-4 py-4 text-slate-500">{lead.email}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{lead.units} căn</td>
                  <td className="px-4 py-4 text-blue-700 font-semibold">{lead.plan}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        lead.status === 'Chờ ký kết'
                          ? 'bg-purple-100 text-purple-700'
                          : lead.status === 'Đang tư vấn demo'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        handleOpenAddTenant();
                        setFormTenantName(lead.buildingName);
                        setFormTenantUnits(lead.units);
                        setFormRepName(lead.contactPerson);
                        setFormRepPhone(lead.phone);
                        setFormRepEmail(lead.email);
                      }}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Khởi tạo Tenant
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: KHỞI TẠO HỒ SƠ CHUNG CƯ (Diagram 2: 4 mục cụ thể) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        title="Khởi Tạo Hồ Sơ Chung Cư Mới (New Tenant Onboarding)"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              Bước {stepAddTenant} / 4:{' '}
              {stepAddTenant === 1 && 'Hồ sơ chung cư'}
              {stepAddTenant === 2 && 'Đại diện pháp lý'}
              {stepAddTenant === 3 && 'Mã & Slug subdomain'}
              {stepAddTenant === 4 && 'Liên hệ & Gói bản quyền'}
            </div>

            <div className="flex items-center gap-2">
              {stepAddTenant > 1 && (
                <button
                  type="button"
                  onClick={() => setStepAddTenant((prev) => (prev - 1) as any)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Quay lại
                </button>
              )}

              {stepAddTenant < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (stepAddTenant === 1 && !formTenantName.trim()) {
                      alert('Vui lòng nhập tên dự án chung cư');
                      return;
                    }
                    setStepAddTenant((prev) => (prev + 1) as any);
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitOnboardTenant}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Hoàn tất & Kích hoạt Tenant
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Step Progress Tabs */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-bold pb-2 border-b border-slate-100">
            <button
              onClick={() => setStepAddTenant(1)}
              className={`p-1.5 rounded-lg text-[11px] ${
                stepAddTenant === 1 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
              }`}
            >
              1. Hồ sơ chung cư
            </button>
            <button
              onClick={() => setStepAddTenant(2)}
              className={`p-1.5 rounded-lg text-[11px] ${
                stepAddTenant === 2 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
              }`}
            >
              2. Đại diện pháp lý
            </button>
            <button
              onClick={() => setStepAddTenant(3)}
              className={`p-1.5 rounded-lg text-[11px] ${
                stepAddTenant === 3 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
              }`}
            >
              3. Mã & Slug
            </button>
            <button
              onClick={() => setStepAddTenant(4)}
              className={`p-1.5 rounded-lg text-[11px] ${
                stepAddTenant === 4 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'
              }`}
            >
              4. Gói & Liên hệ
            </button>
          </div>

          {/* STEP 1: TẠO HỒ SƠ CHUNG CƯ */}
          {stepAddTenant === 1 && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên dự án chung cư / tòa nhà <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTenantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="VD: The Metropole Thủ Thiêm"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tổng số căn hộ *</label>
                  <input
                    type="number"
                    min="1"
                    value={formTenantUnits}
                    onChange={(e) => setFormTenantUnits(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số tầng cao</label>
                  <input
                    type="number"
                    min="1"
                    value={formTenantFloors}
                    onChange={(e) => setFormTenantFloors(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số block / tháp</label>
                  <input
                    type="number"
                    min="1"
                    value={formTenantBlocks}
                    onChange={(e) => setFormTenantBlocks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ chi tiết dự án *</label>
                <textarea
                  rows={2}
                  value={formTenantAddress}
                  onChange={(e) => setFormTenantAddress(e.target.value)}
                  placeholder="VD: Khu đô thị mới Thủ Thiêm, Phường An Khánh, TP. Thủ Đức, TP. Hồ Chí Minh"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 2: NHẬP THÔNG TIN ĐẠI DIỆN PHÁP LÝ */}
          {stepAddTenant === 2 && (
            <div className="space-y-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-[11px] text-blue-800 border border-blue-200">
                Thông tin pháp nhân chủ quản phục vụ xuất hóa đơn điện tử, hợp đồng dịch vụ SaaS và xác minh tư cách vận hành.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên pháp nhân (Công ty / BQT) *</label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="VD: Công ty CP Bất động sản Sơn Kim"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã số thuế (MST) *</label>
                  <input
                    type="text"
                    value={formTaxCode}
                    onChange={(e) => setFormTaxCode(e.target.value)}
                    placeholder="VD: 0315891234"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người đại diện pháp luật *</label>
                  <input
                    type="text"
                    value={formRepName}
                    onChange={(e) => setFormRepName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Hưng"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chức vụ đại diện</label>
                  <input
                    type="text"
                    value={formRepTitle}
                    onChange={(e) => setFormRepTitle(e.target.value)}
                    placeholder="VD: Tổng Giám Đốc / Trưởng Ban Quản Trị"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số điện thoại đại diện</label>
                  <input
                    type="text"
                    value={formRepPhone}
                    onChange={(e) => setFormRepPhone(e.target.value)}
                    placeholder="VD: 0909123456"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email đại diện pháp lý</label>
                  <input
                    type="email"
                    value={formRepEmail}
                    onChange={(e) => setFormRepEmail(e.target.value)}
                    placeholder="VD: rep@metropole.com"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CẤP MÃ VÀ SLUG CHO TENANT */}
          {stepAddTenant === 3 && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mã định danh chung cư (Tenant Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTenantCode}
                  onChange={(e) => setFormTenantCode(e.target.value.toUpperCase())}
                  placeholder="VD: MTP-TT"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-mono uppercase focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dùng để đánh mã căn hộ, hóa đơn và phân biệt các tòa nhà trong cụm multi-tenant.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Định danh đường dẫn (Tenant Slug / Subdomain) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 py-2.5 text-xs text-slate-500 font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    value={formTenantSlug}
                    onChange={(e) => setFormTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="metropole-thuthiem"
                    className="flex-1 rounded-none border border-slate-200 p-2.5 text-xs text-slate-800 font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="rounded-r-xl border border-l-0 border-slate-200 bg-slate-100 px-3 py-2.5 text-xs text-slate-500 font-mono">
                    .ezcondo.vn
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                  Cổng Cư Dân riêng biệt: https://{formTenantSlug || 'tenant'}.ezcondo.vn
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: CẬP NHẬT THÔNG TIN LIÊN HỆ & GÓI BẢN QUYỀN */}
          {stepAddTenant === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hotline BQL 24/7 *</label>
                  <input
                    type="text"
                    value={formHotline}
                    onChange={(e) => setFormHotline(e.target.value)}
                    placeholder="VD: 1900 6868"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email tiếp nhận kỹ thuật / CSKH</label>
                  <input
                    type="email"
                    value={formSupportEmail}
                    onChange={(e) => setFormSupportEmail(e.target.value)}
                    placeholder="VD: cskh@metropole.com"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Văn phòng BQL tại tòa nhà</label>
                  <input
                    type="text"
                    value={formOfficeLocation}
                    onChange={(e) => setFormOfficeLocation(e.target.value)}
                    placeholder="VD: Tầng 1, Sảnh Tháp Galleria"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khung giờ làm việc BQL</label>
                  <input
                    type="text"
                    value={formWorkingHours}
                    onChange={(e) => setFormWorkingHours(e.target.value)}
                    placeholder="VD: 08:00 - 17:30 (Thứ 2 - Thứ 7)"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chọn gói thuê bao bản quyền SaaS áp dụng *
                </label>
                <select
                  value={formSelectedPackage}
                  onChange={(e) => setFormSelectedPackage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {packages
                    .filter((p) => p.status === 'active')
                    .map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.monthlyPrice.toLocaleString('vi-VN')} đ/tháng) - Tối đa {pkg.maxApartments} căn
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: TẠM NGƯNG TENANT (Diagram 2 - Tạm ngưng Tenant) */}
      {/* ========================================================================= */}
      {suspendingTenant && (
        <Modal
          isOpen={!!suspendingTenant}
          onClose={() => setSuspendingTenant(null)}
          title="Tạm Ngưng Vận Hành Chung Cư (Suspend Tenant)"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setSuspendingTenant(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Xác nhận Tạm ngưng Tenant
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-rose-800 border border-rose-200">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Bạn đang chuẩn bị tạm ngưng chung cư <strong>{suspendingTenant.name} ({suspendingTenant.code})</strong>. Toàn bộ người dùng thuộc chung cư này sẽ không thể truy cập cho đến khi được khôi phục.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Lý do tạm ngưng <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="VD: Quá hạn thanh toán phí thuê bao SaaS 60 ngày, vi phạm điều khoản bảo mật..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KHÔI PHỤC TENANT (Diagram 2 - Khôi phục Tenant) */}
      {/* ========================================================================= */}
      {restoringTenant && (
        <Modal
          isOpen={!!restoringTenant}
          onClose={() => setRestoringTenant(null)}
          title="Khôi Phục Hoạt Động Chung Cư (Restore Tenant)"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setRestoringTenant(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRestore}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Xác nhận khôi phục hoạt động
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Khôi phục trạng thái hoạt động bình thường cho chung cư <strong>{restoringTenant.name}</strong>. Cổng cư dân và phân hệ quản lý sẽ hoạt động trở lại ngay lập tức.
              </p>
            </div>

            {restoringTenant.suspensionReason && (
              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
                Lý do tạm ngưng trước đó: <em>&ldquo;{restoringTenant.suspensionReason}&rdquo;</em>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MỜI TENANT ADMIN (Diagram 2 - Mời Tenant Admin) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Mời Quản Trị Viên Chung Cư (Invite Tenant Admin)"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setShowInviteModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitInvite}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Tạo mã & Gửi thư mời
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitInvite} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Chung cư được chỉ định *</label>
            <select
              value={inviteTenantId}
              onChange={(e) => setInviteTenantId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code}) - {t.slug}.ezcondo.vn
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Họ tên Quản trị viên *</label>
              <input
                type="text"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                placeholder="VD: Nguyễn Hoàng Long"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vai trò ủy quyền *</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              >
                <option value="manager">Trưởng Ban Quản Lý (Tenant Manager)</option>
                <option value="owner">Đại diện Ban Quản Trị (Tenant Owner)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email nhận thư mời *</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="long.nh@masteri.vn"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Số điện thoại</label>
              <input
                type="text"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                placeholder="0903123899"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ghi chú lời mời</label>
            <input
              type="text"
              value={inviteNotes}
              onChange={(e) => setInviteNotes(e.target.value)}
              placeholder="VD: Cấp quyền quản trị viên trưởng tòa nhà mới nghiệm thu"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: TẠO / CẬP NHẬT GÓI BẢN QUYỀN (Diagram 1) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        title={editingPackage ? 'Cập Nhật Gói Bản Quyền' : 'Tạo Gói Bản Quyền Thương Mại Mới'}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setShowPackageModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitPackage}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              {editingPackage ? 'Lưu thay đổi' : 'Tạo gói bản quyền'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitPackage} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mã gói bản quyền *</label>
              <input
                type="text"
                value={pkgCode}
                onChange={(e) => setPkgCode(e.target.value.toUpperCase())}
                placeholder="VD: PKG-PRO-PLUS"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên gói dịch vụ *</label>
              <input
                type="text"
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                placeholder="VD: Gói Professional Plus"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Khẩu hiệu / Tagline ngắn</label>
            <input
              type="text"
              value={pkgTagline}
              onChange={(e) => setPkgTagline(e.target.value)}
              placeholder="VD: Dành cho các tòa nhà hiện đại tích hợp trợ lý AI thông minh"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giá theo tháng (VND) *</label>
              <input
                type="number"
                min="0"
                step="500000"
                value={pkgPrice}
                onChange={(e) => setPkgPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giảm giá năm (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={pkgDiscount}
                onChange={(e) => setPkgDiscount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giới hạn số căn</label>
              <input
                type="number"
                min="50"
                value={pkgMaxUnits}
                onChange={(e) => setPkgMaxUnits(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Danh sách tính năng gói (mỗi dòng một tính năng)
            </label>
            <textarea
              rows={4}
              value={pkgFeaturesText}
              onChange={(e) => setPkgFeaturesText(e.target.value)}
              placeholder="Quản lý cư dân & hợp đồng&#10;Hóa đơn VietQR tự động&#10;Gemini AI Phân công tự động"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-mono"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pkgIsPopular}
                onChange={(e) => setPkgIsPopular(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-slate-700">Đánh dấu gói &ldquo;Phổ biến nhất&rdquo;</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Trạng thái:</span>
              <select
                value={pkgStatus}
                onChange={(e) => setPkgStatus(e.target.value as any)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
              >
                <option value="active">Đang kinh doanh</option>
                <option value="draft">Dự thảo</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: NGỪNG KINH DOANH GÓI (Diagram 1) */}
      {/* ========================================================================= */}
      {discontinuingPackage && (
        <Modal
          isOpen={!!discontinuingPackage}
          onClose={() => setDiscontinuingPackage(null)}
          title="Ngừng Kinh Doanh Gói Bản Quyền (Discontinue Package)"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setDiscontinuingPackage(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDiscontinuePackage}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Xác nhận ngừng kinh doanh
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-800 border border-amber-200">
              <p className="text-[11px] leading-relaxed">
                Gói <strong>{discontinuingPackage.name}</strong> sẽ được chuyển sang trạng thái <strong>Ngừng kinh doanh</strong>. Các chung cư hiện đang sử dụng gói này vẫn sẽ tiếp tục được gia hạn theo chính sách bảo lưu.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Lý do ngừng kinh doanh <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                placeholder="VD: Thay thế bằng các gói cước tích hợp Gemini AI thế hệ mới..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: XEM CHI TIẾT GÓI (Diagram 1 - Xem thông tin gói bản quyền) */}
      {/* ========================================================================= */}
      {viewingPackage && (
        <Modal
          isOpen={!!viewingPackage}
          onClose={() => setViewingPackage(null)}
          title={`Thông Tin Chi Tiết: ${viewingPackage.name}`}
          maxWidth="max-w-lg"
          footer={
            <button
              onClick={() => setViewingPackage(null)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Đóng
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {viewingPackage.code}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{viewingPackage.name}</h4>
                <p className="text-slate-500 text-[11px]">{viewingPackage.tagline}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-blue-700">
                  {viewingPackage.monthlyPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="block text-[10px] text-slate-400">/ tháng</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-2">Toàn bộ tính năng đi kèm:</span>
              <div className="space-y-2">
                {viewingPackage.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <div>Ngày tạo gói: {viewingPackage.createdAt}</div>
              <div>Cập nhật gần nhất: {viewingPackage.updatedAt}</div>
              <div>Khuyến mãi năm: Chiết khấu {viewingPackage.annualDiscountPercent}%</div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: XEM TENANT ĐANG DÙNG GÓI (Diagram 1) */}
      {/* ========================================================================= */}
      {viewingPackageTenants && (
        <Modal
          isOpen={!!viewingPackageTenants}
          onClose={() => setViewingPackageTenants(null)}
          title={`Danh Sách Chung Cư Đang Sử Dụng: ${viewingPackageTenants.name}`}
          maxWidth="max-w-2xl"
          footer={
            <button
              onClick={() => setViewingPackageTenants(null)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Đóng
            </button>
          }
        >
          <div className="space-y-3 text-xs">
            {(() => {
              const matched = tenants.filter(
                (t) =>
                  t.packageId === viewingPackageTenants.id ||
                  t.package.toLowerCase().includes(viewingPackageTenants.name.toLowerCase().replace('gói ', ''))
              );

              if (matched.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400">
                    Hiện chưa có chung cư nào đăng ký gói bản quyền này.
                  </div>
                );
              }

              return (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="px-4 py-2.5">Chung Cư</th>
                        <th className="px-3 py-2.5">Quy Mô</th>
                        <th className="px-3 py-2.5">Phí Thuê Bao</th>
                        <th className="px-3 py-2.5">Trạng Thái</th>
                        <th className="px-3 py-2.5">Trưởng BQL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matched.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{t.name}</span>
                            <span className="font-mono text-[10px] text-blue-600 font-semibold">{t.code}</span>
                          </td>
                          <td className="px-3 py-3">{t.totalApartments} căn</td>
                          <td className="px-3 py-3 font-semibold text-slate-900">
                            {t.monthlyFee.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-3 py-3">
                            {t.status === 'suspended' ? (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                Tạm ngưng
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Hoạt động
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{t.managerName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: XEM CHI TIẾT HỒ SƠ CHUNG CƯ */}
      {/* ========================================================================= */}
      {viewingTenantDetail && (
        <Modal
          isOpen={!!viewingTenantDetail}
          onClose={() => setViewingTenantDetail(null)}
          title={`Hồ Sơ Toàn Diện: ${viewingTenantDetail.name}`}
          maxWidth="max-w-xl"
          footer={
            <button
              onClick={() => setViewingTenantDetail(null)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Đóng
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* General info */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">{viewingTenantDetail.name}</span>
                  <span className="font-mono text-xs text-blue-600 ml-2 font-bold">({viewingTenantDetail.code})</span>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  https://{viewingTenantDetail.slug}.ezcondo.vn
                </span>
              </div>
              <p className="text-slate-600 text-xs">{viewingTenantDetail.address}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>Tổng quy mô: <strong>{viewingTenantDetail.totalApartments} căn</strong></div>
                <div>Số tầng: <strong>{viewingTenantDetail.totalFloors || 25} tầng</strong></div>
                <div>Lấp đầy: <strong className="text-emerald-600">{viewingTenantDetail.occupancyRate}%</strong></div>
              </div>
            </div>

            {/* Legal info */}
            <div>
              <span className="font-bold text-slate-800 block mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                Thông tin đại diện pháp lý:
              </span>
              <div className="rounded-xl border border-slate-200 p-3 space-y-1.5 text-slate-700">
                <div>Pháp nhân: <strong>{viewingTenantDetail.legalInfo?.companyName || 'Ban Quản Trị Chung Cư'}</strong></div>
                <div>Mã số thuế: <strong className="font-mono">{viewingTenantDetail.legalInfo?.taxCode || '0309988112'}</strong></div>
                <div>Người đại diện: <strong>{viewingTenantDetail.legalInfo?.representativeName || viewingTenantDetail.managerName}</strong> ({viewingTenantDetail.legalInfo?.representativeTitle || 'Trưởng BQL'})</div>
                <div>Điện thoại đại diện: {viewingTenantDetail.legalInfo?.representativePhone || viewingTenantDetail.managerPhone || 'Chưa cập nhật'}</div>
                <div>Email đại diện: {viewingTenantDetail.legalInfo?.representativeEmail || viewingTenantDetail.managerEmail || 'Chưa cập nhật'}</div>
              </div>
            </div>

            {/* Contact info */}
            <div>
              <span className="font-bold text-slate-800 block mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                Thông tin liên hệ & Văn phòng Ban Quản Lý:
              </span>
              <div className="rounded-xl border border-slate-200 p-3 space-y-1.5 text-slate-700">
                <div>Hotline 24/7: <strong className="text-blue-700">{viewingTenantDetail.contactInfo?.hotline || '1900 6868'}</strong></div>
                <div>Email tiếp nhận CSKH: {viewingTenantDetail.contactInfo?.supportEmail || 'cskh@condo.vn'}</div>
                <div>Vị trí văn phòng BQL: {viewingTenantDetail.contactInfo?.officeLocation || 'Tầng 1 sảnh chính'}</div>
                <div>Giờ làm việc: {viewingTenantDetail.contactInfo?.workingHours || '08:00 - 17:30 (Thứ 2 - Thứ 7)'}</div>
              </div>
            </div>

            {/* Subscription info */}
            <div>
              <span className="font-bold text-slate-800 block mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                Gói bản quyền & Trạng thái dịch vụ:
              </span>
              <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{viewingTenantDetail.package}</span>
                  <span className="text-[11px] text-slate-500">Phí thuê bao: {viewingTenantDetail.monthlyFee.toLocaleString('vi-VN')} đ/tháng</span>
                </div>
                <div>
                  {viewingTenantDetail.status === 'suspended' ? (
                    <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-bold">
                      Tạm ngưng
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                      Đang hoạt động
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
