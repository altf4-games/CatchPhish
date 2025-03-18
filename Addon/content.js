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
 @@ -31,34 +31,36 @@ chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
 @@ -67,27 +69,137 @@ chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
