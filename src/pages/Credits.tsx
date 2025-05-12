
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import versiumService, { CreditPackage } from '@/services/versiumService';

const Credits = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadCreditPackages();
  }, [profile]);
  
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
    } catch (error) {
      toast.error('Failed to load credit packages');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPrice = (cents: number): string => {
    return (cents / 100).toFixed(2);
  };
  
  const handleViewDetails = () => {
    navigate('/purchase-credits');
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">Purchase Credits</h1>
        <p className="text-muted-foreground mb-8">
          Credits are used for data enrichment operations. Each successful API call costs 1 credit.
        </p>
        
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Current Balance</h2>
              <p className="text-3xl font-bold text-primary">{profile?.credits || 0} credits</p>
            </div>
            <Button onClick={refreshProfile} variant="outline">Refresh Balance</Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-center">
                    <span className="text-lg">Starting at </span>
                    <span className="text-4xl font-bold">{pkg.min_credits_to_purchase.toLocaleString()}</span>
                    <span className="text-lg"> credits</span>
                    <p className="text-2xl font-semibold mt-2">${formatPrice(pkg.price_per_credit_usd_cents)}/credit</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum purchase: ${(pkg.min_credits_to_purchase * pkg.price_per_credit_usd_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleViewDetails}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {profile && !profile.is_stride_crm_user && (
          <div className="mt-8 p-6 border-2 border-green-100 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Save with Stride CRM!</h3>
            <p className="mb-4">
              Stride CRM users get exclusive discounts on credit packages. Connect your account to save up to 50% on credits.
            </p>
            <Button 
              variant="outline" 
              className="border-green-600 text-green-700 hover:bg-green-100"
              onClick={() => navigate('/profile')}
            >
              Update Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-semibold mb-2">Note:</h3>
          <p>
            This is a demonstration page. In a production environment, 
            this would be connected to a payment processor like Stripe.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
