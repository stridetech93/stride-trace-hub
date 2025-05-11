
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Loader2 } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 100,
    price: 19.99,
    description: 'Perfect for small projects and occasional lookups',
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 500,
    price: 89.99,
    description: 'Ideal for regular use with significant cost savings',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000,
    price: 299.99,
    description: 'Best value for businesses with high volume needs',
  }
];

const Credits = () => {
  const { profile, refreshProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const handlePurchase = async (packageId: string) => {
    setIsProcessing(packageId);
    
    // Simulate payment processing
    // In a real implementation, this would integrate with Stripe or another payment processor
    setTimeout(() => {
      toast.success('This is a demonstration. In production, this would integrate with a payment gateway.');
      setIsProcessing(null);
    }, 2000);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{pkg.name} Package</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center">
                  <span className="text-4xl font-bold">{pkg.credits}</span>
                  <span className="text-lg"> credits</span>
                  <p className="text-2xl font-semibold mt-2">${pkg.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${(pkg.price / pkg.credits).toFixed(4)} per credit
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing !== null}
                  onClick={() => handlePurchase(pkg.id)}
                >
                  {isProcessing === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
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
