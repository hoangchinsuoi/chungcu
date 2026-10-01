import React, { useState } from 'react';
import {
  TenantCondo,
  UserRole,
  UserAccount,
  Apartment,
  Resident,
  Contract,
  Invoice,
  Complaint,
  StaffMember,
  ShiftSchedule,
  FacilityBooking,
  ApartmentStatus,
  ComplaintStatus,
  ServiceRequest,
  ParcelItem,
} from './types';
import {
  TENANTS_DATA,
  DEFAULT_ACCOUNTS,
  INITIAL_APARTMENTS,
  INITIAL_RESIDENTS,
  INITIAL_CONTRACTS,
  INITIAL_INVOICES,
  INITIAL_COMPLAINTS,
  INITIAL_STAFF,
  INITIAL_SHIFTS,
  INITIAL_BOOKINGS,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_PARCELS,
} from './data/mockData';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ApartmentManagement } from './components/apartments/ApartmentManagement';
import { ResidentManagement } from './components/residents/ResidentManagement';
import { BillingManagement } from './components/billing/BillingManagement';
import { ComplaintKanban } from './components/complaints/ComplaintKanban';
import { ServiceRequestsView } from './components/services/ServiceRequestsView';
import { ResidentHandbook } from './components/handbook/ResidentHandbook';
import { StaffManagement } from './components/staff/StaffManagement';
import { ReportsView } from './components/reports/ReportsView';
import { ResidentPortal } from './components/resident-portal/ResidentPortal';
import { SuperAdminView } from './components/super-admin/SuperAdminView';
import { AIChatDrawer } from './components/ai/AIChatDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { AccountSettingsModal } from './components/settings/AccountSettingsModal';
import { MessageCircle } from 'lucide-react';

