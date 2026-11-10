import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  History,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  ServiceConfig,
  ServiceConfigAudit,
  ServiceStatus,
  ServiceCategory,
  UserRole,
  TenantCondo,
} from '../../types';

interface ServiceConfigViewProps {
  currentTenant: TenantCondo;
  currentRole: UserRole;
  serviceConfigs: ServiceConfig[];
  serviceAudits: ServiceConfigAudit[];
  onAddService: (newService: Omit<ServiceConfig, 'id' | 'updatedAt' | 'updatedBy'>) => void;
  onUpdateService: (
    serviceId: string,
    updatedData: Partial<ServiceConfig>,
    reason: string
  ) => void;
}

export const ServiceConfigView: React.FC<ServiceConfigViewProps> = ({
  currentTenant,
  currentRole,
  serviceConfigs,
  serviceAudits,
  onAddService,
  onUpdateService,
}) => {
  const [activeTab, setActiveTab] = useState<'current_list' | 'audit_trail'>('current_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceConfig | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCategory>('Quản lý vận hành');
  const [formDescription, setFormDescription] = useState('');
  const [formUnit, setFormUnit] = useState('m²/tháng');
  const [formUnitPrice, setFormUnitPrice] = useState<number | ''>(0);
  const [formVatRate, setFormVatRate] = useState<number>(10);
  const [formStatus, setFormStatus] = useState<ServiceStatus>('active');
  const [formEffectiveDate, setFormEffectiveDate] = useState<string>('2026-11-01');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formReason, setFormReason] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auth gate
  const isAuthorized = currentRole === 'manager' || currentRole === 'owner' || currentRole === 'superadmin';

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Truy cập bị giới hạn</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Chức năng <strong>Cấu hình dịch vụ (US15)</strong> chỉ dành cho tài khoản có vai trò <strong>Quản lý (Manager)</strong>, <strong>Chủ chung cư (Owner)</strong> hoặc <strong>Quản trị viên (Super Admin)</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormCode(`FEE-${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormCategory('Quản lý vận hành');
    setFormDescription('');
    setFormUnit('m²/tháng');
    setFormUnitPrice(0);
    setFormVatRate(10);
    setFormStatus('active');
    setFormEffectiveDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormReason('');
    setFormErrors({});
    setShowModal(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (service: ServiceConfig) => {
    setEditingService(service);
    setFormCode(service.serviceCode);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormDescription(service.description);
    setFormUnit(service.unit);
    setFormUnitPrice(service.unitPrice);
    setFormVatRate(service.vatRate);
    setFormStatus(service.status);
    setFormEffectiveDate(service.effectiveDate);
    setFormEndDate(service.endDate || '');
    setFormReason('');
    setFormErrors({});
    setShowModal(true);
  };

  // Validate form
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formCode.trim()) {
      errors.code = 'Mã dịch vụ là bắt buộc';
    }
    if (!formName.trim()) {
      errors.name = 'Tên dịch vụ là bắt buộc';
    }
    if (!formUnit.trim()) {
      errors.unit = 'Đơn vị tính là bắt buộc';
    }
    if (formUnitPrice === '' || formUnitPrice < 0) {
      errors.unitPrice = 'Mức phí phải là số không âm (≥ 0)';
    }
    if (!formEffectiveDate) {
      errors.effectiveDate = 'Ngày bắt đầu hiệu lực là bắt buộc';
    }
    if (editingService && !formReason.trim()) {
      errors.reason = 'Vui lòng nhập lý do điều chỉnh để lưu vết kiểm toán (Audit Trail)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalUnitPrice = Number(formUnitPrice);

    if (editingService) {
      onUpdateService(
        editingService.id,
        {
          serviceCode: formCode.trim().toUpperCase(),
          name: formName.trim(),
          category: formCategory,
          description: formDescription.trim(),
          unit: formUnit.trim(),
          unitPrice: finalUnitPrice,
          vatRate: formVatRate,
          status: formStatus,
          effectiveDate: formEffectiveDate,
          endDate: formEndDate ? formEndDate : undefined,
        },
        formReason.trim()
      );
    } else {
      onAddService({
        serviceCode: formCode.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        unit: formUnit.trim(),
        unitPrice: finalUnitPrice,
        vatRate: formVatRate,
        status: formStatus,
        effectiveDate: formEffectiveDate,
        endDate: formEndDate ? formEndDate : undefined,
      });
    }

    setShowModal(false);
  };

  // Filtered Services
  const filteredServices = serviceConfigs.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Đang áp dụng
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
            Tạm dừng
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            Dự thảo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Cấu hình Dịch vụ & Biểu phí (US15)
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
              <Sliders className="h-3 w-3" /> Ban Quản lý
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Khai báo danh mục dịch vụ, định mức đơn giá và thiết lập ngày hiệu lực áp dụng cho tòa nhà {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Khai báo dịch vụ mới</span>
          </button>
        </div>
      </div>

      {/* Ràng buộc điều kiện (Constraint Callout) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ràng buộc tính toàn vẹn dữ liệu kế toán
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              • <strong>Thời điểm hiệu lực:</strong> Cấu hình mức phí mới chỉ áp dụng cho các hóa đơn phát sinh kể từ &ldquo;Ngày bắt đầu hiệu lực&rdquo;.
              <br />
              • <strong>Không hồi tố:</strong> Tất cả dữ liệu hóa đơn đã phát hành trong quá khứ được giữ nguyên giá trị tại thời điểm xuất hóa đơn, hoàn toàn không bị ảnh hưởng.
              <br />
              • <strong>Lưu vết kiểm toán:</strong> Mọi thay đổi đều được ghi nhận vào nhật ký kiểm toán (Audit Trail) bao gồm người thực hiện, thời gian và lý do điều chỉnh.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Tổng dịch vụ hiện hành</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {serviceConfigs.filter((s) => s.status === 'active').length}
          </p>
          <span className="mt-1 text-[11px] text-emerald-600 font-medium">Đang áp dụng</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Dịch vụ đang dự thảo</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {serviceConfigs.filter((s) => s.status === 'draft').length}
          </p>
          <span className="mt-1 text-[11px] text-slate-500">Chuẩn bị áp dụng kỳ tới</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Nhật ký điều chỉnh</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">{serviceAudits.length}</p>
          <span className="mt-1 text-[11px] text-slate-500">Lần lưu vết kiểm toán</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Lần cập nhật gần nhất</span>
          <p className="mt-2 text-sm font-bold text-slate-900 truncate">
            {serviceAudits[0]?.changedAt || '2026-09-25'}
          </p>
          <span className="mt-1 text-[11px] text-slate-500 truncate block">
            Bởi: {serviceAudits[0]?.changedBy || 'Quản lý trưởng'}
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('current_list')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'current_list'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Danh sách dịch vụ & Biểu phí ({serviceConfigs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'audit_trail'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Lịch sử thay đổi (Audit Trail - {serviceAudits.length})</span>
        </button>
      </div>

      {/* Tab 1: Current Service Config List */}
      {activeTab === 'current_list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã, tên dịch vụ hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả phân loại</option>
                <option value="Quản lý vận hành">Quản lý vận hành</option>
                <option value="Trông giữ xe">Trông giữ xe</option>
                <option value="Điện nước tiện ích">Điện nước tiện ích</option>
                <option value="Dịch vụ cư dân">Dịch vụ cư dân</option>
                <option value="Thi công & Ký quỹ">Thi công & Ký quỹ</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang áp dụng</option>
                <option value="inactive">Tạm dừng</option>
                <option value="draft">Dự thảo</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Mã DV</th>
                    <th className="px-4 py-3">Tên dịch vụ & Mô tả</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3">Đơn vị</th>
                    <th className="px-4 py-3 text-right">Đơn giá (VND)</th>
                    <th className="px-4 py-3">VAT</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày hiệu lực</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        Không tìm thấy dịch vụ nào phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((svc) => (
                      <tr key={svc.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {svc.serviceCode}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-semibold text-slate-900">{svc.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{svc.description}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{svc.category}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{svc.unit}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {svc.unitPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-slate-500">{svc.vatRate}%</td>
                        <td className="px-4 py-3">{getStatusBadge(svc.status)}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>
                            <span className="font-medium text-slate-800">{svc.effectiveDate}</span>
                            {svc.endDate && (
                              <span className="text-[10px] text-slate-400 block">
                                đến {svc.endDate}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenEditModal(svc)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Điều chỉnh</span>
                          </button>
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

      {/* Tab 2: Audit Trail (Lịch sử thay đổi cấu hình) */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Nhật ký Kiểm toán Biểu phí (Audit Trail Log)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ghi nhận đầy đủ thông tin mỗi khi quản lý thêm mới hoặc thay đổi đơn giá, đơn vị tính, trạng thái hiệu lực.
            </p>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {serviceAudits.map((audit) => (
                <div key={audit.id} className="relative">
                  {/* Bullet */}
                  <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {audit.serviceCode}
                        </span>
                        <span className="font-bold text-slate-900">{audit.serviceName}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {audit.changedAt}
                      </span>
                    </div>

                    {/* Price change badge */}
                    {audit.oldPrice !== undefined && audit.newPrice !== undefined && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs">
                        <span className="text-slate-500 line-through">
                          {audit.oldPrice.toLocaleString('vi-VN')} đ
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {audit.newPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}

                    {/* Field changes details */}
                    {audit.fieldChanges && audit.fieldChanges.length > 0 && (
                      <div className="mt-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Các trường cập nhật:</span>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                          {audit.fieldChanges.map((fc, idx) => (
                            <li key={idx}>
                              <strong>{fc.fieldLabel}:</strong> &ldquo;{fc.oldValue}&rdquo; → &ldquo;{fc.newValue}&rdquo;
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reason */}
                    <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-900">Lý do điều chỉnh:</span>{' '}
                      <span className="italic">{audit.reason}</span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      Người thực hiện: <strong>{audit.changedBy}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingService ? 'Điều chỉnh cấu hình dịch vụ' : 'Khai báo dịch vụ & biểu phí mới'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingService
                    ? `Cập nhật biểu phí mã ${editingService.serviceCode}`
                    : 'Thiết lập danh mục dịch vụ mới cho toàn tòa nhà'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Service Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="VD: FEE-PARK-CAR"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.code && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{formErrors.code}</span>
                  )}
                </div>

                {/* Service Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Phí quản lý vận hành tòa nhà"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.name && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{formErrors.name}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân loại dịch vụ
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Quản lý vận hành">Quản lý vận hành</option>
                    <option value="Trông giữ xe">Trông giữ xe</option>
                    <option value="Điện nước tiện ích">Điện nước tiện ích</option>
                    <option value="Dịch vụ cư dân">Dịch vụ cư dân</option>
                    <option value="Thi công & Ký quỹ">Thi công & Ký quỹ</option>
                  </select>
                </div>

                {/* Unit of measure */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn vị tính <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="VD: m²/tháng, xe/tháng, m³"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.unit && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{formErrors.unit}</span>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức phí (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formUnitPrice}
                    onChange={(e) =>
                      setFormUnitPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.unitPrice && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {formErrors.unitPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* VAT Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thuế suất VAT (%)
                  </label>
                  <select
                    value={formVatRate}
                    onChange={(e) => setFormVatRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={0}>0% (Không chịu thuế / Ký quỹ)</option>
                    <option value={5}>5% (Nước sinh hoạt)</option>
                    <option value={8}>8% (Ưu đãi)</option>
                    <option value={10}>10% (Dịch vụ tiêu chuẩn)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái áp dụng
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="active">Đang áp dụng</option>
                    <option value="inactive">Tạm dừng áp dụng</option>
                    <option value="draft">Dự thảo (Chưa hiệu lực)</option>
                  </select>
                </div>

                {/* Effective Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày bắt đầu hiệu lực <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.effectiveDate && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {formErrors.effectiveDate}
                    </span>
                  )}
                </div>
              </div>

              {/* End date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày kết thúc hiệu lực (tùy chọn)
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả chi tiết phạm vi dịch vụ
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ghi rõ phạm vi áp dụng, tiêu chuẩn kỹ thuật hoặc ghi chú cho cư dân..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Reason for adjustment (Mandatory when editing) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do điều chỉnh (Audit Trail Log){' '}
                  {editingService && <span className="text-rose-500">* Bắt buộc khi cập nhật</span>}
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="VD: Cập nhật đơn giá nước sạch theo quyết định UBND, nâng cấp tiêu chuẩn vệ sinh..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {formErrors.reason && (
                  <span className="text-[11px] text-rose-500 mt-0.5 block">
                    {formErrors.reason}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
                >
                  {editingService ? 'Lưu thay đổi & Cập nhật kiểm toán' : 'Lưu dịch vụ mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
