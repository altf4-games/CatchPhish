import React, { useState } from "react";
import "./HomePage.css";
import PhishingAwarenessGame from "./PhishingAwarenessGame"; // Import the game component

function Resources() {
  const [showGame, setShowGame] = useState(false); // State to control game visibility

  return (
    <div className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-blue-300 drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-400">
            CatchPhish Resources
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-gray-100 leading-relaxed font-light">
            Your ultimate hub for staying safe online and combating phishing
            attacks. Access cutting-edge tools, insightful articles, guides, and
            more to master phishing detection and prevention.
          </p>
          <div className="w-24 h-1 bg-blue-400 mx-auto mt-10 rounded-full"></div>
        </div>

        {/* Button to toggle the game */}
        <div className="text-center mb-10">
          <button
            onClick={() => setShowGame(!showGame)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {showGame ? "Close Phishing Game" : "Play Phishing Awareness Game"}
          </button>
        </div>

        {/* Conditionally render the game */}
        {showGame && (
          <div className="mb-10">
            <PhishingAwarenessGame />
          </div>
        )}

        {/* Existing resources grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Phishing Awareness Guide */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="phishing-awareness.png"
                alt="Phishing Awareness"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                GUIDE
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Phishing Awareness Guide
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Learn how to recognize phishing attempts and protect your
                personal and business data with our comprehensive guide.
              </p>
              <a
                href="https://www.phishing.org/what-is-phishing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                Read More
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="/phsihing.org.png"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Other resource cards... */}

          {/* Browser Security Add-ons */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="browser-addons.png"
                alt="Browser Addons"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                TOOLS
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Browser Security Add-ons
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Enhance your browsing experience with powerful security add-ons
                that block malicious sites and protect your data.
              </p>
              <a
                href="https://addons.mozilla.org/en-US/firefox/tag/security"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                Explore Add-ons
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Open-Source Phishing Detection */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="github-phishing.png"
                alt="Open-Source Tools"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                OPEN SOURCE
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Open-Source Phishing Detection
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Discover community-driven tools and techniques to enhance your
                phishing defense strategies.
              </p>
              <a
                href="https://github.com/topics/phishing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                Explore GitHub
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Real-Time Threat Feeds */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="/api/placeholder/400/320"
                alt="Real-Time Threat Feeds"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                REAL-TIME
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Real-Time Threat Feeds
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Stay updated on emerging threats and real-time phishing attacks
                from across the globe.
              </p>
              <a
                href="https://threatfeeds.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                View Threat Feeds
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Phishing Simulation Tools */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="/api/placeholder/400/320"
                alt="Phishing Simulation"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                SIMULATION
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Phishing Simulation Tools
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Test your organization's readiness with realistic phishing
                simulation software and training modules.
              </p>
              <a
                href="https://www.phishingbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                Start Simulating
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Expert Security Articles */}
          <div className="bg-blue-900/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-blue-700/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-blue-500/20 group">
            <div className="h-56 overflow-hidden relative">
              <img
                src="/api/placeholder/400/320"
                alt="Security Articles"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-blue-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                ARTICLES
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200">
                Expert Security Articles
              </h2>
              <p className="text-gray-200 mb-8 font-light">
                Read in-depth articles from cybersecurity experts to stay ahead
                of emerging phishing tactics.
              </p>
              <a
                href="https://www.kaspersky.com/blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-600/30"
              >
                Read Articles
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
