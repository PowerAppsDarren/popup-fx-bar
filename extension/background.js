/**
 * PowerApps Formula Editor - Background Service Worker
 * Manages editor windows and message passing
 */

// State management
let editorWindow = null;
let editorTabId = null;
let currentFormula = '';
let settings = {
  windowWidth: 800,
  windowHeight: 600,
  theme: 'light',
  fontSize: 14,
  debounceDelay: 300
};

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const stored = await chrome.storage.local.get('settings');
    if (stored.settings) {
      settings = { ...settings, ...stored.settings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    await chrome.storage.local.set({ settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Create or focus the editor window
 */
async function createEditorWindow(data) {
  // Check if window already exists
  if (editorWindow && editorWindow.id) {
    try {
      // Try to focus existing window
      await chrome.windows.update(editorWindow.id, { focused: true });
      
      // Send new data to existing editor
      if (editorTabId) {
        chrome.tabs.sendMessage(editorTabId, {
          action: 'updateContent',
          value: data.value,
          property: data.property
        });
      }
      
      return { success: true };
    } catch (error) {
      // Window was closed, create new one
      editorWindow = null;
      editorTabId = null;
    }
  }
  
  // Create new window
  try {
    const window = await chrome.windows.create({
      url: chrome.runtime.getURL('popup/editor.html'),
      type: 'popup',
      width: settings.windowWidth,
      height: settings.windowHeight,
      left: 100,
      top: 100
    });
    
    editorWindow = window;
    editorTabId = window.tabs[0].id;
    currentFormula = data.value;
    
    // Wait for editor to load, then send initial data
    setTimeout(() => {
      chrome.tabs.sendMessage(editorTabId, {
        action: 'initialize',
        value: data.value,
        property: data.property,
        settings: settings
      });
    }, 500);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to create editor window:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Close the editor window
 */
async function closeEditorWindow() {
  if (editorWindow && editorWindow.id) {
    try {
      await chrome.windows.remove(editorWindow.id);
    } catch (error) {
      // Window already closed
    }
  }
  
  editorWindow = null;
  editorTabId = null;
  currentFormula = '';
}

/**
 * Send message to content script in active tab
 */
async function sendToContentScript(message) {
  try {
    const [tab] = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true,
      url: ['https://make.powerapps.com/*', 'https://make.preview.powerapps.com/*']
    });
    
    if (tab) {
      return await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (error) {
    console.error('Failed to send to content script:', error);
  }
}

/**
 * Handle messages from content script and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request.action);
  
  switch (request.action) {
    case 'openEditor':
      createEditorWindow(request.data).then(sendResponse);
      return true; // Keep channel open for async response
      
    case 'closeEditor':
      closeEditorWindow();
      sendToContentScript({ action: 'editorClosed' });
      sendResponse({ success: true });
      break;
      
    case 'focusEditor':
      if (editorWindow && editorWindow.id) {
        chrome.windows.update(editorWindow.id, { focused: true });
      }
      sendResponse({ success: true });
      break;
      
    case 'syncToEditor':
      // Forward to editor window
      if (editorTabId) {
        chrome.tabs.sendMessage(editorTabId, {
          action: 'updateFromModel',
          value: request.value
        });
      }
      break;
      
    case 'syncToModel':
      // Forward to content script
      sendToContentScript({
        action: 'updateValue',
        value: request.value
      });
      break;
      
    case 'showError':
      // Create notification for errors
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Formula Editor Error',
        message: request.message,
        contextMessage: request.details
      });
      break;
      
    case 'updateSettings':
      settings = { ...settings, ...request.settings };
      saveSettings();
      sendResponse({ success: true });
      break;
      
    case 'getSettings':
      sendResponse({ settings });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return false; // Synchronous response
});

/**
 * Handle keyboard shortcuts
 */
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  if (command === 'open-editor') {
    sendToContentScript({ action: 'openEditor' });
  }
});

/**
 * Handle window close events
 */
chrome.windows.onRemoved.addListener((windowId) => {
  if (editorWindow && editorWindow.id === windowId) {
    editorWindow = null;
    editorTabId = null;
    currentFormula = '';
    
    // Notify content script
    sendToContentScript({ action: 'editorClosed' });
  }
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on PowerApps
  if (tab.url.includes('make.powerapps.com') || tab.url.includes('make.preview.powerapps.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleEditor' });
  } else {
    // Show notification that we're not on PowerApps
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Formula Editor',
      message: 'Please navigate to PowerApps to use the formula editor.'
    });
  }
});

/**
 * Initialize on install
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('PowerApps Formula Editor installed');
  loadSettings();
  
  // Set up context menu (wrapped in try-catch for safety)
  try {
    chrome.contextMenus.create({
      id: 'open-formula-editor',
      title: 'Open Formula Editor',
      contexts: ['page'],
      documentUrlPatterns: [
        'https://make.powerapps.com/*',
        'https://make.preview.powerapps.com/*'
      ]
    }, () => {
      if (chrome.runtime.lastError) {
        console.log('Context menu creation error:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.log('Could not create context menu:', error);
  }
});

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-formula-editor') {
    chrome.tabs.sendMessage(tab.id, { action: 'openEditor' });
  }
});

/**
 * Initialize
 */
loadSettings();