
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload as UploadIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { toast } = useToast();

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
      toast({
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
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setUploaded(true);
      
      toast({
        title: "File uploaded successfully",
        description: "Your file is ready for processing",
        variant: "default",
      });
    }, 2000);
  };

  const handleNext = () => {
    toast({
      title: "Processing data",
      description: "Moving to column mapping...",
    });
    // In a real app, navigate to mapping page or open mapping modal
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
                <Button onClick={handleNext}>
                  Next: Map Columns
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
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
