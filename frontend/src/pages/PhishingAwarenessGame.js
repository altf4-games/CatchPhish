import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

const PhishingAwarenessGame = () => {
  const gameContainerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [foundCount, setFoundCount] = useState(0);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const phishingZones = [
    {
      x: 200,
      y: 5,
      width: 240,
      height: 25,
      name: "Incorrect domain (union-bank-india.co.in instead of unionbankofindia.co.in)",
      found: false,
      hint: "Check the website URL in the address bar. Is this the official domain for Union Bank?",
    },
    {
      x: 380,
      y: 590,
      width: 180,
      height: 50,
      name: "Misspelled 'Retale Loan' instead of 'Retail Loan'",
      found: false,
      hint: "Look for spelling mistakes in the banking options at the bottom.",
    },
    {
      x: 120,
      y: 70,
      width: 160,
      height: 50,
      name: "Inconsistent or altered bank logo",
      found: false,
      hint: "Examine the bank's logo. Does it look official and consistent?",
    },
    {
      x: 870,
      y: 65,
      width: 130,
      height: 30,
      name: "Suspicious 'Contact Us on Whatsapp' link",
      found: false,
      hint: "Legitimate banks rarely use WhatsApp as their primary contact method.",
    },
    {
      x: 730,
      y: 330,
      width: 440,
      height: 110,
      name: "Too-good-to-be-true offer (zero processing charges, no pre-closure charges)",
      found: false,
      hint: "Check for unrealistic promises or extremely generous offers.",
    },
    {
      x: 770,
      y: 475,
      width: 160,
      height: 40,
      name: "Urgent call-to-action ('Apply Now' with limited period)",
      found: false,
      hint: "Phishing sites often create false urgency to make you act quickly without thinking.",
    },
    {
      x: 0,
      y: 535,
      width: 740,
      height: 30,
      name: "Suspicious notification about app services unavailability",
      found: false,
      hint: "Look for unprofessional notifications or vague service interruption warnings.",
    },
    {
      x: 570,
      y: 115,
      width: 130,
      height: 35,
      name: "Redundant 'NRI Services' menu items",
      found: false,
      hint: "Check for redundancies in the navigation menu. Legitimate sites are usually well-organized.",
    },
  ];

  const [zones, setZones] = useState(phishingZones);

  useEffect(() => {
    // Create p5 instance
    p5InstanceRef.current = new p5(sketch, gameContainerRef.current);

    // Cleanup on unmount
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, []);

  // Update p5 instance when zones state changes
  useEffect(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.updateZones(zones);
    }
  }, [zones]);

  const sketch = (p) => {
    let img;
    let imgWidth = 1280;
    let imgHeight = 720;
    let canvasWidth = 1280;
    let canvasHeight = 720;
    let scaleFactor = 1;

    p.preload = () => {
      // Placeholder image path - replace with actual path
      img = p.loadImage("./Phish.png");
    };

    p.setup = () => {
      const canvas = p.createCanvas(canvasWidth, canvasHeight);

      // Handle window resize
      const windowResized = () => {
        const windowWidth = window.innerWidth - 40;

        if (windowWidth < imgWidth) {
          scaleFactor = windowWidth / imgWidth;
          canvasWidth = windowWidth;
          canvasHeight = imgHeight * scaleFactor;
          p.resizeCanvas(canvasWidth, canvasHeight);
        } else if (windowWidth >= imgWidth && scaleFactor !== 1) {
          scaleFactor = 1;
          canvasWidth = imgWidth;
          canvasHeight = imgHeight;
          p.resizeCanvas(canvasWidth, canvasHeight);
        }
      };

      // Add resize listener
      window.addEventListener("resize", windowResized);
      windowResized();
    };

    p.draw = () => {
      p.background(240);

      // Display the image
      if (img) {
        p.image(img, 0, 0, canvasWidth, canvasHeight);
      } else {
        p.fill(200);
        p.rect(0, 0, canvasWidth, canvasHeight);
        p.fill(100);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text(
          "Banking Website Image Would Appear Here",
          p.width / 2,
          p.height / 2
        );
      }

      // Draw detected zones if found
      p.noFill();
      zones.forEach((zone) => {
        if (zone.found) {
          p.stroke(0, 255, 0);
          p.strokeWeight(3);
          p.rect(zone.x, zone.y, zone.width, zone.height);

          // Add label
          p.fill(0, 255, 0);
          p.noStroke();
          p.textSize(12);
          p.text("✓", zone.x + zone.width / 2, zone.y + zone.height / 2);
        }
      });
    };

    p.mousePressed = () => {
      if (gameCompleted) return;

      // Apply scaling to mouse coordinates if the canvas has been scaled
      const adjustedMouseX = p.mouseX / scaleFactor;
      const adjustedMouseY = p.mouseY / scaleFactor;

      // Check if p5's mouse position is within the canvas
      if (
        p.mouseX < 0 ||
        p.mouseX > p.width ||
        p.mouseY < 0 ||
        p.mouseY > p.height
      )
        return;

      // Check if any phishing zone was clicked
      let foundNew = false;

      const updatedZones = zones.map((zone) => {
        if (
          !zone.found &&
          adjustedMouseX > zone.x &&
          adjustedMouseX < zone.x + zone.width &&
          adjustedMouseY > zone.y &&
          adjustedMouseY < zone.y + zone.height
        ) {
          foundNew = true;
          showSuccessMessage(`Good eye! You found: ${zone.name}`);
          return { ...zone, found: true };
        }
        return zone;
      });

      if (foundNew) {
        setZones(updatedZones);
        updateScore(updatedZones);
        checkGameCompletion(updatedZones);
      } else {
        showErrorMessage(
          "Try again! Look for security issues in the banking page."
        );
      }
    };

    // Method to update zones from outside
    p.updateZones = (newZones) => {
      zones.forEach((zone, i) => {
        zone.found = newZones[i].found;
      });
    };
  };

  const updateScore = (updatedZones) => {
    const newFoundCount = updatedZones.filter((zone) => zone.found).length;
    let newScore = newFoundCount * 100;

    if (hintUsed) {
      newScore -= 50; // Penalty for using hints
    }

    setFoundCount(newFoundCount);
    setScore(newScore);
  };

  const showRandomHint = () => {
    // Find unfound zones
    const unfoundZones = zones.filter((zone) => !zone.found);

    if (unfoundZones.length === 0) {
      setCurrentHint("You've found all issues!");
    } else {
      // Pick a random unfound zone
      const randomZone =
        unfoundZones[Math.floor(Math.random() * unfoundZones.length)];
      setCurrentHint(randomZone.hint);
    }

    setShowHint(true);

    // Mark that a hint was used (for scoring)
    if (!hintUsed) {
      setHintUsed(true);
      updateScore(zones); // Update score to apply penalty
    }
  };

  const showSuccessMessage = (text) => {
    setMessage({ text, type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const showErrorMessage = (text) => {
    setMessage({ text, type: "error" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const checkGameCompletion = (updatedZones) => {
    const allFound = updatedZones.every((zone) => zone.found);
    if (allFound) {
      setGameCompleted(true);
    }
  };

  const restartGame = () => {
    // Reset all zones
    const resetZones = zones.map((zone) => ({ ...zone, found: false }));
    setZones(resetZones);

    // Reset UI elements
    setFoundCount(0);
    setScore(0);
    setShowHint(false);
    setMessage({ text: "", type: "" });
    setGameCompleted(false);
    setHintUsed(false);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen w-full">
      <div className="w-full max-w-6xl p-5 bg-white rounded-lg shadow mb-5 mt-5">
        <h1 className="text-2xl font-bold text-center text-blue-800">
          Phishing Site Detection Challenge
        </h1>
        <div className="flex justify-between mb-5">
          <div className="p-2 bg-blue-50 rounded font-bold">
            Found: <span>{foundCount}</span>/<span>{zones.length}</span>
          </div>
          <div className="p-2 bg-blue-50 rounded font-bold">
            Score: <span>{score}</span>
          </div>
        </div>
        <div>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
            onClick={showRandomHint}
          >
            Get a Hint
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
        {showHint && (
          <div className="mt-4 p-2 bg-yellow-100 border-l-4 border-yellow-400">
            {currentHint}
          </div>
        )}
        {message.text && (
          <div
            className={`mt-4 p-2 rounded text-center font-bold ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : message.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="relative" ref={gameContainerRef}>
        {/* p5.js canvas will be injected here */}
      </div>

      {gameCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg w-3/5 text-center">
            <h2 className="text-xl font-bold mb-4">
              Great job! You found all phishing indicators!
            </h2>
            <div className="text-left my-5">
              {zones.map((zone, index) => (
                <div
                  key={index}
                  className="p-2 my-1 bg-green-50 border-l-4 border-green-500"
                >
                  <strong>{index + 1}.</strong> {zone.name}
                </div>
              ))}
            </div>
            <p className="mb-4">
              Stay vigilant online! Watch out for these warning signs when
              visiting banking websites.
            </p>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded"
              onClick={restartGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingAwarenessGame;
