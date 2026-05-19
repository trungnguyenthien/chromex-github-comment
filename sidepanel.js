// sidepanel.js

// Default mock templates to pre-populate storage if empty
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: "🚀 LGTM Approve",
    description: "🚀 LGTM! Thay đổi cực kỳ rõ ràng, được kiểm thử cẩn thận và tối ưu hóa tốt. Rất tốt để merge!",
    color: "#10b981"
  },
  {
    id: 2,
    name: "💡 Suggestion Style",
    description: "💡 Góp ý nhẹ: Khuyến nghị tối ưu hóa cú pháp ES6+ ở đây để code gọn gàng, tăng hiệu năng và dễ bảo trì hơn.",
    color: "#8b5cf6"
  },
  {
    id: 3,
    name: "🛡️ Security Check",
    description: "🛡️ Cảnh báo bảo mật: Vui lòng rà soát lại đoạn xử lý này để tránh rò rỉ secret tokens, API keys hoặc SQL Injection.",
    color: "#dc2626"
  }
];

let selectedColor = "#10b981"; // Default active color
let editingTemplateId = null; // Track if we are editing an existing template

document.addEventListener("DOMContentLoaded", () => {
  console.log("GitHub PR Assistant Side Panel script loaded.");
  
  // Initialize Comment Template Manager Feature
  initCommentTemplates();

  // Listen to tab changes to automatically reload templates of the current active repository
  chrome.tabs.onActivated.addListener(() => {
    renderTemplatesList();
  });

  // Listen to tab updates (page SPA navigations) to reload templates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      renderTemplatesList();
    }
  });
});

// Helper to parse the current GitHub repository scope from the active tab's URL
function getCurrentRepo(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      callback(null);
      return;
    }
    const activeTab = tabs[0];
    const url = activeTab.url;
    if (url && url.includes("github.com")) {
      try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split("/").filter(Boolean);
        // Path format: /owner/repo/...
        if (pathSegments.length >= 2) {
          const owner = pathSegments[0];
          const repo = pathSegments[1];
          // Filter out standard non-repository pages (settings, notifications, search, etc.)
          const nonRepos = ["settings", "notifications", "orgs", "organizations", "search", "trending", "explore", "pulls", "issues"];
          if (!nonRepos.includes(owner)) {
            callback(`${owner}/${repo}`.toLowerCase());
            return;
          }
        }
      } catch (err) {
        console.error("Error parsing repo from URL:", err);
      }
    }
    callback(null);
  });
}

// Global visual toast notification
function showToast(message, type = "success") {
  // Remove existing toasts first to prevent piling up
  const existingToasts = document.querySelectorAll(".pr-toast-notification");
  existingToasts.forEach(t => t.remove());

  const msg = document.createElement("div");
  msg.className = "pr-toast-notification";
  msg.style.position = "fixed";
  msg.style.bottom = "80px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = type === "success" 
    ? "linear-gradient(135deg, #10b981, #059669)" 
    : type === "warning"
      ? "linear-gradient(135deg, #d97706, #b45309)"
      : "linear-gradient(135deg, #ef4444, #dc2626)";
  msg.style.color = "white";
  msg.style.padding = "10px 20px";
  msg.style.borderRadius = "20px";
  msg.style.fontSize = "12px";
  msg.style.fontWeight = "600";
  msg.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
  msg.style.zIndex = "99999";
  msg.style.whiteSpace = "nowrap";
  msg.style.pointerEvents = "none";
  msg.textContent = message;
  
  // Custom slide-up animation
  msg.animate([
    { transform: "translate(-50%, 20px)", opacity: 0 },
    { transform: "translate(-50%, 0)", opacity: 1 }
  ], {
    duration: 350,
    easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
  });

  document.body.appendChild(msg);
  
  // Remove after 3 seconds
  setTimeout(() => {
    msg.animate([
      { transform: "translate(-50%, 0)", opacity: 1 },
      { transform: "translate(-50%, -20px)", opacity: 0 }
    ], {
      duration: 300,
      easing: "ease-in"
    }).onfinish = () => msg.remove();
  }, 2700);
}

