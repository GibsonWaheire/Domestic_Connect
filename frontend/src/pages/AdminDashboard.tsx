import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  adminApi, AdminDashboardStats, AdminUser, AdminAgency, AdminUserDetail,
  AdminJobRow, AdminPaymentRow, AdminPaymentsSummary, UserWithoutRole,
  AdminNotification, PendingAgencyOperator, AdminMatchRequest,
} from '@/lib/api';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { useAuth } from '@/hooks/useAuthEnhanced';
import {
  Users, DollarSign, TrendingUp, RefreshCw, Shield, Eye, EyeOff,
  AlertCircle, LogOut, Trash2, UserPlus, LayoutDashboard, Briefcase,
  Building2, CreditCard, PhoneCall, Star, Settings, Bell, ChevronRight,
  Copy, CheckCircle2,
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

const NAV = [
  { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { id: 'users',     label: 'Users',           icon: Users },
  { id: 'agencies',  label: 'Agencies',        icon: Building2 },
  { id: 'jobs',      label: 'Jobs',            icon: Briefcase },
  { id: 'payments',  label: 'Payments',        icon: CreditCard },
  { id: 'followup',  label: 'Follow Up',       icon: PhoneCall },
  { id: 'matches',   label: 'Match Requests',  icon: Star },
  { id: 'settings',  label: 'Settings',        icon: Settings },
];

// ── small helpers ──────────────────────────────────────────────────────────────
const fmt = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

// dark card wrapper
const DCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#1a1a1a] border border-[#272727] rounded-xl p-5 ${className}`}>{children}</div>
);

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

  useEffect(() => {
    if (user && !user.is_admin) {
      toast({ title: 'Access Denied', variant: 'destructive' });
      if (user.user_type === 'employer') navigate('/employer-dashboard');
      else if (user.user_type === 'housegirl') navigate('/housegirl-dashboard');
      else if (user.user_type === 'agency') navigate('/agency-dashboard');
      else navigate('/');
    }
  }, [user, navigate]);

  // ── state ────────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, per_page: 20, total: 0, pages: 0, has_next: false, has_prev: false });
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [pendingMarketplaceOperators, setPendingMarketplaceOperators] = useState<PendingAgencyOperator[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [usersPageLoading, setUsersPageLoading] = useState(false);
  const agencyUsers = useMemo(() => users.filter((u) => u.user_type === 'agency'), [users]);
  const [syncing, setSyncing] = useState(false);
  const [activePage, setActivePage] = useState('overview');
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

  const verifyOperatorSelectOptions = useMemo(() => {
    const dash = verifyAgencyTarget?.dashboard_user_id;
    if (dash && !agencyUsers.some((u) => u.id === dash)) {
      return [{ id: dash, email: '(Pre-linked operator)', first_name: '', last_name: '', user_type: 'agency', has_profile: true, is_active: true, created_at: '', updated_at: '' } as AdminUser, ...agencyUsers];
    }
    return agencyUsers;
  }, [agencyUsers, verifyAgencyTarget?.dashboard_user_id]);

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

  const [editPhone, setEditPhone] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExperience, setEditExperience] = useState('no_experience');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editAccommodation, setEditAccommodation] = useState('live_in');
  const [editSkills, setEditSkills] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editProfileComplete, setEditProfileComplete] = useState(false);
  const [editSaveError, setEditSaveError] = useState('');
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

  const [followUpPayments, setFollowUpPayments] = useState<AdminPaymentRow[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [followUpNote, setFollowUpNote] = useState<Record<string, string>>({});

  const [matchRequests, setMatchRequests] = useState<AdminMatchRequest[]>([]);
  const [matchRequestsLoading, setMatchRequestsLoading] = useState(false);
  const [resolvingMatchId, setResolvingMatchId] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ── debounce ─────────────────────────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(userSearchInput), 400); return () => clearTimeout(t); }, [userSearchInput]);
  useEffect(() => { const t = setTimeout(() => setDebouncedJobSearch(jobSearch), 400); return () => clearTimeout(t); }, [jobSearch]);
  useEffect(() => { setUsersPage(1); }, [debouncedSearch, userTypeFilter]);

  useEffect(() => {
    FirebaseAuthService.getIdToken().then(setToken);
  }, []);

  // ── data loaders ─────────────────────────────────────────────────────────────
  const refreshOverview = useCallback(async () => {
    if (!token) return;
    const [statsData, agenciesData, noRolesData, pendingOps] = await Promise.all([
      adminApi.getDashboardStats(token),
      adminApi.getAgencies(token),
      adminApi.getUsersWithoutRoles(token),
      adminApi.getPendingAgencyOperators(token),
    ]);
    setStats(statsData);
    setAgencies(agenciesData.agencies);
    setUsersWithoutRoles(noRolesData.users);
    setPendingMarketplaceOperators(pendingOps.operators);
  }, [token]);

  const loadAdminNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminApi.getNotifications(token, { limit: 40 });
      setAdminNotifications(res.notifications);
      setNotifUnreadCount(res.unread_count);
    } catch (e) { console.error(e); }
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setUsersPageLoading(true);
    try {
      const res = await adminApi.getUsers(token, { page: usersPage, per_page: 20, user_type: userTypeFilter === 'all' ? undefined : userTypeFilter, search: debouncedSearch.trim() || undefined });
      setUsers(res.users);
      setUsersPagination({ page: res.pagination.page, per_page: res.pagination.per_page, total: res.pagination.total, pages: res.pagination.pages, has_next: res.pagination.has_next ?? false, has_prev: res.pagination.has_prev ?? false });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally { setUsersPageLoading(false); }
  }, [token, usersPage, userTypeFilter, debouncedSearch]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      try { await refreshOverview(); await loadAdminNotifications(); }
      catch (error) { console.error(error); }
      finally { if (!cancelled) setBootstrapping(false); }
    })();
    return () => { cancelled = true; };
  }, [token, refreshOverview, loadAdminNotifications]);

  useEffect(() => {
    if (!token || bootstrapping) return;
    loadUsers();
  }, [token, usersPage, userTypeFilter, debouncedSearch, bootstrapping, loadUsers]);

  const loadJobs = useCallback(async () => {
    if (!token) return;
    setJobsLoading(true);
    try {
      const res = await adminApi.getJobs(token, { status: jobStatusFilter === 'all' ? undefined : jobStatusFilter, search: debouncedJobSearch.trim() || undefined });
      setJobs(res.jobs);
    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' }); }
    finally { setJobsLoading(false); }
  }, [token, jobStatusFilter, debouncedJobSearch]);

  useEffect(() => { if (activePage !== 'jobs' || !token) return; loadJobs(); }, [activePage, token, jobStatusFilter, debouncedJobSearch, loadJobs]);

  const loadPayments = useCallback(async () => {
    if (!token) return;
    setPaymentsLoading(true);
    try {
      const res = await adminApi.getPayments(token, { status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter });
      setPayments(res.purchases);
      setPaymentsSummary(res.summary);
    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to load payments', variant: 'destructive' }); }
    finally { setPaymentsLoading(false); }
  }, [token, paymentStatusFilter]);

  useEffect(() => { if (activePage !== 'payments' || !token) return; loadPayments(); }, [activePage, token, paymentStatusFilter, loadPayments]);

  const loadFollowUp = useCallback(async () => {
    if (!token) return;
    setFollowUpLoading(true);
    try {
      const res = await adminApi.getPayments(token, { status: undefined }); // all
      const unpaid = (res.purchases || []).filter((p: AdminPaymentRow) => p.status !== 'completed');
      setFollowUpPayments(unpaid);
    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to load follow-up list', variant: 'destructive' }); }
    finally { setFollowUpLoading(false); }
  }, [token]);

  useEffect(() => { if (activePage !== 'followup' || !token) return; loadFollowUp(); }, [activePage, token, loadFollowUp]);

  const loadMatchRequests = useCallback(async () => {
    if (!token) return;
    setMatchRequestsLoading(true);
    try {
      const res = await adminApi.getMatchRequests(token);
      setMatchRequests((res as { match_requests: AdminMatchRequest[] }).match_requests || []);
    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to load match requests', variant: 'destructive' }); }
    finally { setMatchRequestsLoading(false); }
  }, [token]);

  useEffect(() => { if (activePage !== 'matches' || !token) return; loadMatchRequests(); }, [activePage, token, loadMatchRequests]);

  const fetchUserDetail = useCallback(async (uid: string) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const d = await adminApi.getUserDetails(token, uid);
      setUserDetail(d);
      setEditPhone(d.phone_number || '');
      setEditFirstName(d.first_name || '');
      setEditLastName(d.last_name || '');
      setEditSaveError('');
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
    } catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to load user details', variant: 'destructive' }); }
    finally { setDetailLoading(false); }
  }, [token]);

  useEffect(() => {
    if (sheetOpen && detailUserId && token) fetchUserDetail(detailUserId);
    if (!sheetOpen) setUserDetail(null);
  }, [sheetOpen, detailUserId, token, fetchUserDetail]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const dismissAdminNotification = async (id: string) => {
    if (!token) return;
    try { await adminApi.markNotificationRead(token, id); await loadAdminNotifications(); }
    catch (e) { console.error(e); }
  };

  const reviewAgencySignupNotification = async (id: string) => {
    if (!token) return;
    try {
      await adminApi.markNotificationRead(token, id);
      setUserTypeFilter('agency'); setActivePage('users'); setUsersPage(1);
      await loadAdminNotifications(); await loadUsers();
    } catch (e) { console.error(e); }
  };

  const handleSync = async (syncType = 'all') => {
    if (!token) return;
    setSyncing(true);
    try { await adminApi.syncData(token, syncType); toast({ title: 'Sync complete' }); await refreshOverview(); await loadUsers(); await loadAdminNotifications(); }
    catch (error) { console.error(error); toast({ title: 'Sync failed', variant: 'destructive' }); }
    finally { setSyncing(false); }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (!token) return;
    try { await adminApi.toggleUserStatus(token, userId); await refreshOverview(); await loadUsers(); if (detailUserId === userId) await fetchUserDetail(userId); }
    catch (error) { console.error(error); toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handlePromoteUser = async (userId: string, makeAdmin: boolean) => {
    if (!token) return;
    try { await adminApi.promoteUser(token, userId, makeAdmin); toast({ title: makeAdmin ? 'Admin granted' : 'Admin revoked' }); await refreshOverview(); await loadUsers(); if (detailUserId === userId) await fetchUserDetail(userId); }
    catch (error) { console.error(error); toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleDeleteUser = async () => {
    if (!token || !detailUserId) return;
    setDeleting(true);
    try { await adminApi.deleteUser(token, detailUserId); toast({ title: 'User deleted' }); setDeleteConfirmOpen(false); setSheetOpen(false); setDetailUserId(null); await refreshOverview(); await loadUsers(); }
    catch (error) { console.error(error); toast({ title: 'Error', variant: 'destructive' }); }
    finally { setDeleting(false); }
  };

  const handleSaveHousegirlProfile = async () => {
    if (!token || !detailUserId) return;
    setEditSaveError('');
    const skills = editSkills.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    setSavingProfile(true);
    try {
      await adminApi.patchHousegirlProfile(token, detailUserId, { ...(editPhone.trim() ? { phone_number: editPhone.trim() } : {}), ...(editFirstName.trim() ? { first_name: editFirstName.trim() } : {}), ...(editLastName.trim() ? { last_name: editLastName.trim() } : {}), bio: editBio, location: editLocation, experience: editExperience, expected_salary: editSalary, accommodation_type: editAccommodation, skills, is_available: editAvailable, profile_complete: editProfileComplete });
      toast({ title: 'Saved' }); await fetchUserDetail(detailUserId);
    } catch (e) { setEditSaveError(e instanceof Error ? e.message : 'Failed to save profile.'); }
    finally { setSavingProfile(false); }
  };

  const handleVerifyAgency = async (agencyId: string, status: string, dashboardUserId?: string) => {
    if (!token) return false;
    try { await adminApi.verifyAgency(token, agencyId, status, dashboardUserId); toast({ title: `Agency ${status}` }); await refreshOverview(); await loadUsers(); await loadAdminNotifications(); return true; }
    catch (error) { console.error(error); toast({ title: 'Error', variant: 'destructive' }); return false; }
  };

  const handleCreateOperatorMarketplaceListing = async (operatorUserId: string) => {
    if (!token) return;
    try { await adminApi.createMarketplaceListingForOperator(token, operatorUserId); toast({ title: 'Listing created' }); await refreshOverview(); }
    catch (e) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }); await refreshOverview(); }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) { toast({ title: 'Weak password', description: 'At least 8 characters.', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Mismatch', variant: 'destructive' }); return; }
    setIsUpdatingPassword(true);
    try { await FirebaseAuthService.updatePassword(newPassword); setNewPassword(''); setConfirmPassword(''); toast({ title: 'Password updated' }); }
    catch (error) { toast({ title: 'Update failed', description: error instanceof Error ? error.message : 'Error', variant: 'destructive' }); }
    finally { setIsUpdatingPassword(false); }
  };

  const handleAssignRole = async (targetId: string) => {
    if (!token) return;
    const ut = roleSelections[targetId];
    if (!ut) { toast({ title: 'Select a role', variant: 'destructive' }); return; }
    setSavingRoleId(targetId);
    try { await adminApi.assignUserRole(token, targetId, ut); toast({ title: 'Role assigned' }); const res = await adminApi.getUsersWithoutRoles(token); setUsersWithoutRoles(res.users); await loadUsers(); await refreshOverview(); }
    catch (e) { console.error(e); toast({ title: 'Error', variant: 'destructive' }); }
    finally { setSavingRoleId(null); }
  };

  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUserEmail.trim() || !newUserPassword || !newUserFirst.trim() || !newUserLast.trim()) { toast({ title: 'Missing fields', variant: 'destructive' }); return; }
    if (newUserPassword.length < 8) { toast({ title: 'Weak password', variant: 'destructive' }); return; }
    setCreatingUser(true);
    try {
      const res = await adminApi.createUser(token, { email: newUserEmail.trim(), password: newUserPassword, first_name: newUserFirst.trim(), last_name: newUserLast.trim(), user_type: newUserType, phone_number: newUserPhone.trim() || undefined });
      toast({ title: 'User created', description: `${res.user.email} — ${res.sign_in.instructions}` });
      setAddUserOpen(false);
      setNewUserEmail(''); setNewUserPassword(''); setNewUserFirst(''); setNewUserLast(''); setNewUserPhone(''); setNewUserType('employer');
      await refreshOverview(); await loadUsers(); await loadAdminNotifications();
    } catch (e) { toast({ title: 'Could not create user', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' }); }
    finally { setCreatingUser(false); }
  };

  const handleJobStatus = async (jobId: string, status: 'active' | 'closed' | 'removed') => {
    if (!token) return;
    try { await adminApi.patchJobStatus(token, jobId, status); toast({ title: `Job ${status}` }); await loadJobs(); }
    catch (e) { console.error(e); toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleResolveMatch = async (matchId: string, status: string, notes?: string) => {
    if (!token) return;
    setResolvingMatchId(matchId);
    try {
      await adminApi.resolveMatchRequest(token, matchId, status, notes);
      toast({ title: 'Updated' });
      setMatchRequests(prev => prev.map(m => m.id === matchId ? { ...m, status: status as AdminMatchRequest['status'], admin_notes: notes || m.admin_notes } : m));
    } catch (e) { console.error(e); toast({ title: 'Error', variant: 'destructive' }); }
    finally { setResolvingMatchId(null); }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = !agencySearch || agency.name.toLowerCase().includes(agencySearch.toLowerCase()) || agency.license_number.toLowerCase().includes(agencySearch.toLowerCase()) || agency.contact_email.toLowerCase().includes(agencySearch.toLowerCase());
    const matchesStatus = agencyStatusFilter === 'all' || agency.verification_status === agencyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const openUserSheet = (u: AdminUser) => { setDetailUserId(u.id); setSheetOpen(true); };
  const start = (usersPagination.page - 1) * usersPagination.per_page + 1;
  const end = Math.min(usersPagination.page * usersPagination.per_page, usersPagination.total);

  // ── sidebar nav item ─────────────────────────────────────────────────────────
  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const Icon = item.icon;
    const active = activePage === item.id;
    const badge = item.id === 'followup' && stats ? (stats.payments as { unpaid_count?: number }).unpaid_count || 0 : item.id === 'overview' && notifUnreadCount > 0 ? notifUnreadCount : 0;
    return (
      <button
        type="button"
        onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-[#777] hover:text-[#bbb] hover:bg-white/5'}`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {badge > 0 && <span className="text-xs bg-amber-500 text-black rounded-full px-1.5 py-0.5 font-bold leading-none">{badge}</span>}
        {active && <ChevronRight className="h-3 w-3 opacity-40" />}
      </button>
    );
  };

  // ── sidebar ───────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0d0d0d] border-r border-[#1e1e1e] w-60 shrink-0">
      {/* logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#1e1e1e]">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">Domestic Connect</div>
          <div className="text-[#555] text-xs">Admin</div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* user + logout */}
      <div className="border-t border-[#1e1e1e] px-3 py-4 space-y-2">
        {user?.email && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <span className="text-[#666] text-xs truncate">{user.email}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut('/dc-ops9k4/portal')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/5 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  // ── stat card ─────────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) => (
    <DCard className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent || 'bg-white/8'}`}>
        <Icon className="h-5 w-5 text-white/70" />
      </div>
      <div className="min-w-0">
        <div className="text-[#666] text-xs font-medium uppercase tracking-wide">{label}</div>
        <div className="text-white text-2xl font-bold mt-0.5">{value}</div>
        {sub && <div className="text-[#555] text-xs mt-0.5">{sub}</div>}
      </div>
    </DCard>
  );

  // ── section header ────────────────────────────────────────────────────────────
  const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      {action}
    </div>
  );

  // dark table helpers
  const TH = ({ children }: { children: React.ReactNode }) => (
    <th className="text-left text-[#555] text-xs font-medium uppercase tracking-wide px-3 py-2.5 border-b border-[#1e1e1e]">{children}</th>
  );
  const TR = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <tr onClick={onClick} className={`border-b border-[#1a1a1a] last:border-0 ${onClick ? 'cursor-pointer hover:bg-white/3' : ''}`}>{children}</tr>
  );
  const TD = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <td className={`px-3 py-3 text-sm text-[#ccc] ${className}`}>{children}</td>
  );

  // dark input / select wrapper
  const darkInput = 'bg-[#111] border-[#2a2a2a] text-white placeholder:text-[#444] focus-visible:ring-white/20';
  const darkSelect = 'bg-[#111] border-[#2a2a2a] text-white';

  // ── pages ─────────────────────────────────────────────────────────────────────

  const OverviewPage = () => (
    <div className="space-y-6">
      {bootstrapping || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <DCard key={i}><Skeleton className="h-16 bg-white/5" /></DCard>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.overview.total_users} sub={`+${stats.overview.monthly_users} this month`} icon={Users} />
          <StatCard label="Active (30d)" value={stats.overview.active_users} icon={TrendingUp} />
          <StatCard label="Verified Agencies" value={stats.agencies.verified_agencies} sub={`${stats.agencies.pending_verification} pending`} icon={Building2} />
          <StatCard label="Revenue (Paid)" value={`KES ${stats.payments.total_revenue.toLocaleString()}`} sub={`${stats.payments.total_purchases} paid transactions`} icon={DollarSign} accent="bg-emerald-500/15" />
        </div>
      )}

      {/* Alerts */}
      {!bootstrapping && pendingAgencySignupAlerts.length > 0 && (
        <div className="space-y-3">
          {pendingAgencySignupAlerts.map(n => (
            <div key={n.id} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <Bell className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-amber-200 text-sm font-medium">{n.title}</p>
                <p className="text-amber-300/70 text-xs mt-0.5">{n.message}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => dismissAdminNotification(n.id)} className="text-xs text-[#666] hover:text-white">Dismiss</button>
                <button type="button" onClick={() => reviewAgencySignupNotification(n.id)} className="text-xs text-amber-400 hover:text-amber-300">Review</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DCard>
            <div className="text-[#666] text-xs font-medium uppercase tracking-wide mb-3">Recent Signups</div>
            <div className="space-y-3">
              {stats.recent_activity.users.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(u.first_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm truncate">{u.first_name} {u.last_name}</div>
                    <div className="text-[#555] text-xs truncate">{u.email}</div>
                  </div>
                  <Badge variant="outline" className="text-xs border-[#2a2a2a] text-[#777] shrink-0">{u.user_type}</Badge>
                </div>
              ))}
            </div>
          </DCard>
          <DCard>
            <div className="text-[#666] text-xs font-medium uppercase tracking-wide mb-3">Recent Payments</div>
            <div className="space-y-3">
              {stats.recent_activity.purchases.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm">KES {p.amount != null ? Number(p.amount).toLocaleString() : '—'}</div>
                    <div className="text-[#555] text-xs">{fmt(p.purchase_date)}</div>
                  </div>
                  <Badge variant={p.status === 'completed' ? 'default' : 'secondary'} className="text-xs shrink-0">{p.status}</Badge>
                </div>
              ))}
            </div>
          </DCard>
        </div>
      )}

      {/* Sync */}
      <DCard className="flex flex-wrap gap-2 items-center justify-between">
        <span className="text-[#666] text-sm">Data sync</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => handleSync('users')} disabled={syncing} className="px-3 py-1.5 text-xs rounded-lg border border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444] transition-colors disabled:opacity-40">Sync Users</button>
          <button type="button" onClick={() => handleSync('all')} disabled={syncing} className="px-3 py-1.5 text-xs rounded-lg border border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444] transition-colors disabled:opacity-40 flex items-center gap-1.5">
            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} /> Sync All
          </button>
        </div>
      </DCard>
    </div>
  );

  const UsersPage = () => (
    <div className="space-y-4">
      {!bootstrapping && usersWithoutRoles.length > 0 && (
        <button type="button" onClick={() => { const next: Record<string, 'employer' | 'housegirl' | 'agency'> = {}; usersWithoutRoles.forEach(u => { next[u.id] = 'employer'; }); setRoleSelections(next); setRoleModalOpen(true); }} className="w-full text-left rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 hover:bg-amber-500/12 transition-colors">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium"><AlertCircle className="h-4 w-4 shrink-0" />{usersWithoutRoles.length} user(s) have no role — click to assign</div>
        </button>
      )}
      <DCard>
        <SectionHeader title="Users" action={
          <button type="button" onClick={() => setAddUserOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90">
            <UserPlus className="h-4 w-4" /> Add user
          </button>
        } />
        <div className="flex flex-wrap gap-3 mb-4">
          <Input placeholder="Search…" value={userSearchInput} onChange={e => setUserSearchInput(e.target.value)} className={`${darkInput} max-w-xs`} />
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className={`${darkSelect} w-40`}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="employer">Employers</SelectItem>
              <SelectItem value="housegirl">Housegirls</SelectItem>
              <SelectItem value="agency">Agencies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {usersPageLoading && users.length === 0 ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 bg-white/5" />)}</div>
        ) : (
          <>
            <table className="w-full">
              <thead><tr>{['Name','Email','Type','Status','Created',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <TR key={u.id} onClick={() => openUserSheet(u)}>
                    <TD><span className="text-white font-medium">{u.first_name} {u.last_name}</span></TD>
                    <TD>{u.email}</TD>
                    <TD><Badge variant="outline" className="border-[#2a2a2a] text-[#888]">{u.user_type}</Badge></TD>
                    <TD><span className={`text-xs font-medium ${u.is_active ? 'text-emerald-400' : 'text-[#555]'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></TD>
                    <TD>{fmt(u.created_at)}</TD>
                    <TD><Eye className="h-4 w-4 text-[#444]" /></TD>
                  </TR>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 text-xs text-[#555]">
              <span>{usersPagination.total ? `${start}–${end} of ${usersPagination.total}` : 'No users'}</span>
              <div className="flex gap-2">
                <button type="button" disabled={!usersPagination.has_prev} onClick={() => setUsersPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border border-[#2a2a2a] disabled:opacity-30 hover:border-[#444] text-[#aaa]">Prev</button>
                <button type="button" disabled={!usersPagination.has_next} onClick={() => setUsersPage(p => p+1)} className="px-3 py-1 rounded border border-[#2a2a2a] disabled:opacity-30 hover:border-[#444] text-[#aaa]">Next</button>
              </div>
            </div>
          </>
        )}
      </DCard>
    </div>
  );

  const AgenciesPage = () => (
    <div className="space-y-4">
      {!bootstrapping && pendingMarketplaceOperators.length > 0 && (
        <DCard>
          <div className="text-amber-300 text-sm font-medium mb-3">Operators without a marketplace listing</div>
          <table className="w-full">
            <thead><tr>{['Agency','Email','User ID',''].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {pendingMarketplaceOperators.map(op => (
                <TR key={op.id}>
                  <TD><span className="text-white">{op.agency_name || `${op.first_name || ''} ${op.last_name || ''}`.trim() || '—'}</span></TD>
                  <TD>{op.email || '—'}</TD>
                  <TD className="font-mono text-xs">{op.id}</TD>
                  <TD><button type="button" onClick={() => handleCreateOperatorMarketplaceListing(op.id)} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#444] text-[#aaa] hover:text-white">Create listing</button></TD>
                </TR>
              ))}
            </tbody>
          </table>
        </DCard>
      )}
      <DCard>
        <SectionHeader title="Agencies" />
        <div className="flex flex-wrap gap-3 mb-4">
          <Input placeholder="Search…" value={agencySearch} onChange={e => setAgencySearch(e.target.value)} className={`${darkInput} max-w-xs`} />
          <Select value={agencyStatusFilter} onValueChange={setAgencyStatusFilter}>
            <SelectTrigger className={`${darkSelect} w-40`}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <table className="w-full">
          <thead><tr>{['Name','License','Status','Rating','Placements','Actions'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {filteredAgencies.map(agency => (
              <TR key={agency.id}>
                <TD><span className="text-white font-medium">{agency.name}</span></TD>
                <TD>{agency.license_number}</TD>
                <TD><Badge variant={agency.verification_status === 'verified' ? 'default' : agency.verification_status === 'rejected' ? 'destructive' : 'secondary'}>{agency.verification_status}</Badge></TD>
                <TD>{agency.rating?.toFixed?.(1) ?? '—'}</TD>
                <TD>{agency.successful_placements}</TD>
                <TD>
                  {agency.verification_status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => { setVerifyAgencyTarget(agency); setVerifyOperatorId(agency.dashboard_user_id || ''); }} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#444] text-[#aaa] hover:text-white">Verify</button>
                      <button type="button" onClick={() => handleVerifyAgency(agency.id, 'rejected')} className="text-xs px-2 py-1 rounded border border-red-800/40 hover:border-red-600/60 text-red-400">Reject</button>
                    </div>
                  )}
                </TD>
              </TR>
            ))}
          </tbody>
        </table>
      </DCard>
    </div>
  );

  const JobsPage = () => (
    <DCard>
      <SectionHeader title="Jobs" />
      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search title or location…" value={jobSearch} onChange={e => setJobSearch(e.target.value)} className={`${darkInput} max-w-xs`} />
        <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
          <SelectTrigger className={`${darkSelect} w-40`}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {jobsLoading ? <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 bg-white/5" />)}</div> : (
        <table className="w-full">
          <thead><tr>{['Title','Location','Employer','Status','Posted','Apps','Actions'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {jobs.map(job => (
              <TR key={job.id}>
                <TD><span className="text-white font-medium max-w-[160px] truncate block">{job.title}</span></TD>
                <TD>{job.location}</TD>
                <TD>{job.employer_name}</TD>
                <TD><Badge variant="outline" className="border-[#2a2a2a] text-[#888]">{job.status}</Badge></TD>
                <TD>{fmt(job.created_at)}</TD>
                <TD>{job.applications_count}</TD>
                <TD>
                  <div className="flex gap-1.5">
                    <button type="button" disabled={job.status === 'removed'} onClick={() => handleJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')} className="text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#444] text-[#aaa] hover:text-white disabled:opacity-30">
                      {job.status === 'active' ? 'Close' : 'Activate'}
                    </button>
                    <button type="button" disabled={job.status === 'removed'} onClick={() => handleJobStatus(job.id, 'removed')} className="text-xs px-2 py-1 rounded border border-red-800/40 hover:border-red-600/60 text-red-400 disabled:opacity-30">Remove</button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </table>
      )}
    </DCard>
  );

  const PaymentsPage = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentsLoading || !paymentsSummary ? [1,2,3,4].map(i => <DCard key={i}><Skeleton className="h-14 bg-white/5" /></DCard>) : (
          <>
            <DCard><div className="text-[#666] text-xs uppercase tracking-wide mb-1">Paid Revenue</div><div className="text-white text-2xl font-bold">KES {paymentsSummary.total_revenue.toLocaleString()}</div></DCard>
            <DCard><div className="text-[#666] text-xs uppercase tracking-wide mb-1">This Month</div><div className="text-white text-2xl font-bold">KES {paymentsSummary.this_month_revenue.toLocaleString()}</div></DCard>
            <DCard><div className="text-[#666] text-xs uppercase tracking-wide mb-1">Transactions</div><div className="text-white text-2xl font-bold">{paymentsSummary.total_purchases}</div></DCard>
            <DCard><div className="text-[#666] text-xs uppercase tracking-wide mb-1">Profile Unlocks</div><div className="text-white text-2xl font-bold">{paymentsSummary.unlocks_count}</div></DCard>
          </>
        )}
      </div>
      <DCard>
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-medium">Transactions</div>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className={`${darkSelect} w-40`}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentsLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 bg-white/5" />)}</div> : (
          <table className="w-full">
            <thead><tr>{['Email','Amount (KES)','Package','Status','Date'].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
            <tbody>
              {payments.map(p => (
                <TR key={p.id}>
                  <TD>{p.user_email || '—'}</TD>
                  <TD><span className="text-white font-medium">{p.amount != null ? Number(p.amount).toLocaleString() : '—'}</span></TD>
                  <TD>{p.package_name || p.package_id || '—'}</TD>
                  <TD><Badge variant={p.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{p.status}</Badge></TD>
                  <TD>{fmt(p.purchase_date)}</TD>
                </TR>
              ))}
            </tbody>
          </table>
        )}
      </DCard>
    </div>
  );

  const FollowUpPage = () => (
    <div className="space-y-4">
      <DCard className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <PhoneCall className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-200 font-medium text-sm">Follow-up List</div>
            <div className="text-amber-300/60 text-xs mt-0.5">Users with incomplete or failed payments. Contact them to complete their purchase.</div>
          </div>
        </div>
      </DCard>

      {followUpLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <DCard key={i}><Skeleton className="h-16 bg-white/5" /></DCard>)}</div>
      ) : followUpPayments.length === 0 ? (
        <DCard className="text-center py-12">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <div className="text-white font-medium">All caught up!</div>
          <div className="text-[#555] text-sm mt-1">No pending or failed payments to follow up on.</div>
        </DCard>
      ) : (
        <div className="space-y-3">
          {followUpPayments.map(p => (
            <DCard key={p.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">{p.user_email || '—'}</span>
                    <Badge variant={p.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">{p.status}</Badge>
                  </div>
                  <div className="text-[#666] text-xs">
                    Package: <span className="text-[#aaa]">{p.package_name || p.package_id || '—'}</span>
                    {' · '}Amount: <span className="text-amber-400 font-medium">KES {p.amount != null ? Number(p.amount).toLocaleString() : '—'}</span>
                    {' · '}Date: <span className="text-[#aaa]">{fmt(p.purchase_date)}</span>
                  </div>
                  {p.user_id && <div className="text-[#444] text-xs font-mono">ID: {p.user_id}</div>}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5 items-end">
                  {p.user_email && (
                    <button type="button" onClick={() => copyToClipboard(p.user_email!, `email-${p.id}`)} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#444] text-[#aaa] hover:text-white transition-colors">
                      {copiedId === `email-${p.id}` ? <><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy email</>}
                    </button>
                  )}
                </div>
              </div>
              {/* Admin note */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[#555] text-xs mb-1 block">Note (internal)</label>
                  <input
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-[#444]"
                    placeholder="e.g. Called, will pay Friday…"
                    value={followUpNote[p.id] || ''}
                    onChange={e => setFollowUpNote(prev => ({ ...prev, [p.id]: e.target.value }))}
                  />
                </div>
              </div>
            </DCard>
          ))}
        </div>
      )}
    </div>
  );

  const MatchesPage = () => (
    <DCard>
      <SectionHeader title="Match Requests" />
      <p className="text-[#555] text-sm mb-4">Employers who paid KES 1,500 for top 2 candidate recommendations via WhatsApp.</p>
      {matchRequestsLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-white/5" />)}</div>
      ) : matchRequests.length === 0 ? (
        <div className="text-center py-10 text-[#555] text-sm">No match requests yet.</div>
      ) : (
        <div className="space-y-4">
          {matchRequests.map(mr => (
            <div key={mr.id} className="border border-[#272727] rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-white font-medium text-sm">{mr.job_title || `Job ${mr.job_id}`}</div>
                  <div className="text-[#666] text-xs">Employer: {mr.employer_name || mr.employer_id}{mr.employer_email && ` · ${mr.employer_email}`}</div>
                  {mr.employer_whatsapp && <div className="text-emerald-400 text-xs font-medium">WhatsApp: {mr.employer_whatsapp}</div>}
                  <div className="text-[#555] text-xs">Applicants: {mr.applicant_count ?? '—'} · {fmt(mr.created_at)}</div>
                  {mr.admin_notes && <div className="text-[#555] text-xs italic">Notes: {mr.admin_notes}</div>}
                </div>
                <Badge variant={mr.status === 'sent' ? 'default' : mr.status === 'cancelled' ? 'destructive' : 'outline'} className="shrink-0">{mr.status}</Badge>
              </div>
              {mr.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button type="button" disabled={resolvingMatchId === mr.id} onClick={() => handleResolveMatch(mr.id, 'sent')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 disabled:opacity-50">
                    {resolvingMatchId === mr.id ? <><RefreshCw className="h-3 w-3 animate-spin" /> Updating…</> : 'Mark as Sent'}
                  </button>
                  <button type="button" disabled={resolvingMatchId === mr.id} onClick={() => handleResolveMatch(mr.id, 'cancelled')} className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444] disabled:opacity-50">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DCard>
  );

  const SettingsPage = () => (
    <div className="space-y-4 max-w-md">
      <DCard>
        <div className="text-white font-medium mb-4 flex items-center gap-2"><Shield className="h-4 w-4" /> Account Security</div>
        <div className="space-y-3">
          <div>
            <label className="text-[#666] text-xs block mb-1">New Password</label>
            <div className="relative">
              <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#444] pr-10`} placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div>
            <label className="text-[#666] text-xs block mb-1">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#444] pr-10`} placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <button type="button" onClick={handlePasswordChange} disabled={isUpdatingPassword} className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {isUpdatingPassword ? <><RefreshCw className="h-4 w-4 animate-spin" /> Updating…</> : 'Update Password'}
          </button>
        </div>
      </DCard>
      <DCard className="border-red-900/40">
        <div className="text-red-400 font-medium mb-2 flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4" /> Danger Zone</div>
        <p className="text-[#555] text-xs mb-3">Deleting your administrator account is restricted. Contact system support.</p>
        <button type="button" disabled className="px-3 py-1.5 rounded-lg border border-red-900/40 text-red-700 text-xs opacity-50 cursor-not-allowed">Delete Account</button>
      </DCard>
    </div>
  );

  const pageMap: Record<string, React.ReactNode> = {
    overview: <OverviewPage />,
    users: <UsersPage />,
    agencies: <AgenciesPage />,
    jobs: <JobsPage />,
    payments: <PaymentsPage />,
    followup: <FollowUpPage />,
    matches: <MatchesPage />,
    settings: <SettingsPage />,
  };

  const activeNav = NAV.find(n => n.id === activePage);

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#111] overflow-hidden text-white">
      <Helmet><title>Admin — Domestic Connect</title></Helmet>

      {/* mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* sidebar mobile */}
      <div className={`fixed inset-y-0 left-0 z-30 w-60 transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-[#1e1e1e] bg-[#0d0d0d] shrink-0">
          <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded text-[#555] hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1">
            <span className="text-white text-sm font-medium">{activeNav?.label}</span>
          </div>
          {notifUnreadCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <Bell className="h-4 w-4" />{notifUnreadCount}
            </div>
          )}
        </header>

        {/* page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {pageMap[activePage]}
        </main>
      </div>

      {/* ── sheets & dialogs (unchanged) ──────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={o => { setSheetOpen(o); if (!o) setDetailUserId(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-[#0d0d0d] border-l border-[#1e1e1e] text-white">
          <SheetHeader>
            <SheetTitle className="text-white">User details</SheetTitle>
            <SheetDescription className="text-[#666]">{userDetail ? `${userDetail.first_name} ${userDetail.last_name}` : 'Loading…'}</SheetDescription>
          </SheetHeader>
          {detailLoading || !userDetail ? (
            <div className="mt-6 space-y-3"><Skeleton className="h-24 bg-white/5" /><Skeleton className="h-8 bg-white/5" /><Skeleton className="h-8 bg-white/5" /></div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="text-sm space-y-1.5 bg-[#1a1a1a] rounded-xl p-4">
                <div className="text-[#555]">Email: <span className="text-[#ccc]">{userDetail.email}</span></div>
                <div className="text-[#555]">Type: <Badge variant="outline" className="border-[#2a2a2a] text-[#888]">{userDetail.user_type}</Badge></div>
                <div className="text-[#555]">Phone: <span className="text-[#ccc]">{userDetail.phone_number || '—'}</span></div>
                <div className="text-[#555]">Admin: <span className={userDetail.is_admin ? 'text-amber-400' : 'text-[#ccc]'}>{userDetail.is_admin ? 'Yes' : 'No'}</span></div>
              </div>

              {userDetail.user_type === 'housegirl' && userDetail.profile?.housegirl && (
                <div className="space-y-3 bg-[#1a1a1a] rounded-xl p-4">
                  <h3 className="text-white font-medium text-sm">Housegirl profile</h3>
                  {userDetail.profile.housegirl.profile_photo_url && <img src={userDetail.profile.housegirl.profile_photo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                  <p className="text-[#aaa] text-sm whitespace-pre-wrap">{userDetail.profile.housegirl.bio || '—'}</p>
                  <div className="text-[#666] text-xs space-y-1">
                    <div>Skills: {(userDetail.profile.housegirl.skills || []).join(', ') || '—'}</div>
                    <div>Location: {userDetail.profile.housegirl.location || userDetail.profile.housegirl.current_location || '—'}</div>
                    <div>Salary: {userDetail.profile.housegirl.expected_salary ?? '—'}</div>
                    <div>Available: {userDetail.profile.housegirl.is_available !== false ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {userDetail.user_type === 'employer' && userDetail.profile?.employer && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-sm">
                  <h3 className="text-white font-medium mb-2">Employer</h3>
                  <div className="text-[#666]">Company: <span className="text-[#ccc]">{userDetail.profile.employer.company_name || '—'}</span></div>
                  <div className="text-[#666]">Location: <span className="text-[#ccc]">{userDetail.profile.employer.location || '—'}</span></div>
                </div>
              )}

              <div>
                <h3 className="text-white font-medium text-sm mb-2">Purchases</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userDetail.purchases?.length ? userDetail.purchases.map(p => (
                    <div key={p.id} className="bg-[#1a1a1a] rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">KES {p.amount != null ? Number(p.amount).toLocaleString() : '—'}</span>
                        <Badge variant={p.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{p.status}</Badge>
                      </div>
                      <div className="text-[#666] text-xs mt-1">{p.package_name || p.package_id} · {fmt(p.purchase_date)}</div>
                    </div>
                  )) : <p className="text-[#555] text-sm">No purchases</p>}
                </div>
              </div>

              {userDetail.user_type === 'housegirl' && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-medium text-sm">Edit profile</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[#555] text-xs">First name</label><Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className={darkInput} /></div>
                    <div><label className="text-[#555] text-xs">Last name</label><Input value={editLastName} onChange={e => setEditLastName(e.target.value)} className={darkInput} /></div>
                  </div>
                  <div><label className="text-[#555] text-xs">Phone</label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className={darkInput} /></div>
                  <div><label className="text-[#555] text-xs">Bio</label><Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className={darkInput} /></div>
                  <div><label className="text-[#555] text-xs">Location</label><Input value={editLocation} onChange={e => setEditLocation(e.target.value)} className={darkInput} /></div>
                  <div>
                    <label className="text-[#555] text-xs">Experience</label>
                    <Select value={editExperience} onValueChange={setEditExperience}>
                      <SelectTrigger className={darkSelect}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">{EXPERIENCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-[#555] text-xs">Expected salary</label><Input type="number" value={editSalary || ''} onChange={e => setEditSalary(Number(e.target.value) || 0)} className={darkInput} /></div>
                  <div>
                    <label className="text-[#555] text-xs">Accommodation</label>
                    <Select value={editAccommodation} onValueChange={setEditAccommodation}>
                      <SelectTrigger className={darkSelect}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">{ACCOMMODATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-[#555] text-xs">Skills (comma-separated)</label><Input value={editSkills} onChange={e => setEditSkills(e.target.value)} className={darkInput} /></div>
                  <div className="flex items-center justify-between"><span className="text-[#aaa] text-sm">Available</span><Switch checked={editAvailable} onCheckedChange={setEditAvailable} /></div>
                  <div className="flex items-center justify-between"><span className="text-[#aaa] text-sm">Profile complete</span><Switch checked={editProfileComplete} onCheckedChange={setEditProfileComplete} /></div>
                  {editSaveError && <p className="text-red-400 text-sm">{editSaveError}</p>}
                  <button type="button" onClick={handleSaveHousegirlProfile} disabled={savingProfile} className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50">
                    {savingProfile ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1e1e1e]">
                <button type="button" onClick={() => handleToggleUserStatus(userDetail.id)} className="px-3 py-1.5 text-sm rounded-lg border border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444]">
                  {userDetail.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" onClick={() => handlePromoteUser(userDetail.id, !userDetail.is_admin)} className="px-3 py-1.5 text-sm rounded-lg border border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444]">
                  {userDetail.is_admin ? 'Revoke admin' : 'Make admin'}
                </button>
                <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="px-3 py-1.5 text-sm rounded-lg border border-red-900/40 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#272727]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this user?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">Removes Firestore doc, role profiles, purchases, and Firebase Auth account. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="bg-transparent border-[#2a2a2a] text-[#aaa] hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-red-600 hover:bg-red-700">{deleting ? 'Deleting…' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addUserOpen} onOpenChange={open => { setAddUserOpen(open); if (!open) { setNewUserEmail(''); setNewUserPassword(''); setNewUserFirst(''); setNewUserLast(''); setNewUserPhone(''); setNewUserType('employer'); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-[#272727]">
          <DialogHeader>
            <DialogTitle className="text-white">Add user</DialogTitle>
            <DialogDescription className="text-[#666]">Creates Firebase Auth and Firestore records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {[['Email','email','email',newUserEmail,setNewUserEmail],['Initial password','password','new-password',newUserPassword,setNewUserPassword]].map(([label,type,auto,val,set]) => (
              <div key={label as string}><label className="text-[#666] text-sm block mb-1">{label}</label><Input type={type as string} autoComplete={auto as string} value={val as string} onChange={e => (set as (v:string)=>void)(e.target.value)} className={darkInput} /></div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[#666] text-sm block mb-1">First name</label><Input value={newUserFirst} onChange={e => setNewUserFirst(e.target.value)} className={darkInput} /></div>
              <div><label className="text-[#666] text-sm block mb-1">Last name</label><Input value={newUserLast} onChange={e => setNewUserLast(e.target.value)} className={darkInput} /></div>
            </div>
            <div><label className="text-[#666] text-sm block mb-1">Phone (optional)</label><Input value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="+254…" className={darkInput} /></div>
            <div>
              <label className="text-[#666] text-sm block mb-1">Role</label>
              <Select value={newUserType} onValueChange={v => setNewUserType(v as 'employer' | 'housegirl' | 'agency')}>
                <SelectTrigger className={darkSelect}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="housegirl">Housegirl</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} disabled={creatingUser} className="border-[#2a2a2a] text-[#aaa] bg-transparent hover:bg-white/5">Cancel</Button>
              <Button type="button" onClick={handleCreateUser} disabled={creatingUser} className="bg-white text-black hover:bg-white/90">{creatingUser ? 'Creating…' : 'Create user'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-[#1a1a1a] border-[#272727]">
          <DialogHeader>
            <DialogTitle className="text-white">Assign roles</DialogTitle>
            <DialogDescription className="text-[#666]">Users with no role — pick a role and save per user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {usersWithoutRoles.map(u => (
              <div key={u.id} className="flex flex-col sm:flex-row gap-2 sm:items-center border-b border-[#1e1e1e] pb-3">
                <div className="flex-1 text-sm"><div className="text-white font-medium">{u.first_name} {u.last_name}</div><div className="text-[#555]">{u.email}</div></div>
                <Select value={roleSelections[u.id] || 'employer'} onValueChange={v => setRoleSelections(prev => ({ ...prev, [u.id]: v as 'employer' | 'housegirl' | 'agency' }))}>
                  <SelectTrigger className={`${darkSelect} w-full sm:w-[160px]`}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="housegirl">Housegirl</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => handleAssignRole(u.id)} disabled={savingRoleId === u.id} className="bg-white text-black hover:bg-white/90">{savingRoleId === u.id ? 'Saving…' : 'Save'}</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!verifyAgencyTarget} onOpenChange={open => !open && setVerifyAgencyTarget(null)}>
        <DialogContent className="bg-[#1a1a1a] border-[#272727]">
          <DialogHeader>
            <DialogTitle className="text-white">Verify agency</DialogTitle>
            <DialogDescription className="text-[#666]">Choose the operator user to link to this marketplace listing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[#666]">Operator account</Label>
              <Select value={verifyOperatorId} onValueChange={setVerifyOperatorId}>
                <SelectTrigger className={darkSelect}><SelectValue placeholder="Select agency user" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  {verifyOperatorSelectOptions.map(u => <SelectItem key={u.id} value={u.id}>{u.email} — {u.first_name} {u.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVerifyAgencyTarget(null)} className="border-[#2a2a2a] text-[#aaa] bg-transparent">Cancel</Button>
              <Button onClick={async () => {
                const operatorId = verifyOperatorId || verifyAgencyTarget?.dashboard_user_id || '';
                if (!verifyAgencyTarget || !operatorId) { toast({ title: 'Select an operator', variant: 'destructive' }); return; }
                const ok = await handleVerifyAgency(verifyAgencyTarget.id, 'verified', operatorId);
                if (ok) setVerifyAgencyTarget(null);
              }} className="bg-white text-black hover:bg-white/90">Verify and link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
