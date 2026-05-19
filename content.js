// content.js

let sidePanelTriggeredForCurrentTab = false;
let floatingBadge = null;
let lastUrl = window.location.href;

console.log("GitHub PR Review Assistant Content Script loaded.");

// Helper function to check if the current page is the PR Files tab
function isGitHubPRFilesTab() {
  const path = window.location.pathname;
  // Matches: /owner/repo/pull/num/files
  return /\/pull\/\d+\/files/.test(path);
}

// Function to inject/remove floating dashboard helper badge
function updateFloatingBadge() {
  if (isGitHubPRFilesTab()) {
    if (document.getElementById("gh-pr-assistant-badge-el")) return;

    console.log("Injecting floating assistant badge on GitHub PR Files changed tab...");

    // Create style element
    if (!document.getElementById("gh-pr-assistant-styles")) {
      const style = document.createElement("style");
      style.id = "gh-pr-assistant-styles";
      style.textContent = `
        .gh-pr-assistant-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white !important;
          padding: 12px 20px;
          border-radius: 50px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          cursor: pointer;
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
        }
        .gh-pr-assistant-badge:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 15px 30px rgba(168, 85, 247, 0.6), 0 0 12px rgba(99, 102, 241, 0.4);
        }
        .gh-pr-assistant-badge:active {
          transform: translateY(-1px) scale(0.98);
        }
        .gh-pr-assistant-badge .icon-sparkle {
          font-size: 16px;
          animation: spin 4s infinite linear;
        }
        .gh-pr-assistant-badge .pulse-ring {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50px;
          background: inherit;
          filter: blur(10px);
          opacity: 0.5;
          z-index: -1;
          animation: pulse-glow 2.5s infinite alternate;
        }
        @keyframes pulse-glow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Create the badge
    floatingBadge = document.createElement("button");
    floatingBadge.id = "gh-pr-assistant-badge-el";
    floatingBadge.className = "gh-pr-assistant-badge";
    floatingBadge.innerHTML = `
      <span class="icon-sparkle">✨</span>
      <span>PR Review Assistant</span>
      <div class="pulse-ring"></div>
    `;

    // Add click handler to directly trigger side panel
    floatingBadge.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Floating badge clicked. Sending open sidepanel request...");
      chrome.runtime.sendMessage({ action: "open_sidepanel" }, (response) => {
        if (response && response.success) {
          sidePanelTriggeredForCurrentTab = true;
        }
      });
    });

    document.body.appendChild(floatingBadge);
  } else {
    // Remove if we navigate away
    const existingBadge = document.getElementById("gh-pr-assistant-badge-el");
    if (existingBadge) {
      existingBadge.remove();
      floatingBadge = null;
    }
  }
}

// Intercept clicks on PR files tabs during SPA navigation
function setupTabClickInterceptors() {
  document.removeEventListener("click", handleGlobalClicks);
  document.addEventListener("click", handleGlobalClicks);
}

function handleGlobalClicks(event) {
  const anchor = event.target.closest("a");
  if (anchor && anchor.href) {
    const url = new URL(anchor.href);
    if (/\/pull\/\d+\/files/.test(url.pathname)) {
      console.log("User clicked a Pull Request 'Files changed' link. Requesting side panel open...");
      chrome.runtime.sendMessage({ action: "open_sidepanel" });
    }
  }
}

// Function to handle opening side panel on user's first interaction after direct page load
function setupAutoOpenOnFirstInteraction() {
  if (!isGitHubPRFilesTab() || sidePanelTriggeredForCurrentTab) return;

  const triggerOpen = (event) => {
    if (sidePanelTriggeredForCurrentTab) return;

    if (isGitHubPRFilesTab()) {
      console.log("First user gesture detected on PR Files tab. Auto-opening side panel...");
      sidePanelTriggeredForCurrentTab = true;
      chrome.runtime.sendMessage({ action: "open_sidepanel" });
    }

    // Remove listeners once triggered
    cleanupListeners();
  };

  const cleanupListeners = () => {
    document.removeEventListener("click", triggerOpen);
    document.removeEventListener("mousedown", triggerOpen);
    document.removeEventListener("keydown", triggerOpen);
  };

  document.addEventListener("click", triggerOpen);
  document.addEventListener("mousedown", triggerOpen);
  document.addEventListener("keydown", triggerOpen);
}

// Core initialization and transition handler
function handlePageTransition() {
  console.log("Page transition detected. URL:", window.location.href);
  
  // Reset trigger state if we navigated to a new page
  if (isGitHubPRFilesTab()) {
    setupAutoOpenOnFirstInteraction();
  } else {
    sidePanelTriggeredForCurrentTab = false;
  }
  
  updateFloatingBadge();
  setupTabClickInterceptors();
}

// Listen to GitHub client-side routing events (Turbo/PJAX)
document.addEventListener("turbo:load", handlePageTransition);
document.addEventListener("turbo:render", handlePageTransition);

// Polling fallback to detect URL changes that might bypass turbo events
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    handlePageTransition();
  }
}, 1000);

// Run initial execution on load
handlePageTransition();

// Listen for messages from side panel or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "append_comment") {
    const textToAppend = message.text;
    console.log("Attempting to append comment template:", textToAppend);
    
    const textarea = document.querySelector('textarea[class="prc-Textarea-TextArea-snlco"]');
    if (textarea) {
      // Append text
      const currentValue = textarea.value;
      const newValue = currentValue ? `${currentValue}\n${textToAppend}` : textToAppend;
      textarea.value = newValue;
      
      // Dispatch events to trigger GitHub's SPA react state update
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus textarea
      textarea.focus();
      
      console.log("Successfully appended template and dispatched React state events.");
      sendResponse({ success: true });
    } else {
      console.warn("Could not find GitHub comment textarea with selector: textarea[class=\"prc-Textarea-TextArea-snlco\"]");
      sendResponse({ success: false, error: "Textarea not found. Please click 'Add review comment' or edit a comment first." });
    }
  }
});