// Global function to toggle/slide form expanded/collapsed state
function toggleForm(show) {
  const toggleBtn = document.getElementById("btn-toggle-form");
  const formContainer = document.getElementById("template-form-container");
  const nameInput = document.getElementById("template-name");
  const descInput = document.getElementById("template-desc");
  const saveBtn = document.getElementById("btn-save-template");
  const colorBtns = document.querySelectorAll(".color-btn");

  const shouldShow = show !== undefined ? show : !formContainer.classList.contains("expanded");
  if (shouldShow) {
    formContainer.classList.add("expanded");
    toggleBtn.classList.add("active");
    toggleBtn.querySelector(".toggle-icon").textContent = "+";
    toggleBtn.querySelector("span:not(.toggle-icon)").textContent = "Đóng Khung Nhập";
    nameInput.focus();
  } else {
    formContainer.classList.remove("expanded");
    toggleBtn.classList.remove("active");
    toggleBtn.querySelector(".toggle-icon").textContent = "+";
    toggleBtn.querySelector("span:not(.toggle-icon)").textContent = "Thêm Mẫu Nhận Xét";
    
    // Clean inputs when collapsed
    nameInput.value = "";
    descInput.value = "";
    colorBtns.forEach(b => b.classList.remove("active"));
    colorBtns[0].classList.add("active");
    selectedColor = "#10b981";
    
    // Reset editing environment
    editingTemplateId = null;
    saveBtn.querySelector("span").textContent = "Lưu Mẫu Nhận Xét";
  }
}

// COMMENT TEMPLATES MANAGER CORE LOGIC
function initCommentTemplates() {
  const nameInput = document.getElementById("template-name");
  const descInput = document.getElementById("template-desc");
  const saveBtn = document.getElementById("btn-save-template");
  const colorBtns = document.querySelectorAll(".color-btn");
  
  // Collapsible Form elements
  const toggleBtn = document.getElementById("btn-toggle-form");
  const cancelBtn = document.getElementById("btn-cancel-template");

  // Import / Export button elements
  const exportBtn = document.getElementById("btn-export-templates");
  const importBtn = document.getElementById("btn-import-templates");
  const fileInput = document.getElementById("file-import-input");

  // Setup click toggles
  toggleBtn.addEventListener("click", () => toggleForm());
  cancelBtn.addEventListener("click", () => toggleForm(false));

  // 1. Color Selection Grid Behavior
  colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all
      colorBtns.forEach(b => b.classList.remove("active"));
      // Add active to current
      btn.classList.add("active");
      // Save color
      selectedColor = btn.getAttribute("data-color");
    });
  });

  // 2. Save / Update Template click listener
  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();

    // Validation
    if (!name) {
      showToast("Vui lòng nhập tên mẫu nhận xét!", "error");
      nameInput.focus();
      return;
    }
    if (!desc) {
      showToast("Vui lòng nhập nội dung mẫu nhận xét!", "error");
      descInput.focus();
      return;
    }

    getCurrentRepo((repo) => {
      if (!repo) {
        showToast("Không xác định được repository hoạt động để lưu mẫu!", "error");
        return;
      }

      const storageKey = `templates_repo_${repo}`;

      chrome.storage.local.get(storageKey, (result) => {
        let templates = result[storageKey] || [];

        if (editingTemplateId !== null) {
          // Edit Mode: Update existing item
          templates = templates.map(item => {
            if (item.id === editingTemplateId) {
              return { ...item, name: name, description: desc, color: selectedColor };
            }
            return item;
          });

          chrome.storage.local.set({ [storageKey]: templates }, () => {
            console.log(`Template ID: ${editingTemplateId} updated successfully inside repository: ${repo}`);
            showToast("Cập nhật mẫu nhận xét thành công! ✨", "success");
            
            // Collapse and reset
            toggleForm(false);
            renderTemplatesList();
          });
        } else {
          // Create Mode: Add new item
          const newTemplate = {
            id: Date.now(),
            name: name,
            description: desc,
            color: selectedColor
          };

          templates.push(newTemplate);
          
          chrome.storage.local.set({ [storageKey]: templates }, () => {
            console.log(`Template saved successfully under repository: ${repo}`, newTemplate);
            showToast("Lưu mẫu nhận xét thành công! ✨", "success");
            
            // Collapse and reset
            toggleForm(false);
            renderTemplatesList();
          });
        }
      });
    });
  });

  // 3. EXPORT SCOPED REPOSITORY JSON TEMPLATES
  exportBtn.addEventListener("click", () => {
    getCurrentRepo((repo) => {
      if (!repo) return;
      const storageKey = `templates_repo_${repo}`;
      
      chrome.storage.local.get(storageKey, (result) => {
        const templates = result[storageKey] || [];
        if (templates.length === 0) {
          showToast("Không có mẫu nhận xét nào để xuất!", "warning");
          return;
        }

        try {
          const jsonString = JSON.stringify(templates, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement("a");
          a.href = url;
          // Format filename: pr_templates_owner_repo.json (e.g. pr_templates_trungnguyen_ios_vietquiz.json)
          const cleanRepoName = repo.replace(/[^a-zA-Z0-9]/g, "_");
          a.download = `pr_templates_${cleanRepoName}.json`;
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);

          showToast("Xuất file JSON thành công! 📤", "success");
        } catch (err) {
          console.error("Export failed:", err);
          showToast("Lỗi khi xuất file mẫu nhận xét!", "error");
        }
      });
    });
  });

  // 4. IMPORT SCOPED REPOSITORY JSON TEMPLATES
  importBtn.addEventListener("click", () => {
    fileInput.click(); // Trigger native file dialog
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    getCurrentRepo((repo) => {
      if (!repo) return;
      const storageKey = `templates_repo_${repo}`;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          if (!Array.isArray(importedData)) {
            showToast("Lỗi: Dữ liệu JSON phải là dạng danh sách (Array)!", "error");
            return;
          }

          // Filter and Sanitize inputs
          const sanitized = importedData.map(item => ({
            id: item.id || Date.now() + Math.random(),
            name: String(item.name || "Mẫu chưa đặt tên").trim(),
            description: String(item.description || "").trim(),
            color: String(item.color || "#10b981").trim()
          })).filter(item => item.name && item.description);

          if (sanitized.length === 0) {
            showToast("Lỗi: Không tìm thấy mẫu nhận xét hợp lệ trong file!", "warning");
            return;
          }

          chrome.storage.local.get(storageKey, (result) => {
            const currentTemplates = result[storageKey] || [];
            const merged = [...currentTemplates];
            let updateCount = 0;
            let addCount = 0;

            // Merge details: Update if name exists (case-insensitive), otherwise append
            sanitized.forEach(importedItem => {
              const existsIdx = merged.findIndex(t => t.name.toLowerCase() === importedItem.name.toLowerCase());
              if (existsIdx >= 0) {
                merged[existsIdx] = importedItem; // Replace/update existing
                updateCount++;
              } else {
                merged.push(importedItem); // Append new
                addCount++;
              }
            });

            chrome.storage.local.set({ [storageKey]: merged }, () => {
              showToast(`Nhập mẫu thành công! (Thêm: ${addCount}, Cập nhật: ${updateCount}) 📥`, "success");
              renderTemplatesList();
            });
          });
        } catch (err) {
          console.error("Import parsing failed:", err);
          showToast("Lỗi: File JSON không đúng cấu trúc mẫu nhận xét!", "error");
        } finally {
          // Clear input buffer
          fileInput.value = "";
        }
      };

      reader.readAsText(file);
    });
  });

  // 5. Initial rendering of saved list
  renderTemplatesList();
}

