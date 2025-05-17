
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const PrivacyPolicyPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">Last Updated: May 17, 2025</p>
          
          <p>At Stride Skip Tracing, we take your privacy seriously. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, and payment information when you register for an account or make a purchase. We also collect information about your usage of our platform and the searches you conduct.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and for other legitimate business purposes.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Storage and Security</h2>
          <p>We implement appropriate security measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p>We may share your information with third-party service providers who perform services on our behalf, such as payment processing and data analytics. We require these providers to use your information only as necessary to provide the requested services.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Legal Requirements</h2>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can manage most of your information through your account settings or by contacting us directly.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
          <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@strideskip.com.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
