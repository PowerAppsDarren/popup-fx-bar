/**
 * PowerApps Formula Editor - Popup Editor Script
 */

(function() {
  'use strict';

  // DOM Elements
  const elements = {
    editor: document.getElementById('formula-editor'),
    propertyName: document.getElementById('property-name'),
    status: document.getElementById('status'),
    charCount: document.getElementById('char-count'),
    lineInfo: document.getElementById('line-info'),
    syncStatus: document.getElementById('sync-status'),
    lastSaved: document.getElementById('last-saved'),
    fontSize: document.getElementById('font-size'),
    searchModal: document.getElementById('search-modal'),
    searchInput: document.getElementById('search-input'),
    replaceInput: document.getElementById('replace-input')
  };

  // State
  let state = {
    property: 'Formula',
    lastValue: '',
    isConnected: true,
    isSyncing: false,
    debounceTimer: null,
    settings: {
      fontSize: 14,
      wordWrap: false,
      debounceDelay: 300
    }
  };

  /**
   * Initialize the editor
   */
  function initialize(data) {
    console.log('Initializing editor with data:', data);
    
    if (data.value !== undefined) {
      elements.editor.value = data.value;
      state.lastValue = data.value;
    }
    
    if (data.property) {
      state.property = data.property;
      elements.propertyName.textContent = `Property: ${data.property}`;
    }
    
    if (data.settings) {
      state.settings = { ...state.settings, ...data.settings };
      applySettings();
    }
    
    updateStatus();
    updateCharCount();
    updateLineInfo();
  }

  /**
   * Apply settings to editor
   */
  function applySettings() {
    elements.editor.style.fontSize = `${state.settings.fontSize}px`;
    elements.fontSize.value = state.settings.fontSize;
    
    if (state.settings.wordWrap) {
      elements.editor.classList.add('wrap');
    } else {
      elements.editor.classList.remove('wrap');
    }
  }

  /**
   * Update editor status
   */
  function updateStatus() {
    if (state.isConnected) {
      elements.status.textContent = 'Connected';
      elements.status.classList.remove('disconnected');
    } else {
      elements.status.textContent = 'Disconnected';
      elements.status.classList.add('disconnected');
    }
    
    if (state.isSyncing) {
      elements.syncStatus.textContent = 'Syncing...';
      elements.syncStatus.classList.add('syncing');
    } else {
      elements.syncStatus.textContent = 'Synced';
      elements.syncStatus.classList.remove('syncing');
    }
  }

  /**
   * Update character count
   */
  function updateCharCount() {
    const count = elements.editor.value.length;
    elements.charCount.textContent = `${count} chars`;
  }

  /**
   * Update line and column info
   */
  function updateLineInfo() {
    const text = elements.editor.value;
    const selectionStart = elements.editor.selectionStart;
    
    let line = 1;
    let col = 1;
    
    for (let i = 0; i < selectionStart; i++) {
      if (text[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    
    elements.lineInfo.textContent = `Ln ${line}, Col ${col}`;
  }

  /**
   * Debounced sync to model
   */
  function syncToModel(value) {
    // Clear existing timer
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }
    
    // Show syncing status
    state.isSyncing = true;
    updateStatus();
    
    // Debounce the sync
    state.debounceTimer = setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'syncToModel',
        value: value
      }, (response) => {
        state.isSyncing = false;
        updateStatus();
        elements.lastSaved.textContent = `Saved ${new Date().toLocaleTimeString()}`;
      });
    }, state.settings.debounceDelay);
  }

  /**
   * Handle updates from model
   */
  function handleModelUpdate(value) {
    if (value !== state.lastValue) {
      // Save cursor position
      const cursorPos = elements.editor.selectionStart;
      const cursorEnd = elements.editor.selectionEnd;
      
      // Update value
      elements.editor.value = value;
      state.lastValue = value;
      
      // Restore cursor position if possible
      if (cursorPos <= value.length) {
        elements.editor.setSelectionRange(cursorPos, cursorEnd);
      }
      
      updateCharCount();
      updateLineInfo();
    }
  }

  /**
   * Event Listeners
   */
  
  // Editor input
  elements.editor.addEventListener('input', (e) => {
    const newValue = e.target.value;
    
    if (newValue !== state.lastValue) {
      state.lastValue = newValue;
      syncToModel(newValue);
      updateCharCount();
    }
  });

  // Cursor movement
  elements.editor.addEventListener('keyup', updateLineInfo);
  elements.editor.addEventListener('click', updateLineInfo);

  // Font size change
  elements.fontSize.addEventListener('change', (e) => {
    state.settings.fontSize = parseInt(e.target.value);
    applySettings();
    
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: { fontSize: state.settings.fontSize }
    });
  });

  // Toolbar buttons
  document.getElementById('undo-btn').addEventListener('click', () => {
    document.execCommand('undo');
  });

  document.getElementById('redo-btn').addEventListener('click', () => {
    document.execCommand('redo');
  });

  document.getElementById('copy-btn').addEventListener('click', () => {
    elements.editor.select();
    document.execCommand('copy');
  });

  document.getElementById('paste-btn').addEventListener('click', () => {
    elements.editor.focus();
    document.execCommand('paste');
  });

  document.getElementById('wrap-btn').addEventListener('click', () => {
    state.settings.wordWrap = !state.settings.wordWrap;
    applySettings();
  });

  document.getElementById('search-btn').addEventListener('click', () => {
    elements.searchModal.classList.remove('hidden');
    elements.searchInput.focus();
  });

  document.getElementById('replace-btn').addEventListener('click', () => {
    elements.searchModal.classList.remove('hidden');
    elements.searchInput.focus();
  });

  // Search/Replace modal
  document.querySelector('.close-modal').addEventListener('click', () => {
    elements.searchModal.classList.add('hidden');
  });

  document.getElementById('find-next').addEventListener('click', () => {
    const searchText = elements.searchInput.value;
    if (!searchText) return;
    
    const text = elements.editor.value;
    const start = elements.editor.selectionEnd;
    const index = text.indexOf(searchText, start);
    
    if (index !== -1) {
      elements.editor.setSelectionRange(index, index + searchText.length);
      elements.editor.focus();
    } else {
      // Wrap around to beginning
      const wrapIndex = text.indexOf(searchText);
      if (wrapIndex !== -1) {
        elements.editor.setSelectionRange(wrapIndex, wrapIndex + searchText.length);
        elements.editor.focus();
      }
    }
  });

  document.getElementById('replace-one').addEventListener('click', () => {
    const searchText = elements.searchInput.value;
    const replaceText = elements.replaceInput.value;
    if (!searchText) return;
    
    const selection = elements.editor.value.substring(
      elements.editor.selectionStart,
      elements.editor.selectionEnd
    );
    
    if (selection === searchText) {
      document.execCommand('insertText', false, replaceText);
    }
  });

  document.getElementById('replace-all').addEventListener('click', () => {
    const searchText = elements.searchInput.value;
    const replaceText = elements.replaceInput.value;
    if (!searchText) return;
    
    const newValue = elements.editor.value.split(searchText).join(replaceText);
    elements.editor.value = newValue;
    state.lastValue = newValue;
    syncToModel(newValue);
    updateCharCount();
  });

  // Header buttons
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openSettings' });
  });

  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  document.getElementById('close-btn').addEventListener('click', () => {
    window.close();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (no-op, auto-saves)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      elements.lastSaved.textContent = `Saved ${new Date().toLocaleTimeString()}`;
    }
    
    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      elements.searchModal.classList.remove('hidden');
      elements.searchInput.focus();
    }
    
    // Ctrl/Cmd + H for replace
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      elements.searchModal.classList.remove('hidden');
      elements.replaceInput.focus();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
      elements.searchModal.classList.add('hidden');
    }
  });

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Editor received message:', request.action);
    
    switch (request.action) {
      case 'initialize':
        initialize(request);
        sendResponse({ success: true });
        break;
        
      case 'updateFromModel':
        handleModelUpdate(request.value);
        sendResponse({ success: true });
        break;
        
      case 'updateContent':
        elements.editor.value = request.value;
        state.lastValue = request.value;
        if (request.property) {
          state.property = request.property;
          elements.propertyName.textContent = `Property: ${request.property}`;
        }
        updateCharCount();
        updateLineInfo();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  });

  /**
   * Handle window unload
   */
  window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ action: 'closeEditor' });
  });

  /**
   * Initialize on load
   */
  elements.editor.focus();
  updateCharCount();
  updateLineInfo();

  console.log('Formula editor loaded');
})();