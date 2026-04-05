import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  adminApi,
  AdminDashboardStats,
  AdminUser,
  AdminAgency,
  AdminUserDetail,
  AdminJobRow,
  AdminPaymentRow,
  AdminPaymentsSummary,
  UserWithoutRole,
  AdminNotification,
} from '@/lib/api';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { useAuth } from '@/hooks/useAuthEnhanced';
import {
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EXPERIENCE_OPTIONS = [
  { value: 'no_experience', label: 'No experience' },
  { value: '1_year', label: '1 year' },
  { value: '2_years', label: '2 years' },
  { value: '3_years', label: '3 years' },
  { value: '4_years', label: '4 years' },
  { value: '5_plus_years', label: '5+ years' },
];

const ACCOMMODATION_OPTIONS = [
  { value: 'live_in', label: 'Live in' },
  { value: 'live_out', label: 'Live out' },
  { value: 'both', label: 'Both' },
];

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!user.is_admin) {
        toast({
          title: 'Access Denied',
          description: 'This dashboard is only accessible to administrators.',
          variant: 'destructive',
        });
        if (user.user_type === 'employer') navigate('/employer-dashboard');
        else if (user.user_type === 'housegirl') navigate('/housegirl-dashboard');
        else if (user.user_type === 'agency') navigate('/agency-dashboard');
        else navigate('/');
      }
    }
  }, [user, navigate]);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [usersPageLoading, setUsersPageLoading] = useState(false);
  const agencyUsers = useMemo(() => users.filter((u) => u.user_type === 'agency'), [users]);
  const [syncing, setSyncing] = useState(false);
  const [mainTab, setMainTab] = useState('users');
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const pendingAgencySignupAlerts = useMemo(
    () => adminNotifications.filter((n) => !n.read && n.type === 'agency_signup_pending'),
    [adminNotifications],
  );

  const [userSearchInput, setUserSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [usersPage, setUsersPage] = useState(1);

  const [agencySearch, setAgencySearch] = useState('');
  const [agencyStatusFilter, setAgencyStatusFilter] = useState('all');
  const [verifyAgencyTarget, setVerifyAgencyTarget] = useState<AdminAgency | null>(null);
  const [verifyOperatorId, setVerifyOperatorId] = useState('');

  const [usersWithoutRoles, setUsersWithoutRoles] = useState<UserWithoutRole[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleSelections, setRoleSelections] = useState<Record<string, 'employer' | 'housegirl' | 'agency'>>({});
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirst, setNewUserFirst] = useState('');
  const [newUserLast, setNewUserLast] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserType, setNewUserType] = useState<'employer' | 'housegirl' | 'agency'>('employer');
  const [creatingUser, setCreatingUser] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExperience, setEditExperience] = useState('no_experience');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editAccommodation, setEditAccommodation] = useState('live_in');
  const [editSkills, setEditSkills] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editProfileComplete, setEditProfileComplete] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [jobs, setJobs] = useState<AdminJobRow[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [debouncedJobSearch, setDebouncedJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [paymentsSummary, setPaymentsSummary] = useState<AdminPaymentsSummary | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(userSearchInput), 400);
    return () => clearTimeout(t);
  }, [userSearchInput]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedJobSearch(jobSearch), 400);
    return () => clearTimeout(t);
  }, [jobSearch]);

  useEffect(() => {
    setUsersPage(1);
  }, [debouncedSearch, userTypeFilter]);

  useEffect(() => {
    const getToken = async () => {
      const t = await FirebaseAuthService.getIdToken();
      setToken(t);
    };
    getToken();
  }, []);

  const refreshOverview = useCallback(async () => {
    if (!token) return;
    const [statsData, agenciesData, noRolesData] = await Promise.all([
      adminApi.getDashboardStats(token),
      adminApi.getAgencies(token),
      adminApi.getUsersWithoutRoles(token),
    ]);
    setStats(statsData);
    setAgencies(agenciesData.agencies);
    setUsersWithoutRoles(noRolesData.users);
  }, [token]);

  const loadAdminNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminApi.getNotifications(token, { limit: 40 });
      setAdminNotifications(res.notifications);
      setNotifUnreadCount(res.unread_count);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setUsersPageLoading(true);
    try {
      const res = await adminApi.getUsers(token, {
        page: usersPage,
        per_page: 20,
        user_type: userTypeFilter === 'all' ? undefined : userTypeFilter,
        search: debouncedSearch.trim() || undefined,
      });
      setUsers(res.users);
      setUsersPagination({
        page: res.pagination.page,
        per_page: res.pagination.per_page,
        total: res.pagination.total,
        pages: res.pagination.pages,
        has_next: res.pagination.has_next ?? false,
        has_prev: res.pagination.has_prev ?? false,
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setUsersPageLoading(false);
    }
  }, [token, usersPage, userTypeFilter, debouncedSearch]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      try {
        await refreshOverview();
        await loadAdminNotifications();
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refreshOverview, loadAdminNotifications]);

  useEffect(() => {
    if (!token || bootstrapping) return;
    loadUsers();
  }, [token, usersPage, userTypeFilter, debouncedSearch, bootstrapping, loadUsers]);

  const loadJobs = useCallback(async () => {
    if (!token) return;
    setJobsLoading(true);
    try {
      const res = await adminApi.getJobs(token, {
        status: jobStatusFilter === 'all' ? undefined : jobStatusFilter,
        search: debouncedJobSearch.trim() || undefined,
      });
      setJobs(res.jobs);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    } finally {
      setJobsLoading(false);
    }
  }, [token, jobStatusFilter, debouncedJobSearch]);

  useEffect(() => {
    if (mainTab !== 'jobs' || !token) return;
    loadJobs();
  }, [mainTab, token, jobStatusFilter, debouncedJobSearch, loadJobs]);

  const loadPayments = useCallback(async () => {
    if (!token) return;
    setPaymentsLoading(true);
    try {
      const res = await adminApi.getPayments(token, {
        status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
      });
      setPayments(res.purchases);
      setPaymentsSummary(res.summary);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load payments', variant: 'destructive' });
    } finally {
      setPaymentsLoading(false);
    }
  }, [token, paymentStatusFilter]);

  useEffect(() => {
    if (mainTab !== 'payments' || !token) return;
    loadPayments();
  }, [mainTab, token, paymentStatusFilter, loadPayments]);

  const fetchUserDetail = useCallback(
    async (uid: string) => {
      if (!token) return;
      setDetailLoading(true);
      try {
        const d = await adminApi.getUserDetails(token, uid);
        setUserDetail(d);
        const hg = d.profile?.housegirl;
        if (hg) {
          setEditBio(hg.bio || '');
          setEditLocation(hg.location || hg.current_location || '');
          setEditExperience(hg.experience || 'no_experience');
          setEditSalary(Number(hg.expected_salary) || 0);
          setEditAccommodation(hg.accommodation_type || 'live_in');
          setEditSkills((hg.skills || []).join(', '));
          setEditAvailable(hg.is_available !== false);
          setEditProfileComplete(!!hg.profile_complete);
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Error', description: 'Failed to load user details', variant: 'destructive' });
      } finally {
        setDetailLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (sheetOpen && detailUserId && token) {
      fetchUserDetail(detailUserId);
    }
    if (!sheetOpen) {
      setUserDetail(null);
    }
  }, [sheetOpen, detailUserId, token, fetchUserDetail]);

  const dismissAdminNotification = async (id: string) => {
    if (!token) return;
    try {
      await adminApi.markNotificationRead(token, id);
      await loadAdminNotifications();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not dismiss alert', variant: 'destructive' });
    }
  };

  const reviewAgencySignupNotification = async (id: string) => {
    if (!token) return;
    try {
      await adminApi.markNotificationRead(token, id);
      setUserTypeFilter('agency');
      setMainTab('users');
      setUsersPage(1);
      await loadAdminNotifications();
      await loadUsers();
      toast({
        title: 'Review agency signup',
        description: 'Users is filtered to agency accounts. Use the Agencies tab to verify marketplace listings.',
      });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleSync = async (syncType: string = 'all') => {
    if (!token) return;
    try {
      setSyncing(true);
      await adminApi.syncData(token, syncType);
      toast({ title: 'Success', description: 'Sync completed' });
      await refreshOverview();
      await loadUsers();
      await loadAdminNotifications();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to sync', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (!token) return;
    try {
      await adminApi.toggleUserStatus(token, userId);
      toast({ title: 'Success', description: 'User status updated' });
      await refreshOverview();
      await loadUsers();
      if (detailUserId === userId) await fetchUserDetail(userId);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
  };

  const handlePromoteUser = async (userId: string, makeAdmin: boolean) => {
    if (!token) return;
    try {
      await adminApi.promoteUser(token, userId, makeAdmin);
      toast({
        title: makeAdmin ? 'Admin granted' : 'Admin revoked',
        description: makeAdmin ? 'User is now an admin.' : 'Admin access removed.',
      });
      await refreshOverview();
      await loadUsers();
      if (detailUserId === userId) await fetchUserDetail(userId);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update admin status', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !detailUserId) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(token, detailUserId);
      toast({ title: 'User deleted', description: 'The user has been removed.' });
      setDeleteConfirmOpen(false);
      setSheetOpen(false);
      setDetailUserId(null);
      await refreshOverview();
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveHousegirlProfile = async () => {
    if (!token || !detailUserId) return;
    const skills = editSkills
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setSavingProfile(true);
    try {
      await adminApi.patchHousegirlProfile(token, detailUserId, {
        bio: editBio,
        location: editLocation,
        experience: editExperience,
        expected_salary: editSalary,
        accommodation_type: editAccommodation,
        skills,
        is_available: editAvailable,
        profile_complete: editProfileComplete,
      });
      toast({ title: 'Saved', description: 'Housegirl profile updated.' });
      await fetchUserDetail(detailUserId);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerifyAgency = async (agencyId: string, status: string, dashboardUserId?: string) => {
    if (!token) return false;
    try {
      await adminApi.verifyAgency(token, agencyId, status, dashboardUserId);
      toast({ title: 'Success', description: `Agency ${status}` });
      await refreshOverview();
      await loadUsers();
      await loadAdminNotifications();
      return true;
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to verify agency', variant: 'destructive' });
      return false;
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Missing fields', description: 'Enter and confirm your new password.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Weak password', description: 'At least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await FirebaseAuthService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your password was changed.' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update password.';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAssignRole = async (targetId: string) => {
    if (!token) return;
    const ut = roleSelections[targetId];
    if (!ut) {
      toast({ title: 'Select a role', description: 'Choose employer, housegirl, or agency first.', variant: 'destructive' });
      return;
    }
    setSavingRoleId(targetId);
    try {
      await adminApi.assignUserRole(token, targetId, ut);
      toast({ title: 'Role assigned', description: 'User role has been updated.' });
      const noRolesData = await adminApi.getUsersWithoutRoles(token);
      setUsersWithoutRoles(noRolesData.users);
      await loadUsers();
      await refreshOverview();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' });
    } finally {
      setSavingRoleId(null);
    }
  };

  const resetAddUserForm = () => {
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserFirst('');
    setNewUserLast('');
    setNewUserPhone('');
    setNewUserType('employer');
  };

  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUserEmail.trim() || !newUserPassword || !newUserFirst.trim() || !newUserLast.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Email, password, first and last name are required.',
        variant: 'destructive',
      });
      return;
    }
    if (newUserPassword.length < 8) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    setCreatingUser(true);
    try {
      const res = await adminApi.createUser(token, {
        email: newUserEmail.trim(),
        password: newUserPassword,
        first_name: newUserFirst.trim(),
        last_name: newUserLast.trim(),
        user_type: newUserType,
        phone_number: newUserPhone.trim() || undefined,
      });
      toast({
        title: 'User created',
        description: `${res.user.email} — ${res.sign_in.instructions}`,
      });
      setAddUserOpen(false);
      resetAddUserForm();
      await refreshOverview();
      await loadUsers();
      await loadAdminNotifications();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create user';
      toast({ title: 'Could not create user', description: msg, variant: 'destructive' });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleJobStatus = async (jobId: string, status: 'active' | 'closed' | 'removed') => {
    if (!token) return;
    try {
      await adminApi.patchJobStatus(token, jobId, status);
      toast({ title: 'Updated', description: `Job marked ${status}` });
      await loadJobs();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' });
    }
  };

  const toggleJobActiveClosed = (job: AdminJobRow) => {
    if (job.status === 'removed') return;
    const next = job.status === 'active' ? 'closed' : 'active';
    handleJobStatus(job.id, next);
  };

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      !agencySearch ||
      agency.name.toLowerCase().includes(agencySearch.toLowerCase()) ||
      agency.license_number.toLowerCase().includes(agencySearch.toLowerCase()) ||
      agency.contact_email.toLowerCase().includes(agencySearch.toLowerCase());
    const matchesStatus = agencyStatusFilter === 'all' || agency.verification_status === agencyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const openUserSheet = (u: AdminUser) => {
    setDetailUserId(u.id);
    setSheetOpen(true);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const adminLogout = async () => {
    await signOut('/admin/login');
  };

  const start = (usersPagination.page - 1) * usersPagination.per_page + 1;
  const end = Math.min(usersPagination.page * usersPagination.per_page, usersPagination.total);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin — Domestic Connect</title>
      </Helmet>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
                {notifUnreadCount > 0 ? (
                  <span className="ml-2 text-base font-semibold text-amber-700">({notifUnreadCount} unread)</span>
                ) : null}
              </h1>
              <p className="text-gray-600">Manage your Domestic Connect platform</p>
              {user?.email && <p className="text-sm text-gray-500 mt-1">{user.email}</p>}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={adminLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
              <Button onClick={() => handleSync('all')} disabled={syncing} variant="outline" className="gap-2">
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync All Data
              </Button>
              <Button onClick={() => handleSync('users')} disabled={syncing} variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Sync Users
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {bootstrapping || !stats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.total_users}</div>
                  <p className="text-xs text-muted-foreground">+{stats.overview.monthly_users} this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.active_users}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Agencies</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.agencies.verified_agencies}</div>
                  <p className="text-xs text-muted-foreground">{stats.agencies.pending_verification} pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES {stats.payments.total_revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.payments.total_purchases} purchases</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {!bootstrapping && pendingAgencySignupAlerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {pendingAgencySignupAlerts.map((n) => (
              <div
                key={n.id}
                className="rounded-lg border border-blue-200 bg-blue-50/90 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3 min-w-0">
                  <AlertCircle className="h-5 w-5 shrink-0 text-blue-700 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-blue-950">{n.title}</p>
                    <p className="text-sm text-blue-900/90 mt-1">{n.message}</p>
                    {n.created_at && (
                      <p className="text-xs text-blue-800/70 mt-1">{formatDate(n.created_at)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void dismissAdminNotification(n.id)}
                  >
                    Dismiss
                  </Button>
                  <Button type="button" size="sm" onClick={() => void reviewAgencySignupNotification(n.id)}>
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {!bootstrapping && usersWithoutRoles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const next: Record<string, 'employer' | 'housegirl' | 'agency'> = {};
                  usersWithoutRoles.forEach((u) => {
                    next[u.id] = 'employer';
                  });
                  setRoleSelections(next);
                  setRoleModalOpen(true);
                }}
                className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-amber-900">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {usersWithoutRoles.length} user{usersWithoutRoles.length === 1 ? '' : 's'} have no role assigned — click to assign
                </div>
              </button>
            )}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between w-full">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage users and their account status</CardDescription>
                  </div>
                  <Button type="button" onClick={() => setAddUserOpen(true)} className="gap-2 shrink-0 w-full sm:w-auto">
                    <UserPlus className="h-4 w-4" />
                    Add user
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Input
                    placeholder="Search users..."
                    value={userSearchInput}
                    onChange={(e) => setUserSearchInput(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="employer">Employers</SelectItem>
                      <SelectItem value="housegirl">Housegirls</SelectItem>
                      <SelectItem value="agency">Agencies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {usersPageLoading && users.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} className={usersPageLoading ? 'opacity-60' : ''}>
                            <TableCell className="font-medium">
                              {u.first_name} {u.last_name}
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{u.user_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.is_active ? 'default' : 'secondary'}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(u.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePromoteUser(u.id, !u.is_admin)}
                                  title={u.is_admin ? 'Revoke admin' : 'Make admin'}
                                >
                                  <Shield className={`h-4 w-4 ${u.is_admin ? 'text-yellow-500' : 'text-gray-400'}`} />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openUserSheet(u)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleUserStatus(u.id)}>
                                  {u.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>
                        {usersPagination.total
                          ? `Showing ${start}–${end} of ${usersPagination.total}`
                          : 'No users'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!usersPagination.has_prev || usersPageLoading}
                          onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!usersPagination.has_next || usersPageLoading}
                          onClick={() => setUsersPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Management</CardTitle>
                <CardDescription>Manage agency verification and status</CardDescription>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Input
                    placeholder="Search agencies..."
                    value={agencySearch}
                    onChange={(e) => setAgencySearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={agencyStatusFilter} onValueChange={setAgencyStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {bootstrapping ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Placements</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgencies.map((agency) => (
                        <TableRow key={agency.id}>
                          <TableCell className="font-medium">{agency.name}</TableCell>
                          <TableCell>{agency.license_number}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                agency.verification_status === 'verified'
                                  ? 'default'
                                  : agency.verification_status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {agency.verification_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{agency.rating?.toFixed?.(1) ?? '—'}</TableCell>
                          <TableCell>{agency.successful_placements}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {agency.verification_status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setVerifyAgencyTarget(agency);
                                      setVerifyOperatorId(agency.dashboard_user_id || '');
                                    }}
                                  >
                                    Verify
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleVerifyAgency(agency.id, 'rejected')}>
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs</CardTitle>
                <CardDescription>All job postings</CardDescription>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Input
                    placeholder="Search title or location..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Employer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Apps</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium max-w-[180px] truncate">{job.title}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.employer_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(job.created_at)}</TableCell>
                          <TableCell>{job.applications_count}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={job.status === 'removed'}
                                onClick={() => toggleJobActiveClosed(job)}
                              >
                                {job.status === 'active' ? 'Close' : 'Activate'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={job.status === 'removed'}
                                onClick={() => handleJobStatus(job.id, 'removed')}
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentsLoading || !paymentsSummary ? (
                [1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-28" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">KES {paymentsSummary.total_revenue.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">KES {paymentsSummary.this_month_revenue.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{paymentsSummary.total_purchases}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Profile Unlocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{paymentsSummary.unlocks_count}</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-48 mt-2">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Email</TableHead>
                        <TableHead>Amount (KES)</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.user_email || '—'}</TableCell>
                          <TableCell>{p.amount != null ? Number(p.amount).toLocaleString() : '—'}</TableCell>
                          <TableCell>{p.package_name || p.package_id || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(p.purchase_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {bootstrapping || !stats ? (
              <Card>
                <CardContent className="py-8 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Employers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.overview.total_employers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Housegirls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.overview.total_housegirls}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Agencies (accounts)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.overview.total_agencies}</div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>Signups, verifications, and revenue</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span>Monthly signups</span>
                      <span className="font-semibold">{stats.overview.monthly_users}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 items-center">
                      <span>Pending agency verifications</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stats.agencies.pending_verification}</span>
                        <Button variant="link" className="p-0 h-auto" onClick={() => setMainTab('agencies')}>
                          Open Agencies tab
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Total revenue (KES)</span>
                      <span className="font-semibold">{stats.payments.total_revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Purchases count</span>
                      <span className="font-semibold">{stats.payments.total_purchases}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent users</CardTitle>
                      <CardDescription>Last 5 new accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {stats.recent_activity.users.map((u) => (
                        <div key={u.id} className="border-b pb-2 last:border-0">
                          <div className="font-medium">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-muted-foreground">{u.email}</div>
                          <Badge variant="outline" className="mt-1">
                            {u.user_type}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">{formatDate(u.created_at)}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent purchases</CardTitle>
                      <CardDescription>Last 5 transactions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {stats.recent_activity.purchases.map((p) => (
                        <div key={p.id} className="border-b pb-2 last:border-0">
                          <div className="font-medium">KES {p.amount != null ? Number(p.amount).toLocaleString() : '—'}</div>
                          <div className="text-muted-foreground">User {p.user_id}</div>
                          <Badge variant="outline" className="mt-1">
                            {p.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">{formatDate(p.purchase_date)}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Account Security
                </CardTitle>
                <CardDescription>Update your administrator password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      className="pr-10"
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pr-10"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePasswordChange} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-red-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Critical administrator actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Deleting your administrator account is restricted. Contact system support for assistance.
                </p>
                <Button variant="destructive" disabled size="sm">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) setDetailUserId(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User details</SheetTitle>
            <SheetDescription>
              {userDetail ? (
                <>
                  {userDetail.first_name} {userDetail.last_name}
                </>
              ) : (
                'Loading…'
              )}
            </SheetDescription>
          </SheetHeader>

          {detailLoading || !userDetail ? (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Email:</span> {userDetail.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <Badge variant="outline">{userDetail.user_type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span> {userDetail.phone_number || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Admin:</span> {userDetail.is_admin ? 'Yes' : 'No'}
                </div>
              </div>

              {userDetail.user_type === 'housegirl' && userDetail.profile?.housegirl && (
                <div className="space-y-3 border rounded-lg p-4">
                  <h3 className="font-semibold">Housegirl profile</h3>
                  {userDetail.profile.housegirl.profile_photo_url && (
                    <img
                      src={userDetail.profile.housegirl.profile_photo_url}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{userDetail.profile.housegirl.bio || '—'}</p>
                  <div className="text-sm text-muted-foreground">
                    <div>Skills: {(userDetail.profile.housegirl.skills || []).join(', ') || '—'}</div>
                    <div>Location: {userDetail.profile.housegirl.location || userDetail.profile.housegirl.current_location || '—'}</div>
                    <div>Salary: {userDetail.profile.housegirl.expected_salary ?? '—'}</div>
                    <div>Available: {userDetail.profile.housegirl.is_available !== false ? 'Yes' : 'No'}</div>
                    <div>Profile complete: {userDetail.profile.housegirl.profile_complete ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {userDetail.user_type === 'employer' && userDetail.profile?.employer && (
                <div className="space-y-1 text-sm border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Employer</h3>
                  <div>Company: {userDetail.profile.employer.company_name || '—'}</div>
                  <div>Location: {userDetail.profile.employer.location || '—'}</div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Purchases</h3>
                <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {userDetail.purchases?.length ? (
                    userDetail.purchases.map((p) => (
                      <div key={p.id} className="border rounded p-2">
                        <div className="font-medium">{formatDate(p.purchase_date)}</div>
                        <div>KES {p.amount != null ? Number(p.amount).toLocaleString() : '—'}</div>
                        <div className="text-muted-foreground">{p.package_name || p.package_id || 'Package'}</div>
                        <Badge variant="outline" className="mt-1">
                          {p.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No purchases</p>
                  )}
                </div>
              </div>

              {userDetail.user_type === 'housegirl' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Edit profile</h3>
                  <div>
                    <label className="text-xs text-muted-foreground">Bio</label>
                    <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Location</label>
                    <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Experience</label>
                    <Select value={editExperience} onValueChange={setEditExperience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Expected salary</label>
                    <Input
                      type="number"
                      value={editSalary || ''}
                      onChange={(e) => setEditSalary(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Accommodation</label>
                    <Select value={editAccommodation} onValueChange={setEditAccommodation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Skills (comma-separated)</label>
                    <Input value={editSkills} onChange={(e) => setEditSkills(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available</span>
                    <Switch checked={editAvailable} onCheckedChange={setEditAvailable} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile complete</span>
                    <Switch checked={editProfileComplete} onCheckedChange={setEditProfileComplete} />
                  </div>
                  <Button onClick={handleSaveHousegirlProfile} disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save profile'}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => handleToggleUserStatus(userDetail.id)}>
                  {userDetail.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="outline" onClick={() => handlePromoteUser(userDetail.id, !userDetail.is_admin)}>
                  {userDetail.is_admin ? 'Revoke admin' : 'Make admin'}
                </Button>
                <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)} className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete user
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the Firestore user, their role profiles, purchases for this user, and the Firebase Auth account. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={addUserOpen}
        onOpenChange={(open) => {
          setAddUserOpen(open);
          if (!open) resetAddUserForm();
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Creates Firebase Auth and Firestore records. Share the password securely (phone or in person). For SMS to Firebase Auth, use E.164 (e.g. +254…); otherwise phone is stored only in Firestore.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Initial password</label>
              <Input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">First name</label>
                <Input value={newUserFirst} onChange={(e) => setNewUserFirst(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Last name</label>
                <Input value={newUserLast} onChange={(e) => setNewUserLast(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Phone (optional)</label>
              <Input value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} placeholder="+254…" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Role</label>
              <Select value={newUserType} onValueChange={(v) => setNewUserType(v as 'employer' | 'housegirl' | 'agency')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="housegirl">Housegirl</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} disabled={creatingUser}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateUser} disabled={creatingUser}>
                {creatingUser ? 'Creating…' : 'Create user'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign roles</DialogTitle>
            <DialogDescription>Users with no role — pick a role and save per user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {usersWithoutRoles.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row gap-2 sm:items-center border-b pb-3">
                <div className="flex-1 text-sm">
                  <div className="font-medium">
                    {u.first_name} {u.last_name}
                  </div>
                  <div className="text-muted-foreground">{u.email}</div>
                </div>
                <Select
                  value={roleSelections[u.id] || 'employer'}
                  onValueChange={(v) =>
                    setRoleSelections((prev) => ({ ...prev, [u.id]: v as 'employer' | 'housegirl' | 'agency' }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="housegirl">Housegirl</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => handleAssignRole(u.id)} disabled={savingRoleId === u.id}>
                  {savingRoleId === u.id ? 'Saving…' : 'Save'}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!verifyAgencyTarget} onOpenChange={(open) => !open && setVerifyAgencyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify agency</DialogTitle>
            <DialogDescription>Choose the agency operator user to link to this marketplace listing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Operator account</Label>
              <Select value={verifyOperatorId} onValueChange={setVerifyOperatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agency user" />
                </SelectTrigger>
                <SelectContent>
                  {agencyUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.email} — {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setVerifyAgencyTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!verifyAgencyTarget || !verifyOperatorId) {
                    toast({ title: 'Select an operator', description: 'Choose a user with role agency.', variant: 'destructive' });
                    return;
                  }
                  const ok = await handleVerifyAgency(verifyAgencyTarget.id, 'verified', verifyOperatorId);
                  if (ok) setVerifyAgencyTarget(null);
                }}
              >
                Verify and link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
