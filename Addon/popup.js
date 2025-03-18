document.addEventListener("DOMContentLoaded", function () {
  // Fetch and display stats
  chrome.storage.local.get(
    ["sitesScanned", "sitesBlocked", "lastRiskScore"],
    function (result) {
      document.getElementById("sitesScanned").textContent =
        result.sitesScanned || 0;
      document.getElementById("sitesBlocked").textContent =
        result.sitesBlocked || 0;
      document.getElementById("riskScore").textContent = result.lastRiskScore
        ? `${result.lastRiskScore}%`
        : "0%";
    }
  );

  // Load blocked domains
  loadBlockedDomains();

  // Check current page status
  checkCurrentPage();

  // Add event listeners
  document.getElementById("scanButton").addEventListener("click", function () {
    chrome.runtime.sendMessage(
      { action: "checkCurrentPage" },
      function (response) {
        if (response && response.success) {
          document.getElementById("currentStatus").innerHTML =
            '<span class="status-icon">⌛</span><span>Scanning...</span>';

          // Update after a short delay to allow scanning to complete
          setTimeout(checkCurrentPage, 2000);
        }
      }
    );
  });

  document
    .getElementById("reportButton")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          const url = tabs[0].url;
          // Open reporting page in new tab
          chrome.tabs.create({
            url: `https://example.com/report?url=${encodeURIComponent(url)}`,
          });
        }
      });
    });
});

// Load and display blocked domains
function loadBlockedDomains() {
  chrome.runtime.sendMessage(
    { action: "getBlockedDomains" },
    function (domains) {
      const blockedListElement = document.getElementById("blockedList");

      if (!domains || domains.length === 0) {
        blockedListElement.innerHTML =
          '<div class="no-blocked">No sites have been blocked yet</div>';
        return;
      }

      let blockedHTML = "";
      domains.forEach((domain) => {
        blockedHTML += `
          <div class="blocked-item">
            <span>${domain}</span>
            <button class="remove-btn" data-domain="${domain}">Remove</button>
          </div>
        `;
      });

      blockedListElement.innerHTML = blockedHTML;

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const domain = this.getAttribute("data-domain");
          chrome.runtime.sendMessage(
            { action: "removeBlocked", domain: domain },
            function (response) {
              if (response && response.success) {
                loadBlockedDomains(); // Refresh list
              }
            }
          );
        });
      });
    }
  );
}

// Check and display current page status
function checkCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0] || !tabs[0].url || !tabs[0].url.startsWith("http")) {
      updateStatus("unknown", "Not a scannable page");
      return;
    }

    const domain = extractDomain(tabs[0].url);
    console.log(`Popup checking status for domain: ${domain}`);

    // Check if domain is in blocklist
    chrome.runtime.sendMessage(
      { action: "getBlockedDomains" },
      function (domains) {
        if (domains && domains.includes(domain)) {
          updateStatus("danger", "This site is blocked for phishing");
          return;
        }

        // Get cached result
        chrome.storage.local.get(
          ["lastCheckedDomain", "lastRiskScore"],
          function (result) {
            console.log("Storage data:", result);

            if (
              result.lastCheckedDomain === domain &&
              result.lastRiskScore !== undefined
            ) {
              const riskScore = result.lastRiskScore;
              document.getElementById(
                "riskScore"
              ).textContent = `${riskScore}%`;

              if (riskScore >= 70) {
                updateStatus(
                  "danger",
                  `High risk phishing site (${riskScore}%)`
                );
              } else if (riskScore >= 40) {
                updateStatus("warning", `Suspicious site (${riskScore}%)`);
              } else {
                updateStatus("safe", `Site appears safe (${riskScore}%)`);
              }
            } else {
              // Ask background script to check this URL
              chrome.runtime.sendMessage({ action: "checkCurrentPage" });
              updateStatus("unknown", "Checking site security...");

              // Check again after a delay
              setTimeout(() => {
                checkCurrentPage();
              }, 2000);
            }
          }
        );
      }
    );
  });
}

// Update status display
function updateStatus(type, message) {
  const statusElement = document.getElementById("currentStatus");
  statusElement.className = `status status-${type}`;

  let icon = "?";
  if (type === "safe") icon = "✓";
  else if (type === "warning") icon = "⚠";
  else if (type === "danger") icon = "⛔";

  statusElement.innerHTML = `<span class="status-icon">${icon}</span><span>${message}</span>`;
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url.split("/")[2] || "";
  }
}

