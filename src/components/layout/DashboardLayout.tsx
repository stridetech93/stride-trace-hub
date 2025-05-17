
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Home, Menu, Search, Database, Settings, Users, LogOut, CreditCard, RefreshCw, Building, Phone } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Search Individuals", path: "/search/individuals" },
    { icon: Building, label: "Search Properties", path: "/search/properties" },
    { icon: Phone, label: "Search Phone Numbers", path: "/search/phones" },
    { icon: RefreshCw, label: "Data Enrichment", path: "/data-enrichment" },
    { icon: Search, label: "Advanced Search", path: "/search/advanced" },
    { icon: FileText, label: "Upload Data", path: "/upload" },
    { icon: Database, label: "My Results", path: "/results" },
    { icon: CreditCard, label: "Purchase Credits", path: "/purchase" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const userInitial = profile?.full_name ? profile.full_name.charAt(0) : '?';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div 
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="font-bold text-xl text-primary">Stride Skip</h1>
          ) : (
            <span className="font-bold text-xl text-primary">SS</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 pt-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive(item.path) ? "bg-slate-100" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex flex-col space-y-1 text-sm">
              <span className="text-gray-500">Licensed to:</span>
              <span className="font-medium">{profile?.full_name || 'User'}</span>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 mr-2">Credits:</span>
                <span className="font-medium text-primary">{profile?.credits || 0}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="font-bold">{userInitial}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Stride Skip Tracing</h2>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium mr-4">
                Credits: <span className="text-primary">{profile?.credits || 0}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/profile')} 
                className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center"
              >
                <span className="font-medium">{userInitial}</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="container mx-auto flex justify-center items-center text-sm text-gray-500">
            <Link to="/terms" className="hover:text-primary mx-2">Terms of Service</Link>
            <span className="mx-2">|</span>
            <Link to="/privacy" className="hover:text-primary mx-2">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link to="/disclaimer" className="hover:text-primary mx-2">Disclaimer</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
