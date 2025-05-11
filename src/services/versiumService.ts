
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
  }
};

export default versiumService;
