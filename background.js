// background.js

// Configure side panel behavior on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("GitHub PR Review Assistant Extension installed.");
  
  // Allow opening the side panel by clicking the extension icon in the toolbar
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .then(() => console.log("Side Panel action click behavior configured successfully."))
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from content script:", message);

  if (message.action === "open_sidepanel") {
    const tabId = sender.tab ? sender.tab.id : null;
    if (!tabId) {
      console.error("No active tab context found to open side panel.");
      sendResponse({ success: false, error: "No active tab context" });
      return true;
    }

    console.log(`Attempting to open side panel for tab: ${tabId}`);

    // Call chrome.sidePanel.open synchronously to preserve user gesture context
    try {
      chrome.sidePanel.open({ tabId: tabId })
        .then(() => {
          console.log(`Side panel successfully opened for tab ${tabId}`);
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error(`Failed to open side panel for tab ${tabId}:`, error);
          sendResponse({ success: false, error: error.message });
        });
    } catch (err) {
      console.error("Synchronous error opening side panel:", err);
      sendResponse({ success: false, error: err.message });
    }
    
    // Return true to indicate we will send response asynchronously
    return true;
  }
});
