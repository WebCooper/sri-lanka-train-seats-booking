import React, { useState, useEffect } from 'react';
import { X, Loader2, Shield, User, Mail, Lock, Phone, IdCard, Briefcase } from 'lucide-react';
import type { AdminUser, CreateAdminPayload, UpdateAdminPayload } from '../api/adminManagementApi';
import { getApiErrorMessage } from '../api/axiosInstance';
import toast from 'react-hot-toast';

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreateAdminPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateAdminPayload) => Promise<void>;
  initialData?: AdminUser | null;
}

export const AdminFormModal: React.FC<AdminFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTitle(initialData.title || '');
      setFirstName(initialData.first_name || '');
      setLastName(initialData.last_name || '');
      setEmail(initialData.email || '');
      setNicNumber(initialData.nic_number || '');
      setMobileNumber(initialData.mobile_number || '');
      setPosition(initialData.position || '');
      setPassword('');
      setIsActive(initialData.is_active ?? true);
    } else {
      setName('');
      setTitle('Mr');
      setFirstName('');
      setLastName('');
      setEmail('');
      setNicNumber('');
      setMobileNumber('');
      setPosition('');
      setPassword('');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    if (!isEditMode && !password.trim()) {
      toast.error('Password is required when creating an administrator.');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        const updatePayload: UpdateAdminPayload = {
          name: name.trim(),
          title: title.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          email: email.trim(),
          nicNumber: nicNumber.trim() || undefined,
          mobileNumber: mobileNumber.trim() || undefined,
          position: position.trim() || undefined,
          is_active: isActive,
        };
        if (password.trim()) {
          updatePayload.password = password.trim();
        }
        await onSubmitUpdate(initialData.id, updatePayload);
        toast.success('Admin user updated successfully.');
      } else {
        const createPayload: CreateAdminPayload = {
          name: name.trim(),
          title: title.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          email: email.trim(),
          nicNumber: nicNumber.trim() || undefined,
          mobileNumber: mobileNumber.trim() || undefined,
          position: position.trim() || undefined,
          password: password.trim(),
        };
        await onSubmitCreate(createPayload);
        toast.success('New administrator created successfully.');
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to save administrator details.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Administrator Details' : 'Create System Administrator'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? 'Update administrator credentials, role info, or active status.'
                  : 'Register a new administrator with admin access permissions.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Full Display Name *</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. Jane Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. jane.admin@railway.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Title</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
                <option value="Hon">Hon</option>
              </select>
            </div>

            {/* Position */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Position / Role Title</label>
              <div className="relative flex items-center">
                <Briefcase className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. Station Controller"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
            </div>

            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* NIC Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">NIC Number</label>
              <div className="relative flex items-center">
                <IdCard className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="199012345678"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="+94771234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                {isEditMode ? 'New Password (Leave blank to keep unchanged)' : 'Password *'}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder={isEditMode ? '••••••••••••' : 'Min 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditMode}
                />
              </div>
            </div>

            {/* Active Status Toggle (Edit mode) */}
            {isEditMode && (
              <div className="md:col-span-2 mt-1">
                <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Account Active (Uncheck to ban/deactivate admin)</span>
                </label>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-65"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Save Changes' : 'Create Administrator'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
