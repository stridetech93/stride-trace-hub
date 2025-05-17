
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const DisclaimerPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">Stride Skip</h1>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-primary">
              Login
            </Link>
            <Link to="/signup" className="text-primary font-medium hover:text-primary/80">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">Last Updated: May 17, 2025</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Accuracy of Information</h2>
          <p>Stride Skip Tracing provides skip tracing services on a best-effort basis. While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or timeliness of the data provided through our platform.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Not a Consumer Reporting Agency</h2>
          <p>Stride Skip Tracing is not a consumer reporting agency as defined by the Fair Credit Reporting Act (FCRA). The information provided by our service should not be used for any purpose covered by the FCRA, including but not limited to:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Determining eligibility for credit or insurance</li>
            <li>Employment screening</li>
            <li>Tenant screening</li>
            <li>Any other purpose requiring FCRA compliance</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Intended Use</h2>
          <p>Our services are intended for use by real estate professionals for legitimate business purposes related to real estate transactions and communications. Users are responsible for ensuring that their use of our services complies with all applicable laws and regulations.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">No Legal Advice</h2>
          <p>Nothing contained in our platform constitutes legal advice. Users should consult with qualified legal professionals regarding compliance with applicable laws related to real estate transactions, marketing, and communications.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
          <p>In no event shall Stride Skip Tracing or its affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our services, whether based on contract, tort, strict liability, or any other legal theory, even if we have been advised of the possibility of such damages.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
          <p>If you have any questions about this disclaimer, please contact us at support@strideskip.com.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DisclaimerPage;
