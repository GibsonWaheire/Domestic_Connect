import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Shield, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface SettingsProps {
  stats: {
    activeJobs: number;
  };
}

export const Settings = ({ stats }: SettingsProps) => {
  const { user, signOut } = useAuth();
  const { showSuccessNotification } = useNotificationActions();

  const handleSignOut = () => {
    signOut();
    showSuccessNotification(
      "Signed Out", 
      "You have been successfully signed out."
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">First Name</label>
                <Input 
                  defaultValue={user?.first_name || ''}
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</label>
                <Input 
                  defaultValue={user?.last_name || ''}
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                <Input 
                  defaultValue={user?.email || ''}
                  type="email"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                <Input 
                  defaultValue="+254700123456"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <Input 
                  defaultValue="Nairobi, Kenya"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter your location"
                />
              </div>
            </div>
                                <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        showSuccessNotification(
                          "Profile Updated", 
                          "Your profile information has been saved successfully."
                        );
                      }}
                    >
                      Save Changes
                    </Button>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <span>Account Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Current Password</label>
                <Input 
                  type="password"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                <Input 
                  type="password"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm New Password</label>
                <Input 
                  type="password"
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex items-end">
                                        <Button 
                          variant="outline"
                          className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          onClick={() => {
                            showSuccessNotification(
                              "Password Changed", 
                              "Your password has been updated successfully."
                            );
                          }}
                        >
                          Change Password
                        </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Type</span>
              <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm font-medium">January 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Login</span>
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jobs Posted</span>
              <span className="text-sm font-medium">{stats.activeJobs}</span>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Sign Out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Sign out of your account. You'll need to sign in again to access your dashboard.
            </p>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
