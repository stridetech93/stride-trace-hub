
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const TermsOfServicePage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">Last Updated: May 17, 2025</p>
          
          <p>Welcome to Stride Skip Tracing. Please read these Terms of Service ("Terms") carefully before using our platform.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using the Stride Skip Tracing platform, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the service.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p>Stride Skip Tracing provides skip tracing services for real estate professionals. Our platform allows users to search for and obtain contact information and other relevant details about property owners.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
          <p>To use our service, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">4. Credits and Payments</h2>
          <p>Our service operates on a credit-based system. Credits must be purchased to use certain features. All payments are processed securely through our payment processor. Refunds are available only in accordance with our refund policy.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Usage</h2>
          <p>Information obtained through our service may only be used for legitimate real estate business purposes. Users agree not to use the data for any illegal activities, including harassment, stalking, or discrimination.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Compliance with Laws</h2>
          <p>Users must comply with all applicable federal, state, and local laws related to data privacy and usage, including but not limited to the Fair Credit Reporting Act (FCRA), where applicable.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>Stride Skip Tracing provides information on a best-effort basis but cannot guarantee the accuracy of all data. We are not liable for any damages arising from the use or inability to use our services.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
          <p>We reserve the right to terminate or suspend accounts that violate these Terms or for any other reason at our discretion.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Users will be notified of significant changes.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at support@strideskip.com.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
