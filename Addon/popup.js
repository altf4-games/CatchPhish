document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display stats
    chrome.storage.local.get(['sitesScanned', 'sitesBlocked', 'lastRiskScore'], function(result) {
      document.getElementById('sitesScanned').textContent = result.sitesScanned || 0;
      document.getElementById('sitesBlocked').textContent = result.sitesBlocked || 0;
      document.getElementById('riskScore').textContent = result.lastRiskScore ? `${result.lastRiskScore}%` : '0%';
    });
    
    // Load blocked domains
    loadBlockedDomains();
    
    // Check current page status
    checkCurrentPage();
    
    // Add event listeners
    document.getElementById('scanButton').addEventListener('click', function() {
      chrome.runtime.sendMessage({action: "checkCurrentPage"}, function(response) {
        if (response && response.success) {
          document.getElementById('currentStatus').innerHTML = 
            '<span class="status-icon">⌛</span><span>Scanning...</span>';
          
          // Update after a short delay to allow scanning to complete
          setTimeout(checkCurrentPage, 2000);
        }
      });
    });
    
    document.getElementById('reportButton').addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          const url = tabs[0].url;
          // Open reporting page in new tab
          chrome.tabs.create({
            url: `https://example.com/report?url=${encodeURIComponent(url)}`
          });
        }
      });
    });
  });
  
  // Load and display blocked domains
  function loadBlockedDomains() {
    chrome.runtime.sendMessage({action: "getBlockedDomains"}, function(domains) {
      const blockedListElement = document.getElementById('blockedList');
      
      if (!domains || domains.length === 0) {
        blockedListElement.innerHTML = '<div class="no-blocked">No sites have been blocked yet</div>';
        return;
      }
      
      let blockedHTML = '';
      domains.forEach(domain => {
        blockedHTML += `
          <div class="blocked-item">
            <span>${domain}</span>
            <button class="remove-btn" data-domain="${domain}">Remove</button>
          </div>
        `;
      });
      
      blockedListElement.innerHTML = blockedHTML;
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
          const domain = this.getAttribute('data-domain');
          chrome.runtime.sendMessage(
            {action: "removeBlocked", domain: domain},
            function(response) {
              if (response && response.success) {
                loadBlockedDomains(); // Refresh list
              }
            }
          );
        });
      });
    });
  }
  
  // Check and display current page status
  function checkCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || !tabs[0] || !tabs[0].url || !tabs[0].url.startsWith('http')) {
        updateStatus('unknown', 'Not a scannable page');
        return;
      }
      
      const domain = extractDomain(tabs[0].url);
      console.log(`Popup checking status for domain: ${domain}`);
      
      // Check if domain is in blocklist
      chrome.runtime.sendMessage({action: "getBlockedDomains"}, function(domains) {
        if (domains && domains.includes(domain)) {
          updateStatus('danger', 'This site is blocked for phishing');
          return;
        }
        
        // Get cached result
        chrome.storage.local.get(['lastCheckedDomain', 'lastRiskScore'], function(result) {
          console.log('Storage data:', result);
          
          if (result.lastCheckedDomain === domain && result.lastRiskScore !== undefined) {
            const riskScore = result.lastRiskScore;
            document.getElementById('riskScore').textContent = `${riskScore}%`;
            
            if (riskScore >= 70) {
              updateStatus('danger', `High risk phishing site (${riskScore}%)`);
            } else if (riskScore >= 40) {
              updateStatus('warning', `Suspicious site (${riskScore}%)`);
            } else {
              updateStatus('safe', `Site appears safe (${riskScore}%)`);
            }
          } else {
            // Ask background script to check this URL
            chrome.runtime.sendMessage({action: "checkCurrentPage"});
            updateStatus('unknown', 'Checking site security...');
            
            // Check again after a delay
            setTimeout(() => {
              checkCurrentPage();
            }, 2000);
          }
        });
      });
    });
  }
  
  // Update status display
  function updateStatus(type, message) {
    const statusElement = document.getElementById('currentStatus');
    statusElement.className = `status status-${type}`;
    
    let icon = '?';
    if (type === 'safe') icon = '✓';
    else if (type === 'warning') icon = '⚠';
    else if (type === 'danger') icon = '⛔';
    
    statusElement.innerHTML = `<span class="status-icon">${icon}</span><span>${message}</span>`;
  }
  
  // Extract domain from URL
  function extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url.split('/')[2] || '';
    }
  }