// Add this at the end of your DOMContentLoaded event listener
document
  .getElementById("screenshotButton")
  .addEventListener("click", function () {
    // Update status to show we're taking a screenshot
    updateStatus("unknown", "Taking screenshot...");

    // Send message to background script to take screenshot
    chrome.runtime.sendMessage(
      { action: "takeScreenshot" },
      function (response) {
        if (response && response.success) {
          // Update status based on screenshot analysis
          const riskScore =
            response.analysis &&
            response.analysis.analysis &&
            response.analysis.analysis.phishing_score
              ? Math.round(response.analysis.analysis.phishing_score * 100)
              : 0;

          document.getElementById("riskScore").textContent = `${riskScore}%`;

          if (riskScore >= 70) {
            updateStatus("danger", `High risk phishing email (${riskScore}%)`);
          } else if (riskScore >= 40) {
            updateStatus("warning", `Suspicious email (${riskScore}%)`);
          } else {
            updateStatus("safe", `Email appears safe (${riskScore}%)`);
          }
        } else {
          // Handle error
          updateStatus("danger", "Screenshot failed");
        }
      }
    );
  });

// Add to your existing popup.js
document.getElementById("scanButton").addEventListener("click", function () {
  this.classList.add("scanning");
  document.getElementById("currentStatus").innerHTML =
    '<span class="status-icon">⟳</span><span>Scanning current page...</span>';

  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // Simulate scan completion after 2 seconds
    setTimeout(() => {
      const scanButton = document.getElementById("scanButton");
      scanButton.classList.remove("scanning");

      // Generate random risk score for demo (0-100%)
      const riskScore = Math.floor(Math.random() * 101);
      document.getElementById("riskScore").textContent = riskScore + "%";

      // Update status based on risk score
      const currentStatus = document.getElementById("currentStatus");
      if (riskScore > 75) {
        currentStatus.className = "status status-danger";
        currentStatus.innerHTML =
          '<span class="status-icon">✗</span><span>This site is dangerous</span>';
      } else if (riskScore > 55) {
        currentStatus.className = "status status-warning";
        currentStatus.innerHTML =
          '<span class="status-icon">!</span><span>Potential phishing detected</span>';
      } else {
        currentStatus.className = "status status-safe";
        currentStatus.innerHTML =
          '<span class="status-icon">✓</span><span>This site is safe</span>';
      }

      // Send risk score to background script
      chrome.runtime.sendMessage({
        action: "analyzeRisk",
        riskScore: riskScore,
      });

      // Show download button when scan is complete
      document.getElementById("downloadButton").style.display = "inline-block";

      // Update site scanned count
      const sitesScanned =
        parseInt(document.getElementById("sitesScanned").textContent) + 1;
      document.getElementById("sitesScanned").textContent = sitesScanned;

      // If risky, update blocked count
      if (riskScore > 55) {
        const sitesBlocked =
          parseInt(document.getElementById("sitesBlocked").textContent) + 1;
        document.getElementById("sitesBlocked").textContent = sitesBlocked;

        // Add to blocked list for demonstration
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const url = new URL(tabs[0].url);
            const hostname = url.hostname;

            const blockedList = document.getElementById("blockedList");
            // Remove "no sites blocked" message if present
            if (blockedList.querySelector(".no-blocked")) {
              blockedList.innerHTML = "";
            }

            // Create blocked item
            const blockedItem = document.createElement("div");
            blockedItem.className = "blocked-item";
            blockedItem.innerHTML = `
            <span>${hostname}</span>
            <button class="remove-btn">Remove</button>
          `;
            blockedList.appendChild(blockedItem);

            // Add remove functionality
            blockedItem
              .querySelector(".remove-btn")
              .addEventListener("click", function () {
                blockedItem.remove();
                const sitesBlocked =
                  parseInt(
                    document.getElementById("sitesBlocked").textContent
                  ) - 1;
                document.getElementById("sitesBlocked").textContent =
                  sitesBlocked;

                if (sitesBlocked === 0) {
                  blockedList.innerHTML =
                    '<div class="no-blocked">No sites have been blocked yet</div>';
                }
              });
          }
        );
      }
    }, 2000);
  });
});
