const API_ENDPOINT = "http://localhost:5001/analyze";
const SCAN_TIMEOUT = 2000; // 2 seconds
const CACHE_EXPIRY = 3600000; // 1 hour

// Storage for blocked domains
let blockedDomains = new Set();
// Cache for analyzed URLs to reduce API calls
let urlCache = {};

// Initialize and load any saved blocked domains
chrome.storage.local.get(['blockedDomains'], function(result) {
  if (result.blockedDomains) {
    try {
      const savedDomains = JSON.parse(result.blockedDomains);
      blockedDomains = new Set(savedDomains);
      updateBlockRules();
    } catch (e) {
      console.error("Error loading blocked domains:", e);
    }
  }
});

// Monitor tab updates - catches new page loads and tab switches
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    checkURL(tab.url, tabId);
  }
});

// Monitor tab activation - when user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.startsWith('http')) {
      checkURL(tab.url, tab.id);
    }
  });
});

// Check if URL is potentially phishing
async function checkURL(url, tabId) {
    try {
      const domain = extractDomain(url);
      console.log(`Checking domain: ${domain}`);
      
      // Skip checking known safe domains
      const knownSafeDomains = ['google.com', 'youtube.com', 'facebook.com', 'github.com'];
      if (knownSafeDomains.some(safe => domain.includes(safe))) {
        console.log(`Known safe domain: ${domain}`);
        updateIcon(tabId, 0); // Set as safe
        return;
      }
      
      // Check if already blocked
      if (blockedDomains.has(domain)) {
        console.log(`Domain already blocked: ${domain}`);
        blockAccess(tabId, url, domain);
        return;
      }
      
      // Check cache first to avoid duplicate API calls
      const now = Date.now();
      if (urlCache[domain] && (now - urlCache[domain].timestamp < CACHE_EXPIRY)) {
        console.log(`Using cached result for ${domain}`);
        const cachedResult = urlCache[domain].data;
        console.log(`Cached risk score: ${cachedResult.risk_score}`);
        
        if (cachedResult.risk_score >= 70) {
          addToBlocklist(domain);
          blockAccess(tabId, url, domain);
        }
        updateIcon(tabId, cachedResult.risk_score);
        
        // Store in local storage for popup access
        chrome.storage.local.set({
          lastRiskScore: Math.round(cachedResult.risk_score),
          lastCheckedDomain: domain
        });
        
        return;
      }
      
      // Show scanning state
      chrome.action.setBadgeText({text: "...", tabId});
      chrome.action.setBadgeBackgroundColor({color: "#FFA500", tabId});
      
      console.log(`Sending API request for ${domain}`);
      
      // Analyze URL
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({url})
      });
      
      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`API result for ${domain}:`, result);
      
      // Cache the result
      urlCache[domain] = {
        timestamp: now,
        data: result
      };
      
      // Update UI based on risk score
      console.log(`Updating icon with risk score: ${result.risk_score}`);
      updateIcon(tabId, result.risk_score);
      
      // Update local storage for popup access
      chrome.storage.local.set({
        lastRiskScore: Math.round(result.risk_score),
        lastCheckedDomain: domain,
        sitesScanned: (parseInt(await chrome.storage.local.get('sitesScanned').sitesScanned || 0) + 1)
      });
      
      // High risk - block access
      if (result.risk_score >= 70) {
        console.log(`Blocking high-risk domain: ${domain}`);
        addToBlocklist(domain);
        blockAccess(tabId, url, domain);
        showNotification("Phishing site blocked!", 
                      `${domain} has been detected as a phishing site with ${result.risk_score.toFixed(1)}% confidence.`);
        
        // Update blocked sites count
        chrome.storage.local.set({
          sitesBlocked: (parseInt(await chrome.storage.local.get('sitesBlocked').sitesBlocked || 0) + 1)
        });
      } 
      // Medium risk - warn user
      else if (result.risk_score >= 40) {
        console.log(`Warning for suspicious domain: ${domain}`);
        showWarning(tabId, domain, result.risk_score);
      } else {
        console.log(`Domain appears safe: ${domain}`);
      }
      
    } catch (error) {
      console.error("Error checking URL:", error);
      // Reset icon on error
      chrome.action.setBadgeText({text: "", tabId});
    }
  }

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url.split('/')[2];
  }
}

// Update extension icon based on risk score
function updateIcon(tabId, riskScore) {
  if (riskScore >= 70) {
    chrome.action.setIcon({
      path: {
        16: "images/icon_red16.png",
        48: "images/icon_red48.png",
        128: "images/icon_red128.png"
      },
      tabId
    });
    chrome.action.setBadgeText({text: "⚠️", tabId});
    chrome.action.setBadgeBackgroundColor({color: "#FF0000", tabId});
  } else if (riskScore >= 40) {
    chrome.action.setIcon({
      path: {
        16: "images/icon_yellow16.png",
        48: "images/icon_yellow48.png",
        128: "images/icon_yellow128.png"
      },
      tabId
    });
    chrome.action.setBadgeText({text: "⚠", tabId});
    chrome.action.setBadgeBackgroundColor({color: "#FFA500", tabId});
  } else {
    chrome.action.setIcon({
      path: {
        16: "images/icon16.png",
        48: "images/icon48.png",
        128: "images/icon128.png"
      },
      tabId
    });
    chrome.action.setBadgeText({text: "✓", tabId});
    chrome.action.setBadgeBackgroundColor({color: "#00FF00", tabId});
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({text: "", tabId});
    }, 3000);
  }
}

// Add domain to blocklist
function addToBlocklist(domain) {
  blockedDomains.add(domain);
  chrome.storage.local.set({
    'blockedDomains': JSON.stringify([...blockedDomains])
  });
  updateBlockRules();
}

// Remove domain from blocklist
function removeFromBlocklist(domain) {
  blockedDomains.delete(domain);
  chrome.storage.local.set({
    'blockedDomains': JSON.stringify([...blockedDomains])
  });
  updateBlockRules();
}

async function updateBlockRules() {
    try {
      // Get all existing dynamic rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);
      
      // Remove all existing rules
      if (existingRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRuleIds
        });
      }
      
      // Skip if no domains to block
      if (blockedDomains.size === 0) return;
      
      // Create rules for each blocked domain
      const rules = [...blockedDomains].map((domain, index) => {
        return {
          id: index + 1, // Rule IDs must be positive integers
          priority: 1,
          action: {
            type: "redirect",
            redirect: {extensionPath: "/block.html?site=" + encodeURIComponent(domain)}
          },
          condition: {
            urlFilter: `||${domain}/*`,
            resourceTypes: ["main_frame"]
          }
        };
      });
      
      // Add new rules
      if (rules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules
        });
      }
    } catch (e) {
      console.error("Error updating block rules:", e);
    }
  }


// Manually block access for current tab
function blockAccess(tabId, url, domain) {
  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL(`block.html?site=${encodeURIComponent(domain)}&url=${encodeURIComponent(url)}`)
  });
}

// Show warning on medium risk sites
function showWarning(tabId, domain, riskScore) {
  chrome.tabs.sendMessage(tabId, {
    action: "showWarning",
    domain: domain,
    riskScore: riskScore
  });
}

// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon_red128.png",
    title: title,
    message: message
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getBlockedDomains") {
    sendResponse([...blockedDomains]);
  } else if (message.action === "removeBlocked") {
    removeFromBlocklist(message.domain);
    sendResponse({success: true});
  } else if (message.action === "checkCurrentPage") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        checkURL(tabs[0].url, tabs[0].id);
      }
    });
    sendResponse({success: true});
  }
  return true;
});
