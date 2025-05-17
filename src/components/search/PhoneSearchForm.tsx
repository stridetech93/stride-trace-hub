
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LoaderIcon } from "lucide-react";
import versiumService from '@/services/versiumService';

interface PhoneSearchFormProps {
  onSearchComplete: (data: any) => void;
}

export function PhoneSearchForm({ onSearchComplete }: PhoneSearchFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.phone && (!formData.firstName || !formData.lastName)) {
      toast({
        title: "Missing information",
        description: "Please provide either a phone number or a full name.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await versiumService.searchPhone(formData);
      onSearchComplete(data);
      
      toast({
        title: "Search completed",
        description: "Phone search results are ready.",
      });
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during the search.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Phone Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name (Optional)</Label>
              <Input 
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name (Optional)</Label>
              <Input 
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> 
                Searching...
              </>
            ) : (
              'Search Phone Numbers'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
