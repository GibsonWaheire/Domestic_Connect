import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminApi, AdminDashboardStats, AdminUser, AdminAgency } from '@/lib/api';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { Users, Building2, DollarSign, TrendingUp, RefreshCw, Shield, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [agencySearch, setAgencySearch] = useState('');
  const [agencyStatusFilter, setAgencyStatusFilter] = useState('');

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, agenciesData] = await Promise.all([
        adminApi.getDashboardStats(token!),
        adminApi.getUsers(token!),
        adminApi.getAgencies(token!)
      ]);
      
      setStats(statsData);
      setUsers(usersData.users);
      setAgencies(agenciesData.agencies);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (syncType: string = 'all') => {
    try {
      setSyncing(true);
      await adminApi.syncData(token!, syncType);
      toast({
        title: "Success",
        description: "Data sync completed successfully",
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(token!, userId);
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleVerifyAgency = async (agencyId: string, status: string) => {
    try {
      await adminApi.verifyAgency(token!, agencyId, status);
      toast({
        title: "Success",
        description: `Agency ${status} successfully`,
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying agency:', error);
      toast({
        title: "Error",
        description: "Failed to verify agency",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !userSearch || 
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.last_name.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesType = !userTypeFilter || user.user_type === userTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = !agencySearch || 
      agency.name.toLowerCase().includes(agencySearch.toLowerCase()) ||
      agency.license_number.toLowerCase().includes(agencySearch.toLowerCase()) ||
      agency.contact_email.toLowerCase().includes(agencySearch.toLowerCase());
    
    const matchesStatus = !agencyStatusFilter || agency.verification_status === agencyStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Domestic Connect platform</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleSync('all')}
                disabled={syncing}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync All Data</span>
              </Button>
              <Button
                onClick={() => handleSync('users')}
                disabled={syncing}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Sync Users</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.overview.monthly_users} this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.active_users}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Agencies</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.agencies.verified_agencies}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.agencies.pending_verification} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.payments.total_revenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.payments.total_purchases} purchases
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their account status
                </CardDescription>
                <div className="flex space-x-4 mt-4">
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="employer">Employers</SelectItem>
                      <SelectItem value="housegirl">Housegirls</SelectItem>
                      <SelectItem value="agency">Agencies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.user_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {user.first_name} {user.last_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <strong>Email:</strong> {user.email}
                                  </div>
                                  <div>
                                    <strong>Type:</strong> {user.user_type}
                                  </div>
                                  <div>
                                    <strong>Phone:</strong> {user.phone_number || 'N/A'}
                                  </div>
                                  <div>
                                    <strong>Profile:</strong> {user.has_profile ? 'Yes' : 'No'}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Management</CardTitle>
                <CardDescription>
                  Manage agency verification and status
                </CardDescription>
                <div className="flex space-x-4 mt-4">
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
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
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
                              agency.verification_status === 'verified' ? 'default' :
                              agency.verification_status === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {agency.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{agency.rating.toFixed(1)}</TableCell>
                        <TableCell>{agency.successful_placements}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {agency.verification_status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyAgency(agency.id, 'verified')}
                                >
                                  Verify
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyAgency(agency.id, 'rejected')}
                                >
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

