/**
 * PowerApps Formula Editor - Content Script
 * Secure version with all critical fixes applied
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    maxTraversalDepth: 20,
    debounceDelay: 300,
    debug: false
  };

  // State management
  let monacoModel = null;
  let propertySelector = null;
  let isEditorOpen = false;
  let syncManager = null;

  /**
   * Safely log messages when debug is enabled
   */
  function debugLog(...args) {
    if (CONFIG.debug || window.POPUP_BAR_LOGGING) {
      console.log('[Formula Editor]', ...args);
    }
  }

  /**
   * Show user-friendly error messages
   */
  function showError(message, details = '') {
    console.error('[Formula Editor Error]', message, details);
    
    // Send error to background script for notification
    chrome.runtime.sendMessage({
      action: 'showError',
      message: message,
      details: details
    });
  }

  /**
   * Safe property access with fallback
   */
  function safeGet(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch (error) {
      debugLog('Safe get error:', error);
      return defaultValue;
    }
  }

  /**
   * Check if object is a Monaco model
   */
  function isMonacoModel(obj) {
    try {
      return (
        obj &&
        typeof obj.getValue === 'function' &&
        typeof obj.setValue === 'function' &&
        typeof obj.doesFxEditorHaveMultipleLines === 'function'
      );
    } catch (error) {
      debugLog('Model check error:', error);
      return false;
    }
  }

  /**
   * Find Monaco editor model using React Fiber traversal
   */
  function findMonacoModel() {
    debugLog('Searching for Monaco editor...');
    
    // Find formula bar element
    const formulaBar = document.querySelector('#formulabar');
    if (!formulaBar) {
      debugLog('Formula bar not found');
      return null;
    }

    // Find React Fiber
    const fiberKey = Object.keys(formulaBar).find(k => 
      k.startsWith('__reactInternalInstance')
    );
    
    if (!fiberKey) {
      debugLog('React Fiber not found');
      return null;
    }

    const fiber = formulaBar[fiberKey];
    if (!fiber) {
      debugLog('Fiber is null');
      return null;
    }

    // Traverse Fiber tree with safety checks
    const visited = new WeakSet();
    const stack = [{ value: fiber, depth: 0 }];
    
    while (stack.length > 0) {
      const { value: current, depth } = stack.pop();
      
      // Safety checks
      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }
      
      if (depth > CONFIG.maxTraversalDepth) {
        debugLog('Max depth reached');
        break;
      }
      
      visited.add(current);
      
      // Check if this is the Monaco model
      if (isMonacoModel(current)) {
        debugLog('Monaco model found!');
        return current;
      }
      
      // Safely explore properties
      const keysToExplore = ['return', 'child', 'sibling', 'stateNode', 'memoizedProps', 'memoizedState'];
      
      for (const key of keysToExplore) {
        try {
          const val = current[key];
          if (val && typeof val === 'object') {
            stack.push({ value: val, depth: depth + 1 });
          }
        } catch (error) {
          // Some properties may throw on access
          debugLog(`Cannot access property ${key}:`, error.message);
        }
      }
      
      // Check nested objects
      try {
        Object.keys(current).forEach(key => {
          if (!keysToExplore.includes(key)) {
            try {
              const val = current[key];
              if (val && typeof val === 'object' && !visited.has(val)) {
                stack.push({ value: val, depth: depth + 1 });
              }
            } catch (error) {
              // Property access error - continue
            }
          }
        });
      } catch (error) {
        // Object.keys may fail on some objects
        debugLog('Cannot enumerate keys:', error.message);
      }
    }
    
    debugLog('Monaco model not found after traversal');
    return null;
  }

  /**
   * Get the currently selected property
   */
  function getSelectedProperty() {
    try {
      const selector = document.querySelector('#powerapps-property-combo-box');
      if (!selector) {
        debugLog('Property selector not found');
        return null;
      }
      
      const value = selector.getAttribute('value');
      if (value === null) {
        debugLog('No value attribute on property selector');
        return null;
      }
      
      return value;
    } catch (error) {
      debugLog('Error getting selected property:', error);
      return null;
    }
  }

  /**
   * Initialize the extension
   */
  function initialize() {
    debugLog('Initializing Formula Editor extension...');
    
    // Find Monaco model
    monacoModel = findMonacoModel();
    if (!monacoModel) {
      showError('Formula editor not found', 'Please ensure you are on a PowerApps editing page and try again.');
      return false;
    }
    
    // Get property selector
    propertySelector = document.querySelector('#powerapps-property-combo-box');
    
    debugLog('Initialization successful');
    return true;
  }

  /**
   * Open the formula editor
   */
  function openEditor() {
    if (isEditorOpen) {
      debugLog('Editor already open');
      chrome.runtime.sendMessage({ action: 'focusEditor' });
      return;
    }
    
    if (!monacoModel && !initialize()) {
      return;
    }
    
    const currentValue = monacoModel.getValue();
    const currentProperty = getSelectedProperty();
    
    debugLog('Opening editor with value length:', currentValue.length);
    
    // Send message to background script to open editor window
    chrome.runtime.sendMessage({
      action: 'openEditor',
      data: {
        value: currentValue,
        property: currentProperty
      }
    }, (response) => {
      // Check for Chrome runtime errors
      if (chrome.runtime.lastError) {
        debugLog('Chrome runtime error:', chrome.runtime.lastError);
        showError('Failed to open editor', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        isEditorOpen = true;
        setupSync();
      } else {
        showError('Failed to open editor', response?.error || 'Unknown error');
      }
    });
  }

  /**
   * Setup bidirectional sync
   */
  function setupSync() {
    if (syncManager) {
      syncManager.dispose();
    }
    
    syncManager = new SyncManager(monacoModel);
    syncManager.start();
  }

  /**
   * Sync manager class
   */
  class SyncManager {
    constructor(model) {
      this.model = model;
      this.listeners = [];
      this.lastValue = model.getValue();
      this.lastProperty = getSelectedProperty();
      this.disposed = false;
    }
    
    start() {
      debugLog('Starting sync manager');
      
      // Listen for model changes
      const modelListener = this.model.onDidChangeModelContent((event) => {
        if (this.disposed) return;
        
        const newValue = this.model.getValue();
        if (newValue !== this.lastValue) {
          this.lastValue = newValue;
          this.sendUpdate(newValue);
        }
      });
      
      this.listeners.push(modelListener);
      
      // Listen for property changes
      this.propertyCheckInterval = setInterval(() => {
        if (this.disposed) return;
        
        const currentProperty = getSelectedProperty();
        if (currentProperty !== this.lastProperty) {
          debugLog('Property changed:', this.lastProperty, '->', currentProperty);
          this.lastProperty = currentProperty;
          this.handlePropertyChange();
        }
      }, 500);
      
      // Listen for updates from popup
      this.messageListener = (request, sender, sendResponse) => {
        if (this.disposed) return;
        
        if (request.action === 'updateValue') {
          this.receiveUpdate(request.value);
          sendResponse({ success: true });
        } else if (request.action === 'editorClosed') {
          this.dispose();
          isEditorOpen = false;
          sendResponse({ success: true });
        }
      };
      
      chrome.runtime.onMessage.addListener(this.messageListener);
    }
    
    sendUpdate(value) {
      chrome.runtime.sendMessage({
        action: 'syncToEditor',
        value: value
      });
    }
    
    receiveUpdate(value) {
      if (value !== this.lastValue) {
        this.lastValue = value;
        try {
          this.model.setValue(value);
        } catch (error) {
          debugLog('Error setting model value:', error);
        }
      }
    }
    
    handlePropertyChange() {
      // Resync with new property value
      this.lastValue = this.model.getValue();
      this.sendUpdate(this.lastValue);
    }
    
    dispose() {
      debugLog('Disposing sync manager');
      this.disposed = true;
      
      // Clean up listeners
      this.listeners.forEach(listener => {
        if (listener && listener.dispose) {
          listener.dispose();
        }
      });
      
      if (this.propertyCheckInterval) {
        clearInterval(this.propertyCheckInterval);
      }
      
      if (this.messageListener) {
        chrome.runtime.onMessage.removeListener(this.messageListener);
      }
      
      syncManager = null;
    }
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debugLog('Received message:', request.action);
    
    switch (request.action) {
      case 'toggleEditor':
        if (isEditorOpen) {
          chrome.runtime.sendMessage({ action: 'closeEditor' });
        } else {
          openEditor();
        }
        sendResponse({ success: true });
        break;
        
      case 'openEditor':
        openEditor();
        sendResponse({ success: true });
        break;
        
      case 'ping':
        // Health check
        sendResponse({ 
          alive: true, 
          hasModel: !!monacoModel,
          isEditorOpen: isEditorOpen 
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  });

  /**
   * Initialize on page load with retry logic
   */
  function tryInitialize() {
    // Don't auto-initialize, wait for user action
    debugLog('Content script ready, waiting for user action');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInitialize);
  } else {
    // Ready immediately
    tryInitialize();
  }

  debugLog('Content script loaded');
})();