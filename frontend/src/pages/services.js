import React from 'react';
import './services.css';
import emailIcon from '../images/email.jpg';
import websiteIcon from '../images/website.png'; 
import browserIcon from '../images/browser.png';
import reportIcon from '../images/report.png';
import monitorIcon from '../images/hacker.png';

function Services() {
  return (
    <div className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400">
            Our Powerful Anti-Phishing Services
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-gray-100 leading-relaxed">
            At <span className="font-bold text-blue-300">Catch<span className="text-cyan-400">Phish</span></span>, we take phishing protection to the next level with cutting-edge technology and real-time detection.
          </p>
          <div className="w-24 h-1 bg-blue-400 mx-auto mt-10 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {/* Email Phishing Detection */}
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 border border-blue-500/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="p-8 relative z-10">
              <div className="h-16 w-16 bg-blue-700/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/50 transition-colors duration-300 shadow-lg">
                <img src={emailIcon} alt="Email Phishing Detection" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">Email Phishing Detection</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                Analyze and detect malicious email links and attachments. Stay safe from phishing emails and protect your inbox with our advanced AI scanning technology.
              </p>
              <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-6 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* Website Phishing Protection */}
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 border border-blue-500/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="p-8 relative z-10">
              <div className="h-16 w-16 bg-blue-700/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/50 transition-colors duration-300 shadow-lg">
                <img src={websiteIcon} alt="Website Phishing Protection" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">Website Phishing Protection</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                Automatically detect and block phishing websites in real-time. Ban and report suspicious sites instantly with our intelligent threat recognition system.
              </p>
              <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-6 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* Real-Time Browser Addon */}
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 border border-blue-500/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="p-8 relative z-10">
              <div className="h-16 w-16 bg-blue-700/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/50 transition-colors duration-300 shadow-lg">
                <img src={browserIcon} alt="Real-Time Browser Addon" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">Real-Time Browser Addon</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                Our advanced browser extension safeguards your browsing by detecting phishing sites and alerting you instantly before you risk exposing your data.
              </p>
              <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-6 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* Comprehensive Threat Reporting */}
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 border border-blue-500/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="p-8 relative z-10">
              <div className="h-16 w-16 bg-blue-700/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/50 transition-colors duration-300 shadow-lg">
                <img src={reportIcon} alt="Comprehensive Threat Reporting" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">Comprehensive Threat Reporting</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                Ban, report, and blacklist malicious sites to keep the internet safer for everyone. Detailed analytics provide insights into attack patterns.
              </p>
              <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-6 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>

          {/* 24/7 Threat Monitoring */}
          <div className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 border border-blue-500/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <div className="p-8 relative z-10">
              <div className="h-16 w-16 bg-blue-700/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/50 transition-colors duration-300 shadow-lg">
                <img src={monitorIcon} alt="24/7 Threat Monitoring" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">24/7 Threat Monitoring</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                Our systems constantly analyze potential phishing attacks to ensure you're always protected, no matter when or where you're online.
              </p>
              <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-6 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>
        </div>
        
        {/* Addon Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 to-indigo-900 shadow-2xl my-16">
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
          
          <div className="relative z-10 p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-200">CatchPhish Real-Time Addon</h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Install our powerful browser extension to get instant phishing alerts and protect your data.
              <br />One click to secure your browsing experience!
            </p>
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-lg shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
              Install Addon Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;