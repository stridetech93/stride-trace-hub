
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ExternalLink, Loader2, UserCog } from 'lucide-react';
import versiumService from '@/services/versiumService';

const ProfilePage = () => {
  const { profile, refreshProfile } = useAuth();
  const [isStrideCrmUser, setIsStrideCrmUser] = useState(false);
  const [strideLocationId, setStrideLocationId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsStrideCrmUser(profile.is_stride_crm_user);
      setStrideLocationId(profile.stride_location_id || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isStrideCrmUser && !strideLocationId) {
      toast.error('Please provide your Stride Location ID');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await versiumService.updateUserStrideInfo(
        isStrideCrmUser, 
        isStrideCrmUser ? strideLocationId : null
      );
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <UserCog className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                View and update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={profile?.full_name || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to update your name
                </p>
              </div>
            </CardContent>
          </Card>
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Stride CRM Integration</CardTitle>
                <CardDescription>
                  Connect your Stride CRM account to receive discounted rates on credit packages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isStrideCrmUser" 
                    checked={isStrideCrmUser}
                    onCheckedChange={(checked) => {
                      setIsStrideCrmUser(checked === true);
                      if (checked !== true) {
                        setStrideLocationId('');
                      }
                    }}
                  />
                  <Label htmlFor="isStrideCrmUser" className="font-medium cursor-pointer">
                    I am a Stride CRM user
                  </Label>
                </div>
                
                {isStrideCrmUser && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="strideLocationId">Stride Location ID</Label>
                    <Input
                      id="strideLocationId"
                      placeholder="Enter your Location ID"
                      value={strideLocationId}
                      onChange={(e) => setStrideLocationId(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find your Location ID in your Stride CRM account settings
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-1 text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href="https://stride.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm underline hover:text-blue-800"
                    >
                      Purchase Stride CRM
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href="https://stride.io/login" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm underline hover:text-blue-800"
                    >
                      Login to Stride CRM
                    </a>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