// Loads and renders templates from storage (populates defaults if storage empty)
function renderTemplatesList() {
  const listContainer = document.getElementById("templates-list");
  const toggleBtn = document.getElementById("btn-toggle-form");
  const actionsBar = document.getElementById("repo-actions-bar");

  getCurrentRepo((repo) => {
    // A. Out of scope scenario: User is not active on a GitHub repository
    if (!repo) {
      // Hide entry toggler
      toggleBtn.style.display = "none";
      // Hide scoped Actions bar
      actionsBar.style.display = "none";
      // Display visual placeholder
      listContainer.innerHTML = `
        <div class="empty-list-state" style="border-style: solid; background: rgba(226, 232, 240, 0.2);">
          Hãy mở một trang Pull Request trên GitHub để bắt đầu sử dụng và tạo các mẫu nhận xét dành riêng cho repository đó! 🚀
        </div>
      `;
      return;
    }

    // B. Active repository scenario: Scoped templates listing
    toggleBtn.style.display = "flex"; // Show entry toggler
    actionsBar.style.display = "flex"; // Show Scoped Actions bar

    const storageKey = `templates_repo_${repo}`;

    chrome.storage.local.get(storageKey, (result) => {
      let templates = result[storageKey];

      // Scoped load setup: populate storage with defaults if it's the user's first visit to this repo
      if (!templates || templates.length === 0) {
        templates = DEFAULT_TEMPLATES.map(t => ({ ...t, id: Date.now() + Math.random() }));
        chrome.storage.local.set({ [storageKey]: templates });
      }

      // Sort templates alphabetically by name (handles Emojis and Vietnamese accents naturally)
      templates.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));

      // Clean container
      listContainer.innerHTML = "";

      // Render list items
      templates.forEach(item => {
        const card = document.createElement("div");
        card.className = "template-item-card";
        card.setAttribute("data-id", item.id);
        
        // Inject visual components: Only display selected color dot, Name tag, and action drawer
        card.innerHTML = `
          <div class="template-item-left">
            <div class="template-item-header">
              <div class="color-indicator-dot" style="background-color: ${item.color};"></div>
              <span class="template-item-name">${escapeHTML(item.name)}</span>
            </div>
          </div>
          <div class="template-item-actions">
            <button class="btn-edit-template" data-id="${item.id}" title="Sửa mẫu này">✏️</button>
            <button class="btn-delete-template" data-id="${item.id}" title="Xóa mẫu nhận xét này">🗑️</button>
          </div>
        `;

        // 4. Card click: Append content to active tab
        card.addEventListener("click", () => {
          appendTemplateToGitHub(item.description);
        });

        // 5. Edit button click
        const editBtn = card.querySelector(".btn-edit-template");
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Stop click from triggering parent card click
          startEditingTemplate(item);
        });

        // 6. Delete button click
        const deleteBtn = card.querySelector(".btn-delete-template");
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Stop click from triggering parent card click
          deleteTemplate(item.id);
        });

        listContainer.appendChild(card);
      });
    });
  });
}

