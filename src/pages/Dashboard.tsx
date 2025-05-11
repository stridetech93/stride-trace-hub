
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database, FileText, Phone, Search, Users, Building } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  // Mock user data (in a real app, this would come from authentication)
  const user = {
    name: "EZ",
    creditsUsed: 250,
    totalCredits: 1000,
    avatarUrl: null
  };

  // Calculate credit percentage
  const creditPercentage = (user.creditsUsed / user.totalCredits) * 100;
  
  // Data pull options
  const dataOptions = [
    { 
      title: "Search Individuals", 
      icon: Users, 
      description: "Find people by name, address, or other identifiers",
      link: "/search/individuals",
      color: "bg-blue-50 border-blue-200"
    },
    { 
      title: "Property Records", 
      icon: Building, 
      description: "Access property ownership and transaction history",
      link: "/search/properties",
      color: "bg-green-50 border-green-200"
    },
    { 
      title: "Phone Numbers", 
      icon: Phone, 
      description: "Retrieve contact information for individuals",
      link: "/search/phones",
      color: "bg-purple-50 border-purple-200"
    },
    { 
      title: "Batch Upload", 
      icon: FileText, 
      description: "Process multiple records at once via CSV",
      link: "/upload",
      color: "bg-amber-50 border-amber-200" 
    },
    { 
      title: "Database Search", 
      icon: Database, 
      description: "Search across all available data sources",
      link: "/search/database",
      color: "bg-rose-50 border-rose-200"
    },
    { 
      title: "Custom Search", 
      icon: Search, 
      description: "Build a custom search with specific parameters",
      link: "/search/custom",
      color: "bg-cyan-50 border-cyan-200"
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Hi, {user.name}</h1>
            <p className="text-lg text-gray-600 mt-2">What would you like to do today?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataOptions.map((option, index) => (
              <Card 
                key={index} 
                className={`p-6 border-2 hover:shadow-md transition-all ${option.color} cursor-pointer`}
                onClick={() => window.location.href = option.link}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white p-3 shadow-sm">
                    <option.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{option.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Credits sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <Card className="p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Credits</h2>
              <Avatar className="h-10 w-10 bg-primary text-white">
                <span className="text-lg">{user.name.charAt(0)}</span>
              </Avatar>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Credits Used</span>
                  <span className="font-medium">{user.creditsUsed}</span>
                </div>
                <Progress value={creditPercentage} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Credits Remaining</span>
                <span className="font-bold text-lg">{user.totalCredits - user.creditsUsed}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded font-medium"
                >
                  Purchase More Credits
                </button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 mt-6 border-2 border-blue-100 bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-2">Recent Activity</h3>
            <ul className="space-y-3">
              <li className="text-sm flex justify-between">
                <span className="text-gray-600">Property search</span>
                <span className="font-medium">-5 credits</span>
              </li>
              <li className="text-sm flex justify-between">
                <span className="text-gray-600">Batch upload (25 records)</span>
                <span className="font-medium">-25 credits</span>
              </li>
              <li className="text-sm flex justify-between">
                <span className="text-gray-600">Phone number lookup</span>
                <span className="font-medium">-2 credits</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
