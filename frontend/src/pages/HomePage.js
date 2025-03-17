import React from "react";
import Dashboard from "./dashboard"; // Assuming Dashboard component is available

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-[#f5f8fb] to-[#e6f2fa] min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0a1a4b] mb-6">
              Protect Your Digital Identity From{" "}
              <span className="text-[#fdbc40]">Phishing Attacks</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              CatchPhish uses advanced AI and machine learning to detect and report
              phishing domains before they can harm you or your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-[#304ffe] to-[#5471e5] text-white py-3 px-8 rounded-lg font-medium hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                Try It Free
              </button>
              <button className="border-2 border-[#304ffe] text-[#304ffe] py-3 px-8 rounded-lg font-medium hover:bg-blue-50 transition duration-300">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <img
              src="/security-dashboard.png"
              alt="Security Dashboard"
              className="relative z-10 rounded-xl shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/600/400";
              }}
            />
          </div>
        </div>
      </section>

      {/* CatchPhish Dashboard */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a1a4b] mb-4">
              Check Any URL In Seconds
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our advanced analysis engine checks URLs against multiple threat
              databases and uses AI to detect even the most sophisticated phishing
              attempts.
            </p>
          </div>
          <div className="bg-[#f5f8fb] p-8 rounded-xl shadow-lg">
            <Dashboard />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0a1a4b] mb-4">
              How CatchPhish Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our multi-layered detection system provides comprehensive protection
              against phishing threats.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a1a4b] mb-3">
                1. Scan & Analyze
              </h3>
              <p className="text-gray-600">
                Enter any suspicious URL, domain, or IP address and our system will
                scan it against multiple threat databases and analyze it for
                suspicious patterns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a1a4b] mb-3">
                2. AI Detection
              </h3>
              <p className="text-gray-600">
                Our advanced AI and machine learning algorithms identify
                sophisticated phishing attacks by analyzing website content,
                behavior, and technical indicators.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0a1a4b] mb-3">
                3. Report & Protect
              </h3>
              <p className="text-gray-600">
                Get detailed reports on detected threats and automatically submit
                them to CERT-In and other cybersecurity agencies to protect the
                community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0a1a4b] mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              CatchPhish offers a comprehensive set of tools to protect you from
              phishing threats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start p-6 bg-blue-50 rounded-xl">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0a1a4b] mb-2">
                  Real-time Threat Analysis
                </h3>
                <p className="text-gray-600">
                  Analyze URLs in real-time against multiple threat databases,
                  including VirusTotal and OpenPhish, to identify known threats.
                </p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-green-50 rounded-xl">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-green-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0a1a4b] mb-2">
                  AI-Powered Detection
                </h3>
                <p className="text-gray-600">
                  Our advanced machine learning algorithms detect even the newest
                  phishing sites that haven't been reported yet.
                </p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-purple-50 rounded-xl">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-purple-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0a1a4b] mb-2">
                  Detailed Reports
                </h3>
                <p className="text-gray-600">
                  Get comprehensive reports with risk scores, suspicious
                  indicators, and screenshots of potential phishing sites.
                </p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-yellow-50 rounded-xl">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-yellow-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0a1a4b] mb-2">
                  CERT-In Integration
                </h3>
                <p className="text-gray-600">
                  Easily submit detected phishing sites to the Indian Computer
                  Emergency Response Team (CERT-In) to protect the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0a1a4b] mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who trust CatchPhish to protect
              them from phishing attacks.
            </p>
            </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">RS</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#0a1a4b]">Rahul Sharma</h4>
                  <p className="text-sm text-gray-500">Security Manager, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "CatchPhish has been instrumental in protecting our organization from sophisticated phishing attempts. The AI detection is remarkably accurate."
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">AP</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#0a1a4b]">Aarti Patel</h4>
                  <p className="text-sm text-gray-500">IT Director, FinServe Ltd</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "We've reduced successful phishing attacks by 98% since implementing CatchPhish. The reporting feature is excellent for compliance requirements."
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold">VK</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#0a1a4b]">Vikram Kumar</h4>
                  <p className="text-sm text-gray-500">Cybersecurity Analyst</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As a security professional, I appreciate the technical depth of CatchPhish's analysis. It catches things that other tools miss completely."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#304ffe] to-[#5471e5] py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Start Protecting Your Digital Identity Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of organizations and individuals who trust CatchPhish to keep them safe from phishing attacks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-[#304ffe] py-3 px-8 rounded-lg font-medium hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
              Get Started For Free
            </button>
            <button className="border-2 border-white text-white py-3 px-8 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1a4b] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CatchPhish</h3>
            <p className="text-blue-200 mb-4">
              Advanced AI-powered phishing detection and protection for individuals and organizations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white">Features</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">API</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Community</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Contact</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-blue-800">
          <p className="text-center text-blue-200">© {new Date().getFullYear()} CatchPhish. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;