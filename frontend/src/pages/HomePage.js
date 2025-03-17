import React, { useEffect, useRef, useState } from "react";
import Dashboard from "./dashboard"; // Assuming Dashboard component is available
import "./HomePage.css";
import LandingPage from "./LandingPage";
import Footer from "./footer";

const HomePage = () => {
  const canvasRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Track scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Set up particles for network visualization with improved colors
    const particles = [];
    const particleCount = 100;
    const connectionDistance = 150;
    
    // Create particles with more vibrant colors
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 50 + 50}, 255, ${Math.random() * 0.5 + 0.3})`
      });
    }
    
    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Connect particles with more vibrant connections
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 180, 255, ${(1 - distance/connectionDistance) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.5 }}
      />
      <div 
        className="min-h-screen text-white relative z-10"
        style={{ background: "linear-gradient(135deg, #060d40 0%, #1a2980 100%)" }}
      >
        {/* Hero Section */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-pattern-grid z-0"></div>
        <LandingPage />
        
        {/* How It Works */}
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div 
              className="text-center mb-16"
              data-scroll-animation="fade-up"
              style={{
                opacity: Math.min(1, (scrollY - 100) / 300),
                transform: `translateY(${Math.max(0, 50 - (scrollY - 100) / 5)}px)`,
                transition: "opacity 0.5s ease, transform 0.5s ease"
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight glow-text" style={{ textShadow: "0 0 15px rgba(100, 150, 255, 0.7)" }}>
                How CatchPhish Works
              </h2>
              <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Our multi-layered detection system provides comprehensive protection
                against phishing threats.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div 
                className="bg-gradient-to-br from-[#2a3990] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group"
                style={{
                  opacity: Math.min(1, (scrollY - 200) / 300),
                  transform: `translateY(${Math.max(0, 50 - (scrollY - 200) / 5)}px)`,
                  transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                  1. Scan & Analyze
                </h3>
                <p className="text-blue-100 relative z-10">
                  Enter any suspicious URL, domain, or IP address and our system will
                  scan it against multiple threat databases and analyze it for
                  suspicious patterns.
                </p>
              </div>

              <div 
                className="bg-gradient-to-br from-[#2a3990] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group"
                style={{
                  opacity: Math.min(1, (scrollY - 250) / 300),
                  transform: `translateY(${Math.max(0, 50 - (scrollY - 250) / 5)}px)`,
                  transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                  2. AI Detection
                </h3>
                <p className="text-blue-100 relative z-10">
                  Our advanced AI and machine learning algorithms identify
                  sophisticated phishing attacks by analyzing website content,
                  behavior, and technical indicators.
                </p>
              </div>

              <div 
                className="bg-gradient-to-br from-[#2a3990] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group"
                style={{
                  opacity: Math.min(1, (scrollY - 300) / 300),
                  transform: `translateY(${Math.max(0, 50 - (scrollY - 300) / 5)}px)`,
                  transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 relative z-10">
                  3. Report & Protect
                </h3>
                <p className="text-blue-100 relative z-10">
                  Get detailed reports on detected threats and automatically submit
                  them to CERT-In and other cybersecurity agencies to protect the
                  community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 border-t border-blue-700/40 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div 
              className="text-center mb-16"
              style={{
                opacity: Math.min(1, (scrollY - 600) / 300),
                transform: `translateY(${Math.max(0, 50 - (scrollY - 600) / 5)}px)`,
                transition: "opacity 0.5s ease, transform 0.5s ease"
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight glow-text" style={{ textShadow: "0 0 15px rgba(100, 150, 255, 0.7)" }}>
                Powerful Features
              </h2>
              <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
                CatchPhish offers a comprehensive set of tools to protect you from
                phishing threats.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div 
                className="flex items-start p-6 bg-gradient-to-br from-[#3a4da0] to-[#060d40] rounded-xl border border-blue-500/40 hover:shadow-lg transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group"
                style={{
                  opacity: Math.min(1, (scrollY - 700) / 300),
                  transform: `translateX(${Math.max(0, -50 + (scrollY - 700) / 5)}px)`,
                  transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex-shrink-0 mr-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-7 w-7 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Real-time Threat Analysis
                  </h3>
                  <p className="text-blue-100">
                    Analyze URLs in real-time against multiple threat databases,
                    including VirusTotal and OpenPhish, to identify known threats.
                  </p>
                </div>
              </div>
              <div 
            className="flex items-start p-6 bg-gradient-to-br from-[#3a4da0] to-[#060d40] rounded-xl border border-blue-500/40 hover:shadow-lg transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 700) / 300),
              transform: `translateX(${Math.max(0, 50 - (scrollY - 700) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex-shrink-0 mr-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-7 w-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-2">
                AI-Powered Detection
              </h3>
              <p className="text-blue-100">
                Our advanced machine learning algorithms detect even the newest
                phishing sites that haven't been reported yet.
              </p>
            </div>
          </div>

          <div 
            className="flex items-start p-6 bg-gradient-to-br from-[#3a4da0] to-[#060d40] rounded-xl border border-blue-500/40 hover:shadow-lg transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 750) / 300),
              transform: `translateX(${Math.max(0, -50 + (scrollY - 750) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex-shrink-0 mr-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-7 w-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-2">
                Detailed Reports
              </h3>
              <p className="text-blue-100">
                Get comprehensive reports with risk scores, suspicious
                indicators, and screenshots of potential phishing sites.
              </p>
            </div>
          </div>

          <div 
            className="flex items-start p-6 bg-gradient-to-br from-[#3a4da0] to-[#060d40] rounded-xl border border-blue-500/40 hover:shadow-lg transition duration-500 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 750) / 300),
              transform: `translateX(${Math.max(0, 50 - (scrollY - 750) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex-shrink-0 mr-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/40 z-10 relative group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-7 w-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-2">
                CERT-In Integration
              </h3>
              <p className="text-blue-100">
                Easily submit detected phishing sites to the Indian Computer
                Emergency Response Team (CERT-In) to protect the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div 
          className="text-center mb-16"
          style={{
            opacity: Math.min(1, (scrollY - 1000) / 300),
            transform: `translateY(${Math.max(0, 50 - (scrollY - 1000) / 5)}px)`,
            transition: "opacity 0.5s ease, transform 0.5s ease"
          }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight glow-text" style={{ textShadow: "0 0 15px rgba(100, 150, 255, 0.7)" }}>
            What Our Users Say
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied users who trust CatchPhish to protect
            them from phishing attacks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div 
            className="bg-gradient-to-br from-[#3a4da0] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 1050) / 300),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 1050) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 border border-blue-400/50 shadow-md group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
                <span className="text-white font-bold">RS</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Rahul Sharma</h4>
                <p className="text-sm text-blue-200">Security Manager, TechCorp</p>
              </div>
            </div>
            <p className="text-blue-100 italic relative z-10">
              "CatchPhish has been instrumental in protecting our organization from sophisticated phishing attempts. The AI detection is remarkably accurate."
            </p>
          </div>

          <div 
            className="bg-gradient-to-br from-[#3a4da0] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 1100) / 300),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 1100) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4 border border-green-400/50 shadow-md group-hover:shadow-green-500/50 transition-all duration-500 group-hover:scale-110">
                <span className="text-white font-bold">AP</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Aarti Patel</h4>
                <p className="text-sm text-blue-200">IT Director, FinServe Ltd</p>
              </div>
            </div>
            <p className="text-blue-100 italic relative z-10">
              "We've reduced successful phishing attacks by 98% since implementing CatchPhish. The reporting feature is excellent for compliance requirements."
            </p>
          </div>

          <div 
            className="bg-gradient-to-br from-[#3a4da0] to-[#060d40] p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-500 border border-blue-500/40 transform hover:-translate-y-2 relative overflow-hidden group"
            style={{
              opacity: Math.min(1, (scrollY - 1150) / 300),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 1150) / 5)}px)`,
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mr-4 border border-purple-400/50 shadow-md group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
              <span className="text-white font-bold">VK</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Vikram Kumar</h4>
                <p className="text-sm text-blue-200">Cybersecurity Analyst</p>
              </div>
            </div>
            <p className="text-blue-100 italic relative z-10">
              "As a security professional, I'm impressed with the depth of analysis CatchPhish provides. It catches sophisticated attacks that other tools miss."
            </p>
          </div>
        </div>
      </div>
    </section>
    
   
    
    {/* CTA Section */}
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#3a4da0] to-[#060d40] p-12 rounded-2xl shadow-xl border border-blue-500/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight glow-text" style={{ textShadow: "0 0 15px rgba(100, 150, 255, 0.7)" }}>
              Start Protecting Yourself Today
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who trust CatchPhish to keep them safe from phishing attacks.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <a 
              href="#"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              Get Started Free
            </a>
            <a 
              href="#"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              View Live Demo
            </a>
          </div>
        </div>
      </div>
    </section>
    
    {/* Footer */}
    <Footer />
  </div>
</>
  );
};

export default HomePage;