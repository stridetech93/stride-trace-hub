import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Database } from '@/types/supabase';

interface ContactAppendRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface DemographicAppendRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

interface IndividualSearchRequest {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  email?: string;
  phone?: string;
}

interface PropertySearchRequest {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  owner?: string;
}

interface PhoneSearchRequest {
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface SearchResult {
  id: string;
  data: Record<string, any>[];
  createdAt: Date;
  name: string;
  type: 'contact-append' | 'demographic-append' | 'batch-upload' | 'individual-search' | 'property-search' | 'phone-search';
  recordCount: number;
}

export type CreditPackage = Database['public']['Tables']['credit_packages']['Row'];

interface PurchaseCreditsRequest {
  package_id: number;
  number_of_credits_to_purchase: number;
}

interface PurchaseCreditsResponse {
  success: boolean;
  credits_added: number;
  new_balance: number;
  total_cost_cents: number;
  total_cost_dollars: string;
}

interface StripeCheckoutRequest {
  packageId: number;
  quantity: number;
}

interface StripeCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

const versiumService = {
  async checkCredits(): Promise<number> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'checkCredits',
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data.credits;
    } catch (error: any) {
      toast.error(`Failed to check credits: ${error.message}`);
      console.error('Error checking credits:', error);
      return 0;
    }
  },
  
  async contactAppend(request: ContactAppendRequest) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'contactAppend',
          data: request,
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else {
        toast.error(`Error performing contact append: ${error.message}`);
      }
      console.error('Error performing contact append:', error);
      throw error;
    }
  },
  
  async demographicAppend(request: DemographicAppendRequest) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'demographicAppend',
          data: request,
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else {
        toast.error(`Error performing demographic append: ${error.message}`);
      }
      console.error('Error performing demographic append:', error);
      throw error;
    }
  },
  
  async searchIndividual(request: IndividualSearchRequest) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'searchIndividual',
          data: request,
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Store the results for later access
      if (data) {
        const searchResultId = await this.storeSearchResult({
          type: 'individual-search',
          name: `Individual Search: ${request.firstName || ''} ${request.lastName || ''}`.trim() || 'Unknown',
          data: Array.isArray(data) ? data : [data],
          recordCount: Array.isArray(data) ? data.length : 1
        });
      }
      
      return data;
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else {
        toast.error(`Error performing individual search: ${error.message}`);
      }
      console.error('Error performing individual search:', error);
      throw error;
    }
  },
  
  async searchProperty(request: PropertySearchRequest) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'searchProperty',
          data: request,
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Store the results for later access
      if (data) {
        const address = [request.address, request.city, request.state, request.zip].filter(Boolean).join(', ');
        const searchResultId = await this.storeSearchResult({
          type: 'property-search',
          name: `Property Search: ${address || 'Unknown'}`,
          data: Array.isArray(data) ? data : [data],
          recordCount: Array.isArray(data) ? data.length : 1
        });
      }
      
      return data;
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else {
        toast.error(`Error performing property search: ${error.message}`);
      }
      console.error('Error performing property search:', error);
      throw error;
    }
  },
  
  async searchPhone(request: PhoneSearchRequest) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'searchPhone',
          data: request,
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Store the results for later access
      if (data) {
        const searchResultId = await this.storeSearchResult({
          type: 'phone-search',
          name: `Phone Search: ${request.phone || 'Unknown'}`,
          data: Array.isArray(data) ? data : [data],
          recordCount: Array.isArray(data) ? data.length : 1
        });
      }
      
      return data;
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        toast.error('Insufficient credits. Please purchase more credits to continue.');
      } else {
        toast.error(`Error performing phone search: ${error.message}`);
      }
      console.error('Error performing phone search:', error);
      throw error;
    }
  },
  
  async processDataBatch(data: Record<string, any>[], mappings: {source: string, target: string}[]) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      // Store the results for later access
      const searchResultId = await this.storeSearchResult({
        type: 'batch-upload',
        name: `Batch Upload ${new Date().toLocaleString()}`,
        data: data,
        recordCount: data.length
      });
      
      return data;
    } catch (error: any) {
      toast.error(`Error storing search results: ${error.message}`);
      console.error('Error storing search results:', error);
      return data;
    }
  },
  
  async storeSearchResult(result: Omit<SearchResult, 'id' | 'createdAt'>): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'storeSearchResult',
          userId: session.user.id,
          result: result
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data.id;
    } catch (error: any) {
      toast.error(`Error storing search result: ${error.message}`);
      console.error('Error storing search result:', error);
      throw error;
    }
  },
  
  async getSearchResults(): Promise<SearchResult[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'getSearchResults',
          userId: session.user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data.results;
    } catch (error: any) {
      toast.error(`Error retrieving search results: ${error.message}`);
      console.error('Error retrieving search results:', error);
      return [];
    }
  },
  
  async getSearchResultById(id: string): Promise<SearchResult | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('versium-service', {
        body: {
          action: 'getSearchResultById',
          userId: session.user.id,
          resultId: id
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data.result;
    } catch (error: any) {
      toast.error(`Error retrieving search result: ${error.message}`);
      console.error('Error retrieving search result:', error);
      return null;
    }
  },

  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_per_credit_usd_cents', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      toast.error(`Error retrieving credit packages: ${error.message}`);
      console.error('Error retrieving credit packages:', error);
      return [];
    }
  },
  
  async purchaseCredits(request: PurchaseCreditsRequest): Promise<PurchaseCreditsResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('purchase-credits', {
        body: {
          package_id: request.package_id,
          number_of_credits_to_purchase: request.number_of_credits_to_purchase
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data as PurchaseCreditsResponse;
    } catch (error: any) {
      toast.error(`Error purchasing credits: ${error.message}`);
      console.error('Error purchasing credits:', error);
      throw error;
    }
  },

  async updateUserStrideInfo(isStrideCrmUser: boolean, strideLocationId: string | null): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_stride_crm_user: isStrideCrmUser,
          stride_location_id: strideLocationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Stride CRM information updated successfully');
    } catch (error: any) {
      toast.error(`Error updating Stride CRM information: ${error.message}`);
      console.error('Error updating Stride CRM information:', error);
      throw error;
    }
  },

  async createStripeCheckoutSession(request: StripeCheckoutRequest): Promise<StripeCheckoutResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          packageId: request.packageId,
          quantity: request.quantity
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data as StripeCheckoutResponse;
    } catch (error: any) {
      toast.error(`Error creating checkout session: ${error.message}`);
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  async verifyPaymentSuccess(sessionId: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          sessionId: sessionId
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        // Refresh the user profile to get updated credit balance
        await supabase.auth.refreshSession();
      }
      
      return data.success;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
};

export default versiumService;