// Fills form inputs and sets up edit mode
function startEditingTemplate(item) {
  const nameInput = document.getElementById("template-name");
  const descInput = document.getElementById("template-desc");
  const saveBtn = document.getElementById("btn-save-template");
  const colorBtns = document.querySelectorAll(".color-btn");

  // Track ID
  editingTemplateId = item.id;

  // Populate inputs
  nameInput.value = item.name;
  descInput.value = item.description;

  // Activate color button
  selectedColor = item.color;
  colorBtns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-color") === item.color) {
      btn.classList.add("active");
    }
  });

  // Change primary submit button label
  saveBtn.querySelector("span").textContent = "Cập Nhật Nhận Xét";

  // Slide open the input fields panel
  toggleForm(true);
}

// Triggers appending comment inside active GitHub PR tab
function appendTemplateToGitHub(text) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      showToast("Không tìm thấy tab trình duyệt hoạt động!", "error");
      return;
    }

    const activeTab = tabs[0];
    
    // Broadcast text to content script
    chrome.tabs.sendMessage(activeTab.id, { action: "append_comment", text: text }, (response) => {
      // Check for errors (e.g. content script not loaded or active tab is not github)
      if (chrome.runtime.lastError) {
        console.warn("Message delivery failed:", chrome.runtime.lastError.message);
        showToast("Không thể kết nối tới GitHub. Vui lòng tải lại trang GitHub PR!", "error");
        return;
      }

      if (response && response.success) {
        showToast("Đã chèn nội dung nhận xét thành công! 📝", "success");
      } else {
        // Textarea was not found on the page
        const errMsg = response ? response.error : "Không tìm thấy hộp viết nhận xét trên GitHub.";
        showToast(`Lỗi: ${errMsg}`, "warning");
      }
    });
  });
}

// Removes a template from storage by id
function deleteTemplate(id) {
  getCurrentRepo((repo) => {
    if (!repo) return;

    const storageKey = `templates_repo_${repo}`;

    chrome.storage.local.get(storageKey, (result) => {
      const templates = result[storageKey] || [];
      const updated = templates.filter(t => t.id !== parseInt(id) && t.id !== id);

      chrome.storage.local.set({ [storageKey]: updated }, () => {
        console.log(`Template ID: ${id} deleted from repository: ${repo}.`);
        showToast("Đã xóa mẫu nhận xét khỏi danh sách.", "success");
        
        // If the template being deleted is currently active in the editor, clean it up
        if (editingTemplateId === id || editingTemplateId === parseInt(id)) {
          toggleForm(false);
        }
        
        renderTemplatesList();
      });
    });
  });
}

// Safe string escaping for HTML tags
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
