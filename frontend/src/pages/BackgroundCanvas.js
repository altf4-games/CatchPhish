import React, { useEffect, useRef } from 'react';

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

export default BackgroundCanvas;