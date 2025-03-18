chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showWarning") {
    showWarningBanner(message.domain, message.riskScore);
  }
});

// Create and show warning banner
function showWarningBanner(domain, riskScore) {
  // Remove any existing banners
  const existingBanner = document.getElementById("catchphish-warning-banner");
  if (existingBanner) {
    existingBanner.remove();
  }

  // Create new banner
  const banner = document.createElement("div");
  banner.id = "catchphish-warning-banner";
  banner.style = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #FFC107;
      color: #000;
      padding: 10px 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

  const warningIcon = document.createElement("span");
  warningIcon.innerHTML = "⚠️";
  warningIcon.style.fontSize = "20px";
  warningIcon.style.marginRight = "10px";

  const messageContainer = document.createElement("div");
  messageContainer.style.flex = "1";

  const messageText = document.createElement("span");
  messageText.textContent = `Warning: ${domain} has been flagged as potentially suspicious (${riskScore.toFixed(
    1
  )}% risk score).`;

  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.style = `
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 0 10px;
    `;
  closeButton.onclick = () => {
    banner.remove();
  };

  const proceedButton = document.createElement("button");
  proceedButton.textContent = "Proceed Anyway";
  proceedButton.style = `
      background-color: #FF5722;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      margin-left: 10px;
      cursor: pointer;
    `;
  proceedButton.onclick = () => {
    banner.remove();
  };

  messageContainer.appendChild(messageText);
  banner.appendChild(warningIcon);
  banner.appendChild(messageContainer);
  banner.appendChild(proceedButton);
  banner.appendChild(closeButton);

  // Add to page
  document.body.insertBefore(banner, document.body.firstChild);

  // Push page content down
  document.body.style.marginTop = banner.offsetHeight + "px";

  // Remove margin when banner is closed
  closeButton.addEventListener("click", () => {
    document.body.style.marginTop = "0";
  });
  proceedButton.addEventListener("click", () => {
    document.body.style.marginTop = "0";
  });
}

// content-script.js
let originalFormBehaviorEnabled = true;
let formElements = [];
let overlayElement = null;

// Function to disable all form interactions
function disableFormInteractions() {
  if (originalFormBehaviorEnabled) {
    // Store all form elements
    formElements = Array.from(
      document.querySelectorAll("input, textarea, select, button")
    );

    // Create overlay to prevent interactions
    overlayElement = document.createElement("div");
    overlayElement.style.position = "fixed";
    overlayElement.style.top = "0";
    overlayElement.style.left = "0";
    overlayElement.style.width = "100%";
    overlayElement.style.height = "100%";
    overlayElement.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    overlayElement.style.zIndex = "2147483647"; // Max z-index
    overlayElement.style.cursor = "not-allowed";

    // Add warning message to overlay
    const warningMsg = document.createElement("div");
    warningMsg.textContent =
      "This site has been flagged as potentially dangerous. Form interactions are disabled.";
    warningMsg.style.position = "fixed";
    warningMsg.style.top = "10px";
    warningMsg.style.left = "50%";
    warningMsg.style.transform = "translateX(-50%)";
    warningMsg.style.padding = "10px 20px";
    warningMsg.style.backgroundColor = "#c62828";
    warningMsg.style.color = "white";
    warningMsg.style.borderRadius = "5px";
    warningMsg.style.fontFamily = "Arial, sans-serif";
    warningMsg.style.zIndex = "2147483647";
    warningMsg.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";

    document.body.appendChild(overlayElement);
    document.body.appendChild(warningMsg);

    // Disable all form elements
    formElements.forEach((element) => {
      element.disabled = true;
      element.setAttribute("data-catchphish-disabled", "true");
    });

    // Prevent form submissions
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", preventSubmission);
    });

    originalFormBehaviorEnabled = false;
  }
}

// Function to re-enable form interactions
function enableFormInteractions() {
  if (!originalFormBehaviorEnabled) {
    // Remove overlay
    if (overlayElement) {
      overlayElement.remove();
      document.querySelectorAll("div").forEach((div) => {
        if (
          div.textContent ===
          "This site has been flagged as potentially dangerous. Form interactions are disabled."
        ) {
          div.remove();
        }
      });
    }

    // Re-enable all form elements
    formElements.forEach((element) => {
      if (element.getAttribute("data-catchphish-disabled") === "true") {
        element.disabled = false;
        element.removeAttribute("data-catchphish-disabled");
      }
    });

    // Remove form submission listeners
    document.querySelectorAll("form").forEach((form) => {
      form.removeEventListener("submit", preventSubmission);
    });

    originalFormBehaviorEnabled = true;
  }
}

// Prevent form submission
function preventSubmission(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "enforceCSP") {
    disableFormInteractions();
    sendResponse({ status: "CSP enforced" });
  } else if (message.action === "disableCSP") {
    enableFormInteractions();
    sendResponse({ status: "CSP disabled" });
  }
  return true;
});
