import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  RefreshCw,
  Edit3,
  XCircle,
  HelpCircle,
  FileText,
  ShieldAlert,
  ChevronDown,
  Building,
  Info,
} from 'lucide-react';
import {
  AIWorkTaskSuggestion,
  ComplaintPriority,
  StaffMember,
  Complaint,
  TenantCondo,
  UserRole,
} from '../../types';

interface AIWorkAssistantProps {
  currentTenant: TenantCondo;
  currentRole: UserRole;
  suggestions: AIWorkTaskSuggestion[];
  staffList: StaffMember[];
  openComplaints: Complaint[];
  overdueInvoicesCount: number;
  onApplySuggestion: (suggestionId: string) => void;
  onEditAndApplySuggestion: (
    suggestionId: string,
    updatedData: {
      suggestedPriority: ComplaintPriority;
      suggestedAssignee: {
        staffId: string;
        staffName: string;
        role: string;
        department: string;
      };
      suggestedDeadline: string;
      actionSteps: string[];
      userDecisionNotes?: string;
    }
  ) => void;
  onDismissSuggestion: (suggestionId: string, reason?: string) => void;
  onRefreshFromAI: () => Promise<void>;
  isLoadingAI: boolean;
}

export const AIWorkAssistant: React.FC<AIWorkAssistantProps> = ({
  currentTenant,
  currentRole,
  suggestions,
  staffList,
  openComplaints,
  overdueInvoicesCount,
  onApplySuggestion,
  onEditAndApplySuggestion,
  onDismissSuggestion,
  onRefreshFromAI,
  isLoadingAI,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'dismissed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedSuggestionForEdit, setSelectedSuggestionForEdit] = useState<AIWorkTaskSuggestion | null>(null);

  // Edit modal states
  const [editPriority, setEditPriority] = useState<ComplaintPriority>('high');
  const [editStaffId, setEditStaffId] = useState<string>('');
  const [editDeadline, setEditDeadline] = useState<string>('');
  const [editActionStepsText, setEditActionStepsText] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Dismiss modal state
  const [dismissingSuggestion, setDismissingSuggestion] = useState<AIWorkTaskSuggestion | null>(null);
  const [dismissReason, setDismissReason] = useState<string>('');

  // Check role authorization
  const isAuthorized = currentRole === 'manager' || currentRole === 'owner' || currentRole === 'superadmin';

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Truy cập bị giới hạn</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Chức năng <strong>AI Hỗ trợ công việc</strong> chỉ dành riêng cho tài khoản có vai trò <strong>Quản lý (Manager)</strong>, <strong>Chủ chung cư (Owner)</strong> hoặc <strong>Quản trị viên (Super Admin)</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Counters
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const acceptedCount = suggestions.filter((s) => s.status === 'accepted' || s.status === 'edited').length;
  const dismissedCount = suggestions.filter((s) => s.status === 'dismissed').length;

  const filteredSuggestions = suggestions.filter((item) => {
    if (filterStatus === 'pending' && item.status !== 'pending') return false;
    if (filterStatus === 'accepted' && !(item.status === 'accepted' || item.status === 'edited')) return false;
    if (filterStatus === 'dismissed' && item.status !== 'dismissed') return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const handleOpenEditModal = (item: AIWorkTaskSuggestion) => {
    setSelectedSuggestionForEdit(item);
    setEditPriority(item.suggestedPriority);
    setEditStaffId(item.suggestedAssignee.staffId || staffList[0]?.id || '');
    setEditDeadline(item.suggestedDeadline);
    setEditActionStepsText(item.actionSteps.join('\n'));
    setEditNotes(item.userDecisionNotes || '');
  };

  const handleSaveEditAndApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestionForEdit) return;

    const matchedStaff = staffList.find((s) => s.id === editStaffId) || {
      id: editStaffId,
      name: 'Nhân viên kỹ thuật',
      role: 'Kỹ thuật viên',
      department: 'Kỹ thuật',
    };

    const steps = editActionStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onEditAndApplySuggestion(selectedSuggestionForEdit.id, {
      suggestedPriority: editPriority,
      suggestedAssignee: {
        staffId: matchedStaff.id,
        staffName: matchedStaff.name,
        role: matchedStaff.role,
        department: matchedStaff.department,
      },
      suggestedDeadline: editDeadline,
      actionSteps: steps.length > 0 ? steps : selectedSuggestionForEdit.actionSteps,
      userDecisionNotes: editNotes,
    });

    setSelectedSuggestionForEdit(null);
  };

  const handleConfirmDismiss = () => {
    if (!dismissingSuggestion) return;
    onDismissSuggestion(dismissingSuggestion.id, dismissReason);
    setDismissingSuggestion(null);
    setDismissReason('');
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
            Khẩn cấp (SLA &lt; 90p)
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Cao (Trong ngày)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Trung bình (24 - 48h)
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Thấp (Theo kế hoạch)
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
              AI Hỗ Trợ Công Việc
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
              <Sparkles className="h-3 w-3" /> Trợ lý Quản lý
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Phân tích tự động khối lượng vận hành, đề xuất phân công nhân sự và các bước xử lý kèm căn cứ SLA tòa nhà {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefreshFromAI()}
            disabled={isLoadingAI}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'Đang phân tích...' : 'Yêu cầu AI phân tích dữ liệu mới'}</span>
          </button>
        </div>
      </div>

      {/* Ràng buộc quan trọng (Acceptance Criteria & Constraint Banner) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Nguyên tắc hoạt động & Ràng buộc phê duyệt
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              • AI chỉ tổng hợp dữ liệu trong phạm vi quyền hạn của Quản lý ({openComplaints.length} khiếu nại mở, {overdueInvoicesCount} hóa đơn quá hạn, lịch trực nhân sự).
              <br />
              • <strong>Không tự động thay đổi:</strong> Mọi đề xuất chỉ có hiệu lực khi bạn bấm <strong>&ldquo;Chấp nhận áp dụng&rdquo;</strong> hoặc <strong>&ldquo;Chỉnh sửa trước khi duyệt&rdquo;</strong>. Quyết định cuối cùng hoàn toàn thuộc về bạn.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đang chờ duyệt</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Cần bạn xem xét & phê duyệt</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đã chấp thuận / chỉnh sửa</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{acceptedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Đã cập nhật vào tiến độ công việc</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đã bỏ qua</span>
            <XCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-700">{dismissedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Không áp dụng vào hệ thống</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Đội ngũ nhân sự trực</span>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{staffList.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Sẵn sàng nhận phân công</p>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({suggestions.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chờ Quản lý duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === 'accepted'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã áp dụng ({acceptedCount})
          </button>
          <button
            onClick={() => setFilterStatus('dismissed')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === 'dismissed'
                ? 'bg-slate-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã bỏ qua ({dismissedCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Kỹ thuật - Sự cố">Kỹ thuật - Sự cố</option>
            <option value="Vận hành - Dịch vụ">Vận hành - Dịch vụ</option>
            <option value="Tài chính - Công nợ">Tài chính - Công nợ</option>
            <option value="PCCC & An toàn">PCCC & An toàn</option>
          </select>
        </div>
      </div>

      {/* Suggestion Cards List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white">
            <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không có đề xuất nào trong bộ lọc này</p>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có thể nhấn &ldquo;Yêu cầu AI phân tích dữ liệu mới&rdquo; để quét lại toàn bộ dữ liệu sự cố và công việc tòa nhà.
            </p>
          </div>
        ) : (
          filteredSuggestions.map((item) => {
            const isPending = item.status === 'pending';
            const isAccepted = item.status === 'accepted';
            const isEdited = item.status === 'edited';
            const isDismissed = item.status === 'dismissed';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-5 transition shadow-xs ${
                  isPending
                    ? 'border-blue-200/80 hover:border-blue-300'
                    : isDismissed
                    ? 'border-slate-200 bg-slate-50/50 opacity-75'
                    : 'border-emerald-200/90 bg-emerald-50/20'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {item.ticketId || item.id}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {item.category}
                      </span>
                      {item.targetApartment && (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.targetApartment}
                        </span>
                      )}
                      {getPriorityBadge(item.suggestedPriority)}

                      {/* Status indicator badge */}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Đã chấp nhận
                        </span>
                      )}
                      {isEdited && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <Edit3 className="h-3 w-3" /> Đã điều chỉnh & áp dụng
                        </span>
                      )}
                      {isDismissed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <XCircle className="h-3 w-3" /> Đã bỏ qua
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {item.taskTitle}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block">Thời hạn đề xuất:</span>
                    <span className="text-xs font-semibold text-slate-800 flex items-center sm:justify-end gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {item.suggestedDeadline}
                    </span>
                  </div>
                </div>

                {/* Body Content: Reasoning & Basis */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Phân tích & Tác động vận hành:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {item.reasoning}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                    <span className="font-semibold text-blue-900 block mb-1">
                      Căn cứ phân công & Quy định (Basis Info):
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.basisInfo}
                    </p>
                  </div>
                </div>

                {/* Assignee & Action Steps */}
                <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      {item.suggestedAssignee.staffName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {item.suggestedAssignee.staffName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({item.suggestedAssignee.role})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Bộ phận: {item.suggestedAssignee.department}
                      </span>
                    </div>
                  </div>

                  {/* Steps preview */}
                  <div className="flex-1 lg:max-w-md">
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Quy trình xử lý đề xuất ({item.actionSteps.length} bước):
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {item.actionSteps.map((step, idx) => (
                        <li key={idx} className="truncate">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Audit trail when accepted or dismissed */}
                {!isPending && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                    <div>
                      <span>Xử lý bởi: <strong>{item.decidedBy || 'Quản lý vận hành'}</strong></span>
                      {item.decidedAt && <span> • Lúc: {item.decidedAt}</span>}
                      {item.userDecisionNotes && (
                        <p className="mt-0.5 text-slate-700 italic">
                          Ghi chú: &ldquo;{item.userDecisionNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons (Only for pending) */}
                {isPending && (
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setDismissingSuggestion(item)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition"
                    >
                      Bỏ qua
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Chỉnh sửa trước khi duyệt</span>
                    </button>

                    <button
                      onClick={() => onApplySuggestion(item.id)}
                      className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Chấp nhận áp dụng ngay</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Suggestion Modal */}
      {selectedSuggestionForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chỉnh sửa đề xuất công việc
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSuggestionForEdit.ticketId} - {selectedSuggestionForEdit.taskTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuggestionForEdit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAndApply} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as ComplaintPriority)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="urgent">Khẩn cấp (SLA &lt; 90 phút)</option>
                    <option value="high">Cao (Trong ngày làm việc)</option>
                    <option value="medium">Trung bình (24 - 48 giờ)</option>
                    <option value="low">Thấp (Theo kế hoạch định kỳ)</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhân viên được phân công
                  </label>
                  <select
                    value={editStaffId}
                    onChange={(e) => setEditStaffId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} - {st.role} ({st.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời hạn hoàn thành đề xuất
                </label>
                <input
                  type="text"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  placeholder="Ví dụ: Hôm nay trước 15:00"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Action steps */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Các bước xử lý (mỗi dòng một bước)
                </label>
                <textarea
                  rows={4}
                  value={editActionStepsText}
                  onChange={(e) => setEditActionStepsText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Bước 1...&#10;Bước 2...&#10;Bước 3..."
                />
              </div>

              {/* Manager notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú điều chỉnh của Quản lý
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ví dụ: Đã trao đổi với Kỹ sư Hùng, đổi sang Trọng vì có ca trực sáng"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSuggestionForEdit(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  Xác nhận & Áp dụng thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      {dismissingSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Bỏ qua đề xuất công việc?
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Đề xuất &ldquo;{dismissingSuggestion.taskTitle}&rdquo; sẽ được đánh dấu là bỏ qua và <strong>không tự động áp dụng</strong> bất kỳ thay đổi nào vào hệ thống.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do bỏ qua (tùy chọn)
              </label>
              <input
                type="text"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="Ví dụ: Đã có tổ thầu ngoài xử lý riêng..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDismissingSuggestion(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDismiss}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-900"
              >
                Xác nhận bỏ qua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
