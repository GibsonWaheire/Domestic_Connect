import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { crossEntityApi, agenciesApi, agencyPortalApi, DashboardData } from '@/lib/api';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { LogOut, Shield, Users, Briefcase, Building2, Settings, Loader2, Eye, EyeOff } from 'lucide-react';

type MarketplaceRow = {
  id?: string;
  name?: string;
  verification_status?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  location?: string;
  services?: string[];
  license_number?: string;
};

const AgencyDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [dashLoading, setDashLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [marketplace, setMarketplace] = useState<MarketplaceRow | null>(null);
  const [profileDesc, setProfileDesc] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'agency' && !user.is_admin) {
        toast({ title: 'Access denied', description: 'This area is for agencies only.', variant: 'destructive' });
        if (user.user_type === 'housegirl') navigate('/housegirl-dashboard');
        else if (user.user_type === 'employer') navigate('/employer-dashboard');
        else navigate('/');
      }
    }
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [loading, user, navigate]);

  const loadData = useCallback(async () => {
    if (!user || (user.user_type !== 'agency' && !user.is_admin)) return;
    setDashLoading(true);
    setContextLoading(true);
    try {
      const [dash, ctx] = await Promise.all([
        crossEntityApi.getDashboardData(),
        user.user_type === 'agency' ? agencyPortalApi.getContext() : Promise.resolve(null),
      ]);
      setDashboard(dash);
      if (ctx?.marketplace_agency) {
        const m = ctx.marketplace_agency as MarketplaceRow;
        setMarketplace(m);
        setProfileDesc(String(m.description ?? ''));
        setProfileWebsite(String(m.website ?? ''));
        setProfilePhone(String(m.contact_phone ?? ''));
        setProfileEmail(String(m.contact_email ?? ''));
      } else {
        setMarketplace(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load dashboard';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      if (msg.toLowerCase().includes('agency access') || msg.includes('403')) {
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setDashLoading(false);
      setContextLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && user && (user.user_type === 'agency' || user.is_admin)) {
      void loadData();
    }
  }, [loading, user, loadData]);

  const handleSaveProfile = async () => {
    const mid = marketplace?.id;
    if (!mid) {
      toast({ title: 'Nothing to save', description: 'No marketplace profile linked.', variant: 'destructive' });
      return;
    }
    setSavingProfile(true);
    try {
      await agenciesApi.update(mid, {
        description: profileDesc,
        website: profileWebsite,
        contact_phone: profilePhone,
        contact_email: profileEmail,
      });
      toast({ title: 'Saved', description: 'Marketplace profile updated.' });
      await loadData();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
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
    setPasswordBusy(true);
    try {
      await FirebaseAuthService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your password was changed.' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update password.';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    } finally {
      setPasswordBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (user.user_type !== 'agency' && !user.is_admin) {
    return null;
  }

  const stats = dashboard?.stats ?? {};
  const clients = dashboard?.available_data?.clients ?? [];
  const workers = dashboard?.available_data?.workers ?? [];
  const employers = dashboard?.available_data?.all_employers ?? [];
  const displayName = marketplace?.name || `${user.first_name} ${user.last_name}`.trim() || 'Agency';
  const verified = marketplace?.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-slate-900 truncate">{displayName}</h1>
                {verified ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut('/admin/login')}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {dashLoading || contextLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Clients</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    {stats.total_clients ?? clients.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Workers</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-400" />
                    {stats.total_workers ?? workers.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Employers (browse pool)</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-400" />
                    {stats.available_employers ?? employers.length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workers">Workers</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="profile">Marketplace profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>Recent lists (first rows)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Workers</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Hire date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workers.slice(0, 5).map((w) => (
                            <TableRow key={w.id}>
                              <TableCell>{w.name}</TableCell>
                              <TableCell>{w.verification_status}</TableCell>
                              <TableCell>{w.hire_date}</TableCell>
                            </TableRow>
                          ))}
                          {!workers.length && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-slate-500">
                                No workers yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Clients</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.slice(0, 5).map((c) => (
                            <TableRow key={c.id}>
                              <TableCell>{c.name}</TableCell>
                              <TableCell>{c.company_name}</TableCell>
                              <TableCell>{c.placement_status}</TableCell>
                            </TableRow>
                          ))}
                          {!clients.length && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-slate-500">
                                No clients yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Hire date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workers.map((w) => (
                          <TableRow key={w.id}>
                            <TableCell>{w.name}</TableCell>
                            <TableCell>{w.verification_status}</TableCell>
                            <TableCell>{w.hire_date}</TableCell>
                          </TableRow>
                        ))}
                        {!workers.length && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-slate-500">
                              No workers.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clients" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.email}</TableCell>
                            <TableCell>{c.company_name}</TableCell>
                            <TableCell>{c.placement_status}</TableCell>
                          </TableRow>
                        ))}
                        {!clients.length && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-slate-500">
                              No clients.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketplace profile</CardTitle>
                    <CardDescription>
                      Summary of your verified listing.{' '}
                      <Link to="/agency-marketplace" className="text-primary underline">
                        View public marketplace
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!marketplace ? (
                      <p className="text-slate-500">No marketplace row linked to this operator account.</p>
                    ) : (
                      <>
                        <div className="grid gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Name: </span>
                            {marketplace.name}
                          </div>
                          <div>
                            <span className="text-slate-500">License: </span>
                            {marketplace.license_number ?? '—'}
                          </div>
                          <div>
                            <span className="text-slate-500">Location: </span>
                            {marketplace.location ?? '—'}
                          </div>
                          <div>
                            <span className="text-slate-500">Status: </span>
                            {marketplace.verification_status}
                          </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t">
                          <Label htmlFor="ag-desc">Description</Label>
                          <Textarea
                            id="ag-desc"
                            value={profileDesc}
                            onChange={(e) => setProfileDesc(e.target.value)}
                            rows={4}
                          />
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="ag-email">Contact email</Label>
                              <Input id="ag-email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="ag-phone">Contact phone</Label>
                              <Input id="ag-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="ag-web">Website</Label>
                            <Input id="ag-web" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)} />
                          </div>
                          <Button onClick={() => void handleSaveProfile()} disabled={savingProfile}>
                            {savingProfile ? 'Saving…' : 'Save changes'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Password
                    </CardTitle>
                    <CardDescription>Update your sign-in password (Firebase account).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="npw">New password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="npw"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                          onClick={() => setShowNewPassword((v) => !v)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cpw">Confirm password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="cpw"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button onClick={() => void handlePasswordChange()} disabled={passwordBusy}>
                      {passwordBusy ? 'Updating…' : 'Update password'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default AgencyDashboard;
