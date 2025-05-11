
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

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

interface SearchResult {
  id: string;
  data: Record<string, any>[];
  createdAt: Date;
  name: string;
  type: 'contact-append' | 'demographic-append' | 'batch-upload';
  recordCount: number;
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
  }
};

export default versiumService;
