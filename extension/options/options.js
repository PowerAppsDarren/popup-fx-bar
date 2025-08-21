// Load settings
chrome.storage.local.get('settings', (data) => {
  const settings = data.settings || {};
  
  document.getElementById('window-width').value = settings.windowWidth || 800;
  document.getElementById('window-height').value = settings.windowHeight || 600;
  document.getElementById('font-size').value = settings.fontSize || 14;
  document.getElementById('debounce-delay').value = settings.debounceDelay || 300;
});

// Save settings
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    windowWidth: parseInt(document.getElementById('window-width').value),
    windowHeight: parseInt(document.getElementById('window-height').value),
    fontSize: parseInt(document.getElementById('font-size').value),
    debounceDelay: parseInt(document.getElementById('debounce-delay').value)
  };
  
  chrome.storage.local.set({ settings }, () => {
    // Show saved message
    const savedMsg = document.getElementById('saved-message');
    savedMsg.style.display = 'inline';
    setTimeout(() => {
      savedMsg.style.display = 'none';
    }, 2000);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
  });
});