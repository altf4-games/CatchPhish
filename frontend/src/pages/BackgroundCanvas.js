import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const BackgroundCanvas = () => {
  const canvasRef = useRef(null);
  const threeContainerRef = useRef(null);

  useEffect(() => {
    // Set up THREE.js renderer for shark
    const threeContainer = threeContainerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create THREE.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering quality
    threeContainer.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add blue-tinted rim light
    const rimLight = new THREE.DirectionalLight(0x6080ff, 0.8);
    rimLight.position.set(-2, 1, -1);
    scene.add(rimLight);

    // Create a shark object as a placeholder before the model loads
    const sharkBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.5, 2),
      new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true })
    );
    scene.add(sharkBox);

    // Updated camera position to see the scene properly
    camera.position.set(100, 20, 160);
    camera.lookAt(150, 0, 0);
    
    // Shark movement variables - with increased distance and speed
    const sharkData = {
      object: sharkBox,
      speed: 0.3, // Increased speed for longer movement
      direction: 1, // 1 for right, -1 for left
      bounds: { min: -25, max: 25 }, // Expanded bounds for longer movement distance
    };

    // Load shark model
    const loader = new GLTFLoader();
    loader.load(
      "/great_white_shark.glb", // Replace with your actual shark GLB path
      (gltf) => {
        console.log("Shark model loaded successfully");

        // Remove placeholder
        scene.remove(sharkBox);

        // Add the real shark
        const shark = gltf.scene;
        shark.scale.set(0.1, 0.1, 0.1);
        shark.position.set(-25, 0, 0); // Start far left with expanded bounds
        shark.rotation.y = Math.PI / 2; // Rotate to face right direction
        scene.add(shark);

        // Update the shark reference
        sharkData.object = shark;

        // Setup animations if they exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(shark);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          sharkData.mixer = mixer;
          console.log("Shark animation started");
        } else {
          console.log("No animations found in the shark model");
        }
      },
      (xhr) => {
        console.log(`${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`);
      },
      (error) => {
        console.error("Error loading shark model:", error);
      }
    );

    // 2D Canvas setup (your original code)
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Also update Three.js renderer
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
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
        color: `rgba(255, ${Math.random() * 50 + 200}, 0, ${
          Math.random() * 0.3 + 0.4
        })`,
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
        color: `rgba(${Math.random() * 100 + 155}, ${
          Math.random() * 50 + 50
        }, 255, ${Math.random() * 0.5 + 0.3})`,
      });
    }

    // Animation function for 2D canvas
    function animate2D() {
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
          let distance = Math.sqrt(
            Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2)
          );

          if (distance < connectionDistance) {
            ctx.beginPath();
            // Brighter connections
            ctx.strokeStyle = `rgba(120, 180, 255, ${
              (1 - distance / connectionDistance) * 0.5
            })`;
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
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.size * 3
        );
        gradient.addColorStop(0, light.color);
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.arc(light.x, light.y, light.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core of light
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 150, 0.8)";
        ctx.fill();
      }

      requestAnimationFrame(animate2D);
    }

    // Modified Animation function for Three.js shark
    function animate3D() {
      requestAnimationFrame(animate3D);

      // Move the shark if it exists
      if (sharkData.object) {
        // Update animation mixer if it exists
        if (sharkData.mixer) {
          sharkData.mixer.update(0.016);
        }

        // Calculate new position
        const newX =
          sharkData.object.position.x + sharkData.speed * sharkData.direction;

        // Check boundaries and change direction instead of resetting position
        if (newX > sharkData.bounds.max) {
          // Change direction to left
          sharkData.direction = -1;
          // Flip the shark model to face left
          sharkData.object.rotation.y = -Math.PI / 2;
        } else if (newX < sharkData.bounds.min) {
          // Change direction to right
          sharkData.direction = 1;
          // Flip the shark model to face right
          sharkData.object.rotation.y = Math.PI / 2;
        }

        // Update position
        sharkData.object.position.x = newX;

        // Debug log every 3 seconds
        // if (Math.floor(Date.now() / 1000) % 3 === 0) {
        //   console.log("Shark position:", sharkData.object.position.x, "Direction:", sharkData.direction);
        // }
      }

      renderer.render(scene, camera);
    }

    // Start both animations
    animate2D();
    animate3D();

    // Handle window resize
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (threeContainer.contains(renderer.domElement)) {
        threeContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={threeContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
          opacity: 0.5,
        }}
      />
    </>
  );
};

export default BackgroundCanvas;
