
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LoaderIcon } from "lucide-react";
import versiumService from '@/services/versiumService';

interface PropertySearchFormProps {
  onSearchComplete: (data: any) => void;
}

export function PropertySearchForm({ onSearchComplete }: PropertySearchFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    owner: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.address && !formData.owner) {
      toast({
        title: "Missing information",
        description: "Please provide either a property address or owner name.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await versiumService.searchProperty(formData);
      onSearchComplete(data);
      
      toast({
        title: "Search completed",
        description: "Property search results are ready.",
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
        <CardTitle>Search Property Records</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main St"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Anytown"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="CA"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input 
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                placeholder="12345"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner">Property Owner (Optional)</Label>
            <Input 
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              placeholder="Jane Smith"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> 
                Searching...
              </>
            ) : (
              'Search Property'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
