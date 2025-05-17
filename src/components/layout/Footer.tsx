
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-primary">Stride Skip Tracing</h3>
            <p className="text-sm text-gray-500 mt-1">The ultimate skip tracing solution for real estate professionals</p>
          </div>
          
          <div className="flex flex-wrap justify-center">
            <Link to="/terms" className="text-gray-600 hover:text-primary mx-3 my-1">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-primary mx-3 my-1">Privacy Policy</Link>
            <Link to="/disclaimer" className="text-gray-600 hover:text-primary mx-3 my-1">Disclaimer</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Stride Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
