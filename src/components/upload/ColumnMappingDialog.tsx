
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvData: string[][];
  onComplete: (mappings: Record<string, string>) => void;
}

const ColumnMappingDialog = ({ open, onOpenChange, csvData, onComplete }: ColumnMappingDialogProps) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<string[][]>([]);

  // Required fields for the system
  const requiredFields = ["first_name", "last_name"];
  
  // Available target fields
  const targetFields = [
    "first_name",
    "last_name", 
    "email", 
    "phone", 
    "address",
    "city", 
    "state", 
    "zip", 
    "company",
    "custom_field_1",
    "custom_field_2",
    "custom_field_3"
  ];

  useEffect(() => {
    if (csvData && csvData.length > 0) {
      // Set headers from the first row
      setHeaders(csvData[0]);
      
      // Set preview data (limit to 5 rows for performance)
      setPreviewData(csvData.slice(1, 6));
      
      // Initialize mappings with best guesses
      const initialMappings: Record<string, string> = {};
      csvData[0].forEach(header => {
        // Try to match headers to target fields
        const normalizedHeader = header.toLowerCase().trim();
        
        if (normalizedHeader.includes("first") && normalizedHeader.includes("name")) {
          initialMappings[header] = "first_name";
        } else if (normalizedHeader.includes("last") && normalizedHeader.includes("name")) {
          initialMappings[header] = "last_name";
        } else if (normalizedHeader.includes("email")) {
          initialMappings[header] = "email";
        } else if (normalizedHeader.includes("phone") || normalizedHeader.includes("mobile")) {
          initialMappings[header] = "phone";
        } else if (normalizedHeader.includes("address") && !normalizedHeader.includes("city")) {
          initialMappings[header] = "address";
        } else if (normalizedHeader.includes("city")) {
          initialMappings[header] = "city";
        } else if (normalizedHeader.includes("state") || normalizedHeader.includes("province")) {
          initialMappings[header] = "state";
        } else if (normalizedHeader.includes("zip") || normalizedHeader.includes("postal")) {
          initialMappings[header] = "zip";
        } else if (normalizedHeader.includes("company") || normalizedHeader.includes("business")) {
          initialMappings[header] = "company";
        } else {
          initialMappings[header] = "do_not_import"; // Changed from empty string to "do_not_import"
        }
      });
      
      setMappings(initialMappings);
    }
  }, [csvData]);

  const handleMapChange = (csvColumn: string, targetField: string) => {
    setMappings(prev => ({
      ...prev,
      [csvColumn]: targetField
    }));
  };

  const handleComplete = () => {
    // Verify required fields are mapped
    const mappedFields = Object.values(mappings);
    const missingRequiredFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequiredFields.length > 0) {
      toast.error(`Please map the required fields: ${missingRequiredFields.join(", ")}`);
      return;
    }
    
    // All required fields are mapped, proceed
    onComplete(mappings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Map CSV Columns</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Match your CSV columns to the corresponding fields in our system. 
              <span className="font-semibold"> First name and last name are required.</span>
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CSV Column</TableHead>
                <TableHead>Sample Data</TableHead>
                <TableHead>Map To Field</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headers.map((header, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{header}</TableCell>
                  <TableCell>
                    {previewData.map((row, i) => (
                      <div key={i} className="text-sm text-gray-500">
                        {row[index]}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mappings[header] || "do_not_import"} 
                      onValueChange={(value) => handleMapChange(header, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="do_not_import">Do not import</SelectItem>
                        {targetFields.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field.replace(/_/g, " ")}
                            {requiredFields.includes(field) ? " *" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleComplete}>Process Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnMappingDialog;
