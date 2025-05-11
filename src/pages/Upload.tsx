
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload as UploadIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner";
import ColumnMappingDialog, { ProcessedData } from "@/components/upload/ColumnMappingDialog";
import versiumService from "@/services/versiumService";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast: toastHook } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check if file is CSV
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toastHook({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Parse CSV file
      const text = await file.text();
      const parsedData = parseCSV(text);
      setCsvData(parsedData);
      
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
        setUploaded(true);
        
        toastHook({
          title: "File uploaded successfully",
          description: "Your file is ready for processing",
          variant: "default",
        });
      }, 1000);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toastHook({
        title: "Error processing file",
        description: "There was an error reading your CSV file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const parseCSV = (csvText: string): string[][] => {
    // Simple CSV parser - in a real app you might want a more robust parser
    const lines = csvText.split('\n');
    return lines.map(line => {
      // Handle quoted values with commas inside them
      let inQuotes = false;
      let currentToken = '';
      const tokens: string[] = [];
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          tokens.push(currentToken);
          currentToken = '';
        } else {
          currentToken += char;
        }
      }
      
      // Push the last token
      tokens.push(currentToken);
      
      return tokens;
    }).filter(row => row.some(cell => cell.trim() !== '')); // Remove empty rows
  };

  const handleNext = () => {
    toast("Processing data", {
      description: "Moving to column mapping...",
    });
    // Show column mapping dialog
    setShowMapping(true);
  };

  const handleMappingComplete = async (processedData: ProcessedData) => {
    setIsProcessing(true);
    
    try {
      // Log the structure for debugging
      console.log("Processed data with mappings:", processedData);

      // Get the final data with enrichment
      const enrichedData = await processDataForEnrichment(processedData);
      
      // Here you would typically save the data to the database or perform further processing
      
      toast.success("Data processed successfully", {
        description: `Processed ${enrichedData.length} records`
      });
      
      // Reset for next upload
      setUploaded(false);
      setFile(null);
      setCsvData([]);
    } catch (error) {
      console.error("Error enriching data:", error);
      toast.error("Error processing data", {
        description: "There was a problem enriching your data. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Process data with Versium enrichment
  const processDataForEnrichment = async (processedData: ProcessedData): Promise<Record<string, any>[]> => {
    // Create a copy of the data to avoid mutating the original
    const enrichedData = [...processedData.data];
    
    // For demonstration, we'll enrich a few records
    // In a production environment, you'd want to batch these requests or use a queue
    const sampleSize = Math.min(5, enrichedData.length); // Limit to max 5 records for demo
    
    toast(`Enriching ${sampleSize} records for demonstration`, {
      description: "This process will take a few moments..."
    });
    
    // Process a subset of records as a demonstration
    for (let i = 0; i < sampleSize; i++) {
      const row = enrichedData[i];
      
      try {
        // Check if we have enough data for a Versium call
        if (row.email) {
          // Prepare the request for Versium API
          const contactRequest = {
            email: row.email,
            firstName: row.first_name || "",
            lastName: row.last_name || "",
            address: row.address || "",
            city: row.city || "",
            state: row.state || "",
            zip: row.zip || "",
          };
          
          // Call Versium API
          const enrichmentResult = await versiumService.contactAppend(contactRequest);
          console.log("Versium enrichment result:", enrichmentResult);
          
          // Add Versium data to the row, preserving existing data
          if (enrichmentResult) {
            // Add with "versium_" prefix to clearly identify enriched data
            Object.entries(enrichmentResult).forEach(([key, value]) => {
              if (value !== null && value !== undefined && value !== "") {
                enrichedData[i][`versium_${key}`] = value;
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error enriching record ${i}:`, error);
        // Continue with the next record rather than failing the entire batch
      }
    }
    
    return enrichedData;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Data</h1>
        
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Batch Processing</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file containing your skip tracing data. After uploading, you'll be able to map columns and process the records.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300"
            } transition-colors duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <FileText 
                className={`h-12 w-12 mb-4 ${file ? "text-primary" : "text-gray-400"}`} 
              />
              
              {file ? (
                <div className="text-center">
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-medium text-gray-800 mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Or click to browse files
                  </p>
                </>
              )}
              
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
              
              {!file && (
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                >
                  Browse Files
                </Button>
              )}
            </div>
          </div>
          
          {file && !uploaded && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="flex items-center"
              >
                {isUploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          )}
          
          {uploaded && (
            <div className="mt-6">
              <div className="flex items-center p-4 bg-green-50 rounded-md mb-4">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">File uploaded successfully</span>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Next: Map Columns"}
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Upload Guidelines</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Files must be in CSV format</li>
            <li>Maximum file size: 10MB</li>
            <li>Each record will use 1 credit for processing</li>
            <li>Headers should be in the first row</li>
            <li>Common fields: name, address, phone, email</li>
            <li>Unmapped columns will be preserved with their original headers</li>
          </ul>
        </Card>

        {/* Column Mapping Dialog */}
        <ColumnMappingDialog
          open={showMapping}
          onOpenChange={setShowMapping}
          csvData={csvData}
          onComplete={handleMappingComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default Upload;
