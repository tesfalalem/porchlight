import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchAdminProfile, updateAdminProfile, updateAdminPassword } from '../../services/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email address is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  useDocumentTitle('Settings');
  const queryClient = useQueryClient();
  const { updateAdmin } = useAuth();

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Fetch admin profile details
  const profileQuery = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: fetchAdminProfile,
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Populate form with fetched data
  useEffect(() => {
    if (profileQuery.data) {
      resetProfile({
        name: profileQuery.data.name,
        email: profileQuery.data.email,
      });
    }
  }, [profileQuery.data, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordValue = watchPassword('newPassword') || '';

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-sky-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPasswordValue);

  // Profile Mutation
  const profileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (data) => {
      setProfileErrorMsg(null);
      setProfileSuccessMsg('Profile information updated successfully.');
      updateAdmin(data.admin, data.token);
      queryClient.setQueryData(['admin', 'profile'], (old: any) => ({
        ...old,
        name: data.admin.name,
        email: data.admin.email,
        updatedAt: new Date().toISOString(),
      }));
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    },
    onError: (err) => {
      setProfileSuccessMsg(null);
      setProfileErrorMsg(getApiErrorMessage(err));
    },
  });

  // Password Mutation
  const passwordMutation = useMutation({
    mutationFn: updateAdminPassword,
    onSuccess: () => {
      setPasswordErrorMsg(null);
      setPasswordSuccessMsg('Password updated successfully. Your account is secured.');
      resetPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    },
    onError: (err) => {
      setPasswordSuccessMsg(null);
      setPasswordErrorMsg(getApiErrorMessage(err));
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    profileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);
    passwordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading account settings…" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorState onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ── Page Header ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Account & Security</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Admin Settings
        </h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
        <p className="mt-2.5 text-sm text-slate-500">
          Manage your administrative profile, username, email address, and authentication security.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Card 1: Admin Profile & Credentials ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition hover:border-slate-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-navy-950">Profile Information</h2>
                <p className="text-xs text-slate-500">Update your account name and administrative email.</p>
              </div>
            </div>

            {/* Quick account details badge */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Role: Primary Administrator
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Updated {new Date(profile.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {profileSuccessMsg && (
              <div
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form id="profile-form" onSubmit={handleSubmitProfile(onProfileSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Display Name / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    {...registerProfile('name')}
                    placeholder="Administrator Name"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
                {profileErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{profileErrors.name.message}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  This identifier represents your account across the administrative portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    {...registerProfile('email')}
                    placeholder="admin@porchlight.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{profileErrors.email.message}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Used to sign in to the admin dashboard. Changing this will immediately update your login credentials.
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isProfileDirty ? 'You have unsaved changes' : 'All changes saved'}
            </span>
            <button
              type="submit"
              form="profile-form"
              disabled={profileMutation.isPending || !isProfileDirty}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Card 2: Security & Change Password ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition hover:border-slate-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-navy-950">Change Password</h2>
                <p className="text-xs text-slate-500">Ensure your administrative account uses a strong password.</p>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form id="password-form" onSubmit={handleSubmitPassword(onPasswordSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    {...registerPassword('currentPassword')}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    {...registerPassword('newPassword')}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showNewPass ? 'Hide password' : 'Show password'}
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-rose-600">{passwordErrors.newPassword.message}</p>
                )}

                {/* Password Strength Meter */}
                {newPasswordValue.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password strength:</span>
                      <span className="font-semibold text-slate-600">{strength.text}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    {...registerPassword('confirmPassword')}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Minimum 8 characters</span>
            <button
              type="submit"
              form="password-form"
              disabled={passwordMutation.isPending}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover disabled:opacity-50"
            >
              {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3: Security & Session Protocol Info ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-navy-950">Security Infrastructure</h2>
            <p className="text-xs text-slate-500">Security protocols protecting your administrative operations.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-navy-900">Encrypted Passwords</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Passwords are salted and cryptographically hashed with bcrypt before storing in PostgreSQL.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-navy-900">JWT Token Auth</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Authentication tokens expire automatically every 8 hours to prevent unauthorized access.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-navy-900">Direct Prisma Connection</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              All credentials and audit timestamps are managed directly via Prisma ORM on Neon PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