export default function App() {
  // Tenancy state
  const [tenants, setTenants] = useState<TenantCondo[]>(TENANTS_DATA);
  const [currentTenant, setCurrentTenant] = useState<TenantCondo>(TENANTS_DATA[0]);

  // Auth User state
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEFAULT_ACCOUNTS[1] as UserAccount); // Ban Quản lý by default
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Core Data State
  const [apartments, setApartments] = useState<Apartment[]>(INITIAL_APARTMENTS);
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [shifts, setShifts] = useState<ShiftSchedule[]>(INITIAL_SHIFTS);
  const [bookings, setBookings] = useState<FacilityBooking[]>(INITIAL_BOOKINGS);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(INITIAL_SERVICE_REQUESTS);
  const [parcels, setParcels] = useState<ParcelItem[]>(INITIAL_PARCELS);

  // Global search & UI
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Role switch handler
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    // Find matching demo user for the role
    const matched = DEFAULT_ACCOUNTS.find((a) => a.role === newRole);
    if (matched) {
      setCurrentUser(matched as UserAccount);
    }
    if (newRole === 'resident') {
      setActiveTab('resident_portal');
    } else if (newRole === 'superadmin') {
      setActiveTab('super_admin');
    } else if (activeTab === 'resident_portal' || activeTab === 'super_admin') {
      setActiveTab('dashboard');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'resident') {
      setActiveTab('resident_portal');
    } else if (user.role === 'superadmin') {
      setActiveTab('super_admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleRegisterTenantSuccess = (newTenant: Partial<TenantCondo>, user: UserAccount) => {
    const fullTenant: TenantCondo = {
      id: `tenant-${Date.now()}`,
      name: newTenant.name || 'Dự án mới',
      code: newTenant.code || 'NEW',
      address: newTenant.address || 'TP. Hồ Chí Minh',
      totalApartments: newTenant.totalApartments || 300,
      occupancyRate: 90.0,
      activeResidents: Math.round((newTenant.totalApartments || 300) * 2.5),
      managerName: newTenant.managerName || user.name,
      package: newTenant.package || 'Professional',
      monthlyFee: newTenant.monthlyFee || 11000000,
      status: 'trial',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [fullTenant, ...prev]);
    setCurrentTenant(fullTenant);
    setCurrentUser(user);
    setCurrentRole(user.role);
    setActiveTab('dashboard');
  };

  const handleUpdateProfile = (updated: Partial<UserAccount>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
  };

  const handleLogout = () => {
    setShowAuthModal(true);
  };

  // Apartment Handlers
  const handleUpdateApartmentStatus = (aptId: string, newStatus: ApartmentStatus) => {
    setApartments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a))
    );
  };

  const handleAssignResident = (
    aptCode: string,
    residentName: string,
    phone: string,
    email: string
  ) => {
    setApartments((prev) =>
      prev.map((a) =>
        a.code === aptCode
          ? {
              ...a,
              status: 'occupied',
              currentResident: {
                id: `res-${Date.now()}`,
                name: residentName,
                phone,
                email,
                isOwner: false,
              },
            }
          : a
      )
    );
  };

  const handleCreateInvoiceForApt = (
    aptCode: string,
    residentName: string,
    amount: number
  ) => {
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceCode: `HD-202610-${aptCode.replace('-', '')}`,
      apartmentCode: aptCode,
      residentName,
      month: '10/2026',
      issueDate: '2026-10-01',
      dueDate: '2026-10-10',
      status: 'unpaid',
      items: [
        {
          description: 'Phí dịch vụ & vận hành theo quy chuẩn tòa nhà',
          quantity: 1,
          unit: 'tháng',
          unitPrice: amount,
          amount,
        },
      ],
      totalAmount: amount,
    };
    setInvoices((prev) => [newInv, ...prev]);
  };

  // Resident Handlers
  const handleActivateResident = (resId: string) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'active' } : r))
    );
  };

  const handleAddNewResident = (newRes: Partial<Resident>) => {
    const resident: Resident = {
      id: `res-${Date.now()}`,
      name: newRes.name || '',
      apartmentCode: newRes.apartmentCode || '',
      phone: newRes.phone || '',
      email: newRes.email || '',
      idCard: newRes.idCard || '079099887766',
      status: 'active',
      role: newRes.role || 'Khách thuê',
      moveInDate: newRes.moveInDate || new Date().toISOString().split('T')[0],
      vehicles: newRes.vehicles || [],
    };
    setResidents((prev) => [resident, ...prev]);

    setApartments((prev) =>
      prev.map((a) =>
        a.code === resident.apartmentCode
          ? {
              ...a,
              status: 'occupied',
              currentResident: {
                id: resident.id,
                name: resident.name,
                phone: resident.phone,
                email: resident.email,
                isOwner: resident.role === 'Chủ hộ',
              },
            }
          : a
      )
    );
  };

  // Billing Handlers
  const handlePayInvoice = (invId: string, method: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod: method,
              transactionId: `FT-${Date.now().toString().slice(-8)}`,
            }
          : inv
      )
    );
  };

  const handleGenerateBatchInvoices = () => {
    const newBatch = apartments.map((apt) => ({
      id: `inv-${apt.code}-${Date.now()}`,
      invoiceCode: `HD-202610-${apt.code.replace('-', '')}`,
      apartmentCode: apt.code,
      residentName: apt.currentResident?.name || 'Chủ hộ căn hộ',
      month: '10/2026',
      issueDate: '2026-10-01',
      dueDate: '2026-10-10',
      status: 'unpaid' as const,
      items: [
        {
          description: `Phí quản lý diện tích ${apt.area} m²`,
          quantity: apt.area,
          unit: 'm²',
          unitPrice: 16000,
          amount: Math.round(apt.area * 16000),
        },
      ],
      totalAmount: Math.round(apt.area * 16000),
    }));
    setInvoices((prev) => [...newBatch, ...prev]);
  };

  // Complaint Handlers
  const handleUpdateComplaintStatus = (ticketId: string, nextStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, status: nextStatus, updatedAt: 'Vừa xong' } : c))
    );
  };

  const handleAddMessage = (ticketId: string, content: string, senderRole: any) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderName:
        senderRole === 'Cư dân'
          ? currentUser.name
          : senderRole === 'Nhân viên kỹ thuật'
          ? 'KTV Trực ban'
          : 'Ban Quản trị',
      senderRole,
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === ticketId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              updatedAt: 'Vừa xong',
            }
          : c
      )
    );
  };

  const handleCreateComplaint = (newComp: Partial<Complaint>) => {
    const fullComp: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketCode: `KN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newComp.title || 'Sự cố',
      category: newComp.category || 'Kỹ thuật - Nước',
      apartmentCode: newComp.apartmentCode || 'A-1204',
      residentName: newComp.residentName || currentUser.name,
      residentPhone: newComp.residentPhone || currentUser.phone,
      priority: newComp.priority || 'high',
      status: 'new',
      createdAt: `${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      updatedAt: 'Vừa xong',
      description: newComp.description || '',
      images: newComp.images || [],
      messages: newComp.messages || [],
    };
    setComplaints((prev) => [fullComp, ...prev]);
  };

  const handleAssignStaff = (ticketId: string, staffName: string, deadline: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === ticketId
          ? { ...c, assignedTo: staffName, deadline, status: 'in_progress', updatedAt: 'Vừa xong' }
          : c
      )
    );
  };

  // Service Request & Parcel Handlers
  const handleApproveRequest = (id: string) => {
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Đã phê duyệt' } : r))
    );
  };

  const handleRejectRequest = (id: string) => {
    setServiceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Từ chối' } : r))
    );
  };

  const handleCreateRequest = (req: Partial<ServiceRequest>) => {
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      requestCode: req.requestCode || `YC-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: req.type || 'Đăng ký thang máy hàng (Chuyển đồ)',
      apartmentCode: req.apartmentCode || 'A-1204',
      residentName: req.residentName || currentUser.name,
      residentPhone: req.residentPhone || currentUser.phone,
      startDate: req.startDate || '2026-10-04 09:00',
      details: req.details || '',
      status: 'Chờ duyệt',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setServiceRequests((prev) => [newReq, ...prev]);
  };

  const handleMarkParcelReceived = (id: string) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Đã nhận',
              receivedAt: `${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
            }
          : p
      )
    );
  };

  const handleAddParcel = (par: Partial<ParcelItem>) => {
    const newPar: ParcelItem = {
      id: `par-${Date.now()}`,
      trackingCode: par.trackingCode || `VN-${Date.now().toString().slice(-6)}`,
      apartmentCode: par.apartmentCode || 'A-1204',
      recipientName: par.recipientName || 'Cư dân',
      courier: par.courier || 'Shopee Xpress',
      arrivedAt: par.arrivedAt || 'Hôm nay',
      status: 'Chờ nhận tại lễ tân',
      lockerNumber: par.lockerNumber || 'Kệ A',
    };
    setParcels((prev) => [newPar, ...prev]);
  };

  // Staff Handlers
  const handleAddStaff = (newStaff: Partial<StaffMember>) => {
    const member: StaffMember = {
      id: `st-${Date.now()}`,
      name: newStaff.name || '',
      role: newStaff.role || 'Kỹ thuật viên',
      department: newStaff.department || 'Kỹ thuật',
      phone: newStaff.phone || '',
      email: newStaff.email || '',
      status: 'active',
      completedTasks: 0,
      rating: 5.0,
    };
    setStaff((prev) => [...prev, member]);
  };

  // Booking Handlers
  const handleBookFacility = (newBk: Partial<FacilityBooking>) => {
    const bk: FacilityBooking = {
      id: `bk-${Date.now()}`,
      facilityName: newBk.facilityName || 'Khu tiệc nướng BBQ',
      apartmentCode: newBk.apartmentCode || 'A-1204',
      residentName: newBk.residentName || currentUser.name,
      bookingDate: newBk.bookingDate || '2026-10-04',
      timeSlot: newBk.timeSlot || '18:00 - 21:00',
      guestCount: newBk.guestCount || 4,
      status: 'Đã xác nhận',
    };
    setBookings((prev) => [bk, ...prev]);
  };

  // Tenant Handlers
  const handleAddTenant = (newTenant: Partial<TenantCondo>) => {
    const tenant: TenantCondo = {
      id: `tenant-${Date.now()}`,
      name: newTenant.name || '',
      code: newTenant.code || 'COND',
      address: newTenant.address || '',
      totalApartments: newTenant.totalApartments || 300,
      occupancyRate: 90.0,
      activeResidents: newTenant.activeResidents || 800,
      managerName: newTenant.managerName || 'Ban Quản trị',
      status: 'active',
      package: newTenant.package || 'Professional',
      monthlyFee: newTenant.monthlyFee || 11000000,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [...prev, tenant]);
    setCurrentTenant(tenant);
  };

  const openComplaintsCount = complaints.filter(
    (c) => c.status === 'new' || c.status === 'in_progress' || c.status === 'waiting_resident'
  ).length;
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentTenant={currentTenant}
        currentRole={currentRole}
        openComplaintsCount={openComplaintsCount}
        overdueInvoicesCount={overdueInvoicesCount}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <Topbar
          currentTenant={currentTenant}
          onSelectTenant={setCurrentTenant}
          allTenants={tenants}
          currentRole={currentRole}
          onSelectRole={handleRoleChange}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenSettingsModal={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentTenant={currentTenant}
              apartments={apartments}
              invoices={invoices}
              complaints={complaints}
              staff={staff}
              shifts={shifts}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectComplaint={() => setActiveTab('complaints')}
            />
          )}

          {activeTab === 'apartments' && (
            <ApartmentManagement
              apartments={apartments}
              residents={residents}
              onUpdateApartmentStatus={handleUpdateApartmentStatus}
              onAssignResident={handleAssignResident}
              onCreateInvoiceForApt={handleCreateInvoiceForApt}
            />
          )}

          {activeTab === 'residents' && (
            <ResidentManagement
              residents={residents}
              contracts={contracts}
              invoices={invoices}
              complaints={complaints}
              onActivateResident={handleActivateResident}
              onAddNewResident={handleAddNewResident}
            />
          )}

          {activeTab === 'billing' && (
            <BillingManagement
              invoices={invoices}
              currentRole={currentRole}
              onPayInvoice={handlePayInvoice}
              onGenerateBatchInvoices={handleGenerateBatchInvoices}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintKanban
              complaints={complaints}
              currentRole={currentRole}
              onUpdateComplaintStatus={handleUpdateComplaintStatus}
              onAddMessage={handleAddMessage}
              onCreateComplaint={handleCreateComplaint}
              onAssignStaff={handleAssignStaff}
            />
          )}

          {activeTab === 'services' && (
            <ServiceRequestsView
              currentRole={currentRole}
              requests={serviceRequests}
              parcels={parcels}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onCreateRequest={handleCreateRequest}
              onMarkParcelReceived={handleMarkParcelReceived}
              onAddParcel={handleAddParcel}
            />
          )}

          {activeTab === 'handbook' && (
            <ResidentHandbook currentTenant={currentTenant} />
          )}

          {activeTab === 'staff' && (
            <StaffManagement
              staff={staff}
              shifts={shifts}
              onAddStaff={handleAddStaff}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              currentTenant={currentTenant}
              apartments={apartments}
              invoices={invoices}
              complaints={complaints}
              staff={staff}
            />
          )}

          {activeTab === 'resident_portal' && (
            <ResidentPortal
              currentTenant={currentTenant}
              invoices={invoices}
              complaints={complaints}
              contracts={contracts}
              bookings={bookings}
              onPayInvoice={handlePayInvoice}
              onCreateComplaint={handleCreateComplaint}
              onBookFacility={handleBookFacility}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
          )}

          {activeTab === 'super_admin' && (
            <SuperAdminView
              tenants={tenants}
              onAddTenant={handleAddTenant}
            />
          )}
        </main>
      </div>

      {/* Floating 24/7 Support Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isAIChatOpen && (
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-white shadow-lg hover:bg-slate-800 active:scale-95 transition text-xs font-semibold"
          >
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <span>Hỗ trợ 24/7</span>
          </button>
        )}
      </div>

      {/* Embedded 24/7 Chat Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        currentTenant={currentTenant}
        residentApartment={currentUser.apartmentCode || 'A-1204'}
        onOpenBooking={() => {
          setActiveTab('resident_portal');
          setIsAIChatOpen(false);
        }}
        onOpenComplaint={() => {
          setActiveTab('complaints');
          setIsAIChatOpen(false);
        }}
        onOpenPayment={() => {
          setActiveTab('billing');
          setIsAIChatOpen(false);
        }}
      />

      {/* Authentication Modal (Sign in / Sign up / Forgot pass) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterTenantSuccess={handleRegisterTenantSuccess}
      />

      {/* Account Settings & Profile Modal */}
      <AccountSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
    </div>
  );
}
