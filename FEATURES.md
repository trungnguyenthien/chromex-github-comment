# GitHub PR Review Assistant - Features Overview

A Chrome extension that helps you store and quickly insert pre-written comment templates when reviewing Pull Requests on GitHub. Template comments are automatically organized by repository.

---

## Core Features

### 1. Automatic Side Panel
- The side panel automatically opens on the right side of the screen when you navigate to the **"Files changed"** tab of a Pull Request on GitHub.

### 2. Repository-Based Template Organization
- Each repository has its own dedicated list of comment templates.
- When you switch browser tabs or change repositories, the template list in the side panel automatically updates to match the current project.
- The template panel automatically hides when browsing non-GitHub repositories.

### 3. One-Click Comment Insertion
- Click any template in the list to automatically insert its content into the GitHub comment box.
- Automatically adds a new line if the comment box already contains text.
- Syncs the state to immediately enable GitHub's submit buttons.

### 4. Template Management (Add, Edit, Delete)
- **Add new template:** Click the **"Add Template"** button to open the input form. You can set a name, enter template content, and choose a color label.
- **Edit template:** Click the pencil icon (✏️) on any card to load the existing data into the form for editing.
- **Delete template:** Click the trash icon (🗑️) to remove the template from the list.

### 5. Alphabetical Sorting (A-Z)
- Templates are automatically sorted alphabetically (supports Vietnamese and emojis).

### 6. Import and Export JSON
- **Export:** Download the current repository's template list as a JSON file to your computer.
- **Import:** Select a JSON file from your computer to load templates into the current repository. Duplicate names will overwrite existing templates; new names will be added to the list.

---

## Installation

1. Navigate to `chrome://extensions/` in Google Chrome.
2. Enable **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** in the top left.
4. Select the extension folder:
   ```
   /Users/trungnguyen/iCloud Drive (Archive)/Documents/DocumentsTrungNguyen/Github/chromex-github-comment
   ```
5. Pin the extension to your browser toolbar for easy access.

---

## Technical Details

- **Manifest Version:** 3
- **Permissions:** sidePanel, activeTab, tabs, scripting, storage
- **Host Access:** github.com/*
- **Files:**
  - `manifest.json` - Extension configuration
  - `background.js` - Service worker for background logic
  - `content.js` - Content script for GitHub page interaction
  - `sidepanel.js` - Side panel logic
  - `sidepanel.html` - Side panel UI
  - `sidepanel.css` - Side panel styles

---

## Version

Current version: 1.0.0