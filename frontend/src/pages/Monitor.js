import React, { useState, useEffect, useRef } from "react";

const BackgroundCanvas = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Set up particles for network visualization with improved colors
    const particles = [];
    const particleCount = 180; // Increased from 100 to 180
    const connectionDistance = 150;
    
    // Yellow light particles (small amount)
    const yellowLights = [];
    const yellowLightCount = 12; // Small amount of yellow lights
    
    // Create yellow light particles
    for (let i = 0; i < yellowLightCount; i++) {
      yellowLights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2, // Slightly larger
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        // Yellow colors with varying opacity
        color: `rgba(255, ${Math.random() * 50 + 200}, 0, ${Math.random() * 0.3 + 0.4})`
      });
    }
    
    // Create particles with more vibrant colors and increased speed
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        // Increased speed range by multiplying by 2
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 50 + 50}, 255, ${Math.random() * 0.5 + 0.3})`
      });
    }
    
    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw blue particles
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
            // Brighter connections
            ctx.strokeStyle = `rgba(120, 180, 255, ${(1 - distance/connectionDistance) * 0.5})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      // Draw and update yellow lights
      for (let i = 0; i < yellowLights.length; i++) {
        let light = yellowLights[i];
        
        // Update position
        light.x += light.speedX;
        light.y += light.speedY;
        
        // Bounce off edges
        if (light.x < 0 || light.x > canvas.width) light.speedX *= -1;
        if (light.y < 0 || light.y > canvas.height) light.speedY *= -1;
        
        // Draw yellow light with glow effect
        ctx.beginPath();
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          light.x, light.y, 0,
          light.x, light.y, light.size * 3
        );
        gradient.addColorStop(0, light.color);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(light.x, light.y, light.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core of light
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 150, 0.8)';
        ctx.fill();
      }
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5
      }}
    />
  );
};

const MonitorDomain = () => {
  const [domain, setDomain] = useState("");
  const [interval, setInterval] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve stored values on component mount
  useEffect(() => {
    const savedDomain = localStorage.getItem("domain");
    const savedInterval = localStorage.getItem("interval");
    const savedMessage = localStorage.getItem("message");
    
    if (savedDomain) setDomain(savedDomain);
    if (savedInterval) setInterval(savedInterval);
    if (savedMessage) setMessage(savedMessage);
  }, []);

  // Persist domain to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("domain", domain);
  }, [domain]);

  // Persist interval to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("interval", interval);
  }, [interval]);

  // Persist message to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("message", message);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:5001/monitor-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, interval }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "An error occurred");
      }
    } catch (error) {
      setMessage("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundCanvas />
      
      <div className="max-w-md w-full bg-white bg-opacity-95 shadow-lg rounded-lg overflow-hidden mx-4 my-8 relative z-10">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Domain Monitor
          </h1>
          <p className="text-blue-50 text-sm">Protect your domain from phishing attacks</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">Start Protection</h2>
          
          <div className="mb-4">
            <label htmlFor="domain" className="block text-gray-700 font-medium mb-1">
              Domain
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="pl-10 text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="example.com"
                required
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="interval" className="block text-gray-700 font-medium mb-1">
              Frequency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="pl-10 w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="1 hour"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors flex justify-center items-center font-medium"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {isLoading ? "Starting..." : "Start Protection"}
          </button>
        </form>
        
        {message && (
          <div className={`px-6 py-3 border-t ${message.includes("error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-2 ${message.includes("error") ? "text-red-500" : "text-green-500"}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                {message.includes("error") ? (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        )}
        
        <div className="px-6 py-3 bg-gray-50 bg-opacity-90">
          <p className="text-xs text-gray-600">
            Our system identifies threats in real-time before they can harm your customers
            and damage your brand reputation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonitorDomain;
