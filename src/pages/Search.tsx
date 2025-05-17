
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileDown, FileText, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import versiumService from "@/services/versiumService";
import { toast } from "@/components/ui/sonner";
import { IndividualSearchForm } from "@/components/search/IndividualSearchForm";
import { PropertySearchForm } from "@/components/search/PropertySearchForm";
import { PhoneSearchForm } from "@/components/search/PhoneSearchForm";

interface SearchResult {
  id: string;
  data: Record<string, any>[];
  createdAt: Date;
  name: string;
  type: 'contact-append' | 'demographic-append' | 'batch-upload' | 'individual-search' | 'property-search' | 'phone-search';
  recordCount: number;
}

const Search = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [searchData, setSearchData] = useState<Record<string, any>[] | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the current search type from the URL
  const path = location.pathname;
  const searchType = path.split('/').pop();

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    // Reset search data when changing search type
    setSearchData(null);
    
    // Check if we're on the /results route with a specific ID
    const params = new URLSearchParams(location.search);
    const resultId = params.get('id');
    
    if (resultId && results.length > 0) {
      const result = results.find(r => r.id === resultId);
      if (result) {
        setSelectedResult(result);
        setActiveTab("details");
      }
    }
  }, [location, results]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const searchResults = await versiumService.getSearchResults();
      setResults(searchResults);
    } catch (error) {
      console.error("Error loading search results:", error);
      toast.error("Failed to load search results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchComplete = (data: any) => {
    setSearchData(Array.isArray(data) ? data : [data]);
    setActiveTab("searchResults");
  };

  const downloadCsv = (data: Record<string, any>[], filename: string) => {
    if (!data.length) {
      toast.error("No data to download");
      return;
    }

    try {
      // Get all unique headers from all records
      const allHeaders = new Set<string>();
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          allHeaders.add(key);
        });
      });

      const headers = Array.from(allHeaders);
      
      // Create CSV content with headers
      let csvContent = headers.join(",") + "\n";
      
      // Add data rows
      data.forEach(row => {
        const csvRow = headers.map(header => {
          const value = row[header];
          // Handle value formatting and escaping
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(",");
        
        csvContent += csvRow + "\n";
      });
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename || 'data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file downloaded");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV file");
    }
  };

  // Render the appropriate search form based on the current URL
  const renderSearchForm = () => {
    switch (searchType) {
      case 'individuals':
        return <IndividualSearchForm onSearchComplete={handleSearchComplete} />;
      case 'properties':
        return <PropertySearchForm onSearchComplete={handleSearchComplete} />;
      case 'phones':
        return <PhoneSearchForm onSearchComplete={handleSearchComplete} />;
      case 'database':
      case 'custom':
      case 'advanced':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p>This search type is coming soon.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/search/individuals')}
                >
                  Try Individual Search
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  // Check if we're on the results route
  const isResultsRoute = path === '/results';

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isResultsRoute ? "Search Results" : `Search ${searchType ? searchType.charAt(0).toUpperCase() + searchType.slice(1) : ''}`}
          </h1>
          <Button onClick={loadResults} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Results
          </Button>
        </div>

        {!isResultsRoute && (
          <div className="mb-6">
            {renderSearchForm()}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Results History</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedResult}>Result Details</TabsTrigger>
            <TabsTrigger value="searchResults" disabled={!searchData}>Search Results</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Search History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="text-gray-500 mt-2">Upload data or perform a search to see results here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Records</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.name}</TableCell>
                            <TableCell>
                              <span className="capitalize">{result.type.replace('-', ' ')}</span>
                            </TableCell>
                            <TableCell>{result.recordCount}</TableCell>
                            <TableCell>
                              {new Date(result.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedResult(result);
                                    setActiveTab("details");
                                  }}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => downloadCsv(result.data, `${result.name.replace(/\s+/g, '_').toLowerCase()}.csv`)}
                                >
                                  <FileDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              {selectedResult ? (
                <>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedResult.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(selectedResult.createdAt).toLocaleString()} • {selectedResult.recordCount} records
                      </p>
                    </div>
                    <Button 
                      onClick={() => downloadCsv(selectedResult.data, `${selectedResult.name.replace(/\s+/g, '_').toLowerCase()}.csv`)}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {selectedResult.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(selectedResult.data[0]).map((header) => (
                                <TableHead key={header}>
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedResult.data.slice(0, 50).map((row, index) => (
                              <TableRow key={index}>
                                {Object.keys(selectedResult.data[0]).map((header) => (
                                  <TableCell key={`${index}-${header}`}>
                                    {typeof row[header] === 'object' 
                                      ? JSON.stringify(row[header]) 
                                      : String(row[header] ?? '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {selectedResult.data.length > 50 && (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Showing first 50 of {selectedResult.data.length} records. Download the CSV for the complete dataset.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">No data available</div>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardContent className="text-center py-8">
                  <p>Select a result to view details</p>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="searchResults">
            <Card>
              {searchData ? (
                <>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Current Search Results</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchData.length} records found
                      </p>
                    </div>
                    <Button 
                      onClick={() => downloadCsv(searchData, `search_results_${Date.now()}.csv`)}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {searchData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(searchData[0]).map((header) => (
                                <TableHead key={header}>
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchData.map((row, index) => (
                              <TableRow key={index}>
                                {Object.keys(searchData[0]).map((header) => (
                                  <TableCell key={`${index}-${header}`}>
                                    {typeof row[header] === 'object' 
                                      ? JSON.stringify(row[header]) 
                                      : String(row[header] ?? '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">No results found</div>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardContent className="text-center py-8">
                  <p>Perform a search to see results here</p>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Search;
