
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Settings, Save, User } from 'lucide-react';

const SettingsPage = () => {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isStrideUser, setIsStrideUser] = useState(profile?.is_stride_crm_user || false);
  const [strideLocationId, setStrideLocationId] = useState(profile?.stride_location_id || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile({
        full_name: fullName,
        is_stride_crm_user: isStrideUser,
        stride_location_id: isStrideUser ? strideLocationId : null,
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between max-w-md">
                      <div>
                        <Label htmlFor="stride-user" className="font-medium">
                          Stride CRM User
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Identify yourself as a Stride CRM user for special pricing
                        </p>
                      </div>
                      <Switch 
                        id="stride-user" 
                        checked={isStrideUser}
                        onCheckedChange={setIsStrideUser}
                      />
                    </div>
                  </div>
                  
                  {isStrideUser && (
                    <div>
                      <Label htmlFor="strideLocationId">Stride Location ID</Label>
                      <Input 
                        id="strideLocationId" 
                        value={strideLocationId} 
                        onChange={(e) => setStrideLocationId(e.target.value)}
                        placeholder="Enter your Stride Location ID"
                        className="max-w-md"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your Stride Location ID can be found in your Stride CRM account settings
                      </p>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Password changes and additional security settings are managed through your email provider.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
