import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { 
  ChevronRight, 
  Shield, 
  UserPlus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronLeft 
} from 'lucide-react';
import { 
  fetchAdmins, 
  createAdminApi, 
  updateAdminApi, 
  deleteAdminApi 
} from '../api/adminManagementApi';
import type { 
  AdminUser, 
  CreateAdminPayload, 
  UpdateAdminPayload 
} from '../api/adminManagementApi';
import { AdminFormModal } from '../components/AdminFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const AdminManagement: React.FC = () => {
  const { user: currentLoggedAdmin } = useAuth();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  // Delete Confirmation Modal State
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load admins from NestJS Backend API (GET /api/v1/admin/admins)
  const loadAdmins = useCallback(async (currentPage = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      const res = await fetchAdmins({
        page: currentPage,
        limit: 10,
        search: searchQuery.trim() || undefined,
      });
      setAdmins(res.data);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch administrator accounts.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins(page, search);
  }, [loadAdmins, page]);

  // Handle Search Input Change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAdmins(1, search);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  // Handle Create Admin Submission (POST /api/v1/admin/admins)
  const handleCreateAdmin = async (payload: CreateAdminPayload) => {
    await createAdminApi(payload);
    loadAdmins(page, search);
  };

  // Handle Update Admin Submission (PUT /api/v1/admin/admins/:id)
  const handleUpdateAdmin = async (id: string, payload: UpdateAdminPayload) => {
    await updateAdminApi(id, payload);
    loadAdmins(page, search);
  };

  // Handle Active Status Toggle
  const handleToggleActive = async (admin: AdminUser) => {
    const newStatus = !admin.is_active;
    try {
      await updateAdminApi(admin.id, { is_active: newStatus });
      toast.success(
        `Admin "${admin.name}" ${newStatus ? 'activated' : 'deactivated'} successfully.`
      );
      loadAdmins(page, search);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update administrator status.'));
    }
  };

  // Request Delete Admin (Opens ConfirmModal)
  const handleRequestDeleteAdmin = (admin: AdminUser) => {
    if (admin.id === currentLoggedAdmin?.id) {
      toast.error('You cannot delete your own logged-in admin account.');
      return;
    }
    setDeletingAdmin(admin);
  };

  // Confirm Delete Admin (Executes DELETE /api/v1/admin/admins/:id)
  const handleConfirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setIsDeleting(true);
    try {
      await deleteAdminApi(deletingAdmin.id);
      toast.success(`Administrator "${deletingAdmin.name}" deleted successfully.`);
      setDeletingAdmin(null);
      loadAdmins(page, search);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to delete administrator account.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link to="/dashboard" className="text-indigo-600 hover:underline font-medium">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">Admin Management</span>
      </nav>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Admin Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage authorized system administrators, assign roles, and audit access credentials.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Table Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3"
        >
          <div className="relative flex items-center max-w-md w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              placeholder="Search by name, email, NIC or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
                loadAdmins(1, '');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Clear
            </button>
          )}
        </form>

        {/* Table Content / Loading State */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-medium">Loading system administrators...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No Administrators Found
            </h3>
            <p className="text-xs">
              {search ? `No admin accounts matched "${search}".` : 'No administrators registered in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">Position / NIC</th>
                  <th className="py-3.5 px-5">Role</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Joined Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {admin.title ? `${admin.title} ` : ''}
                            {admin.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ID: {admin.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{admin.email}</span>
                      </div>
                    </td>

                    {/* Position & NIC */}
                    <td className="py-4 px-5">
                      <div className="text-xs font-semibold text-slate-900">
                        {admin.position || 'System Administrator'}
                      </div>
                      {admin.nic_number && (
                        <div className="text-[11px] text-slate-400">
                          NIC: {admin.nic_number}
                        </div>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700">
                        <Shield className="w-3 h-3 text-indigo-600" />
                        <span className="text-[11px] font-semibold">{admin.role?.toUpperCase() || 'ADMIN'}</span>
                      </span>
                    </td>

                    {/* Status Badge Toggle */}
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(admin)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          admin.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle admin active status"
                      >
                        {admin.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Banned</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Administrator"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRequestDeleteAdmin(admin)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete Administrator"
                          disabled={admin.id === currentLoggedAdmin?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 bg-white border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing Page {page} of {totalPages} ({total} total administrators)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Admin Modal */}
      <AdminFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitCreate={handleCreateAdmin}
        onSubmitUpdate={handleUpdateAdmin}
        initialData={editingAdmin}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAdmin)}
        onClose={() => setDeletingAdmin(null)}
        onConfirm={handleConfirmDeleteAdmin}
        title="Delete Administrator Account"
        message={
          deletingAdmin
            ? `Are you sure you want to delete administrator "${deletingAdmin.name}" (${deletingAdmin.email})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Administrator"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
