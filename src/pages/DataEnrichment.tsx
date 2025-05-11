
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import versiumService from '@/services/versiumService';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Form schema for contact append
const contactAppendSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal(''))
}).refine(data => {
  // At least one field must be filled
  return Object.values(data).some(val => val && val.length > 0);
}, { message: "At least one field is required" });

// Form schema for demographic append
const demographicAppendSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
}).refine(data => {
  // At least one field must be filled
  return Object.values(data).some(val => val && val.length > 0);
}, { message: "At least one field is required" });

type ContactAppendFormValues = z.infer<typeof contactAppendSchema>;
type DemographicAppendFormValues = z.infer<typeof demographicAppendSchema>;

const DataEnrichment = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Form for Contact Append
  const contactForm = useForm<ContactAppendFormValues>({
    resolver: zodResolver(contactAppendSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    }
  });
  
  // Form for Demographic Append
  const demographicForm = useForm<DemographicAppendFormValues>({
    resolver: zodResolver(demographicAppendSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: ''
    }
  });
  
  // Handle Contact Append form submission
  const onContactSubmit = async (values: ContactAppendFormValues) => {
    if (!profile?.credits || profile.credits <= 0) {
      toast.error('Insufficient credits. Please purchase more credits.');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await versiumService.contactAppend({
        email: values.email || undefined,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zip: values.zip || undefined
      });
      
      setResults(result);
      refreshProfile();
      toast.success('Data enrichment completed successfully');
    } catch (error: any) {
      console.error('Contact append error:', error);
      // Toast error is handled in the service
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Demographic Append form submission
  const onDemographicSubmit = async (values: DemographicAppendFormValues) => {
    if (!profile?.credits || profile.credits <= 0) {
      toast.error('Insufficient credits. Please purchase more credits.');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await versiumService.demographicAppend({
        email: values.email || undefined,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zip: values.zip || undefined,
        phone: values.phone || undefined
      });
      
      setResults(result);
      refreshProfile();
      toast.success('Data enrichment completed successfully');
    } catch (error: any) {
      console.error('Demographic append error:', error);
      // Toast error is handled in the service
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Data Enrichment</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="contact" className="flex-1">Contact Append</TabsTrigger>
                <TabsTrigger value="demographic" className="flex-1">Demographic Append</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contact" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Append</CardTitle>
                    <CardDescription>
                      Enrich your data with contact information using Versium's API.
                      Each successful query costs 1 credit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={contactForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seattle" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="WA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={contactForm.control}
                            name="zip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="98101" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : 'Enrich Data'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="demographic" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Demographic Append</CardTitle>
                    <CardDescription>
                      Enrich your data with demographic information using Versium's API.
                      Each successful query costs 1 credit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...demographicForm}>
                      <form onSubmit={demographicForm.handleSubmit(onDemographicSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={demographicForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seattle" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="WA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="zip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="98101" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={demographicForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="2065551234" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : 'Enrich Data'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Enriched data will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : results ? (
                  <pre className="p-4 bg-slate-100 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    No results yet. Submit a query to see enriched data.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataEnrichment;
