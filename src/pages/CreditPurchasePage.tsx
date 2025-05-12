
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreditCard, Loader2, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import versiumService, { CreditPackage } from '@/services/versiumService';

const formatMoney = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

const CreditPurchasePage = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [creditsToBuy, setCreditsToBuy] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedPackage = creditPackages.find(pkg => pkg.id === selectedPackageId);
  const totalCost = selectedPackage ? creditsToBuy * selectedPackage.price_per_credit_usd_cents / 100 : 0;
  const isValidPurchase = selectedPackage && creditsToBuy >= (selectedPackage?.min_credits_to_purchase || 0);
  
  useEffect(() => {
    loadCreditPackages();
  }, [profile]);
  
  useEffect(() => {
    if (selectedPackage) {
      setCreditsToBuy(selectedPackage.min_credits_to_purchase);
    }
  }, [selectedPackage]);
  
  const loadCreditPackages = async () => {
    setIsLoading(true);
    try {
      const packages = await versiumService.getCreditPackages();
      
      // Filter packages based on user type
      const filteredPackages = packages.filter(pkg => {
        if (!pkg.user_type_restriction) return true;
        if (pkg.user_type_restriction === 'stride_crm_user') return profile?.is_stride_crm_user;
        if (pkg.user_type_restriction === 'non_stride_crm_user') return !profile?.is_stride_crm_user;
        return true;
      });
      
      setCreditPackages(filteredPackages);
      
      // Select the first package by default if any are available
      if (filteredPackages.length > 0) {
        setSelectedPackageId(filteredPackages[0].id);
        setCreditsToBuy(filteredPackages[0].min_credits_to_purchase);
      }
    } catch (error) {
      toast.error('Failed to load credit packages');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePurchase = async () => {
    if (!selectedPackage || !isValidPurchase) return;
    
    setIsProcessing(true);
    
    try {
      const result = await versiumService.purchaseCredits({
        package_id: selectedPackageId!,
        number_of_credits_to_purchase: creditsToBuy
      });
      
      await refreshProfile();
      
      toast.success(`Successfully purchased ${result.credits_added.toLocaleString()} credits!`);
      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (errorMessage.includes('User type restriction')) {
        errorMessage = 'This package is only available to Stride CRM users. Update your profile to continue.';
      } else if (errorMessage.includes('Missing Stride Location ID')) {
        errorMessage = 'Please update your profile with a valid Stride Location ID to purchase this package.';
      }
      
      toast.error(errorMessage || 'Failed to purchase credits');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Purchase Credits</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select a Credit Package</CardTitle>
                <CardDescription>
                  Choose the credit package that best fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : creditPackages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No credit packages available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <Label htmlFor="packageSelect">Credit Package</Label>
                      <Select
                        value={selectedPackageId?.toString()}
                        onValueChange={(value) => setSelectedPackageId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          {creditPackages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              <div className="flex flex-col">
                                <span>{pkg.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${formatMoney(pkg.price_per_credit_usd_cents)}/credit • Min: {pkg.min_credits_to_purchase.toLocaleString()} credits
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedPackage && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="packageDescription">Package Details</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPackage.description || 'No description available'}
                          </p>
                          <div className="mt-2 flex gap-8">
                            <div>
                              <span className="text-sm font-medium">Price per credit</span>
                              <p className="text-lg font-semibold">${formatMoney(selectedPackage.price_per_credit_usd_cents)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Minimum purchase</span>
                              <p className="text-lg font-semibold">{selectedPackage.min_credits_to_purchase.toLocaleString()} credits</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Label htmlFor="creditsToBuy">Amount to Purchase</Label>
                          <div className="flex items-center gap-4 mt-1">
                            <Input 
                              id="creditsToBuy"
                              type="number"
                              min={selectedPackage.min_credits_to_purchase}
                              step={100}
                              value={creditsToBuy}
                              onChange={(e) => setCreditsToBuy(parseInt(e.target.value) || 0)}
                              className="max-w-[200px]"
                            />
                            <span>credits</span>
                          </div>
                          {creditsToBuy < selectedPackage.min_credits_to_purchase && (
                            <p className="text-sm text-red-500 mt-1">
                              Minimum purchase is {selectedPackage.min_credits_to_purchase.toLocaleString()} credits
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">Total Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
                <Button 
                  onClick={handlePurchase}
                  disabled={!isValidPurchase || isProcessing || isLoading}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Demonstration Mode</h3>
              </div>
              <p className="text-sm text-amber-700">
                This is a demonstration of the credit purchase flow. In a production environment,
                this would be connected to a payment processor like Stripe. For now, credits
                are added to your account immediately without any actual charges.
              </p>
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
                <CardDescription>Your available credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold">
                    {profile?.credits.toLocaleString() || 0}
                  </p>
                  <p className="text-muted-foreground">credits</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Stride CRM Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className={`font-semibold ${profile?.is_stride_crm_user ? 'text-green-600' : 'text-amber-600'}`}>
                      {profile?.is_stride_crm_user ? 'Stride CRM User' : 'Non-Stride User'}
                    </p>
                  </div>
                  
                  {profile?.is_stride_crm_user && (
                    <div>
                      <p className="text-sm font-medium">Location ID</p>
                      <p className="font-mono bg-muted rounded px-2 py-1 text-sm">
                        {profile?.stride_location_id || 'Not provided'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreditPurchasePage;
