# 🧪 Chrome Extension Testing Guide

## 🚀 Quick Start - Load Extension in Developer Mode

### Step 1: Prepare the Extension
```bash
# Navigate to project directory
cd popup-fx-bar

# Ensure extension files are ready
ls extension/
# Should show: manifest.json, background.js, content-script.js, popup/, icons/, options/
```

### Step 2: Load in Chrome/Edge

#### Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **"Developer mode"** ON (top right corner)
3. Click **"Load unpacked"** button
4. Select the `extension/` folder from your project
5. The extension should appear with ID and "Fx" icon

#### Microsoft Edge:
1. Open Edge and navigate to `edge://extensions/`
2. Toggle **"Developer mode"** ON (left sidebar)
3. Click **"Load unpacked"** button
4. Select the `extension/` folder from your project
5. The extension should appear in the list

### Step 3: Test the Extension

1. **Navigate to PowerApps**
   - Go to https://make.powerapps.com
   - Open any app in edit mode

2. **Activate the Extension**
   - Click the "Fx" icon in the toolbar
   - Or use keyboard shortcut: `Ctrl+Shift+F` (Windows) / `Cmd+Shift+F` (Mac)
   - Or right-click and select "Open Formula Editor" from context menu

3. **Verify Functionality**
   - A popup editor window should open
   - The current formula should be displayed
   - Try typing - changes should sync to PowerApps
   - Try editing in PowerApps - changes should sync to popup

---

## 🔍 Debugging Tools

### 1. Background Script Console
- In `chrome://extensions/`, find your extension
- Click "service worker" link
- Opens DevTools for background script
- Check for initialization messages

### 2. Content Script Console
- Open PowerApps page
- Press F12 to open DevTools
- Go to Console tab
- Look for `[Formula Editor]` messages

### 3. Popup Window Console
- Right-click on the popup editor window
- Select "Inspect"
- Opens DevTools for popup
- Check for sync messages

### 4. Extension Errors
- Red "Errors" button appears in `chrome://extensions/` if issues exist
- Click to see detailed error messages

---

## ✅ Testing Checklist

### Initial Load
- [ ] Extension loads without errors in chrome://extensions
- [ ] Icon appears in Chrome toolbar
- [ ] Icon shows as active (colored) on PowerApps pages
- [ ] Icon shows as inactive (grayed) on non-PowerApps pages

### Content Script Injection
- [ ] Navigate to https://make.powerapps.com
- [ ] Open browser console (F12)
- [ ] Look for: `[Formula Editor] Content script loaded`
- [ ] Look for: `[Formula Editor] Initialization successful`

### Monaco Editor Detection
- [ ] Open any PowerApps app in edit mode
- [ ] Click on a control with formulas
- [ ] Click extension icon
- [ ] Should see: "Monaco model found!" in console
- [ ] Should NOT see: "Formula editor not found" error

### Popup Editor Window
- [ ] Click extension icon or press Ctrl+Shift+F
- [ ] Popup window opens (800x600 default)
- [ ] Current formula appears in editor
- [ ] Property name shows in header
- [ ] Status shows "Connected"

### Bidirectional Sync
- [ ] Type in popup editor → changes appear in PowerApps
- [ ] Type in PowerApps → changes appear in popup
- [ ] No infinite loops or freezing
- [ ] Debouncing works (300ms delay)

### Property Changes
- [ ] Select different property in PowerApps
- [ ] Popup should update with new formula
- [ ] Property name in header should change

### Error Handling
- [ ] Close PowerApps tab while popup open
- [ ] Status should show "Disconnected"
- [ ] No console errors

### Settings
- [ ] Click settings button in popup menu
- [ ] Options page opens
- [ ] Change font size → saves and applies
- [ ] Change window size → applies on next open

### Keyboard Shortcuts
- [ ] Ctrl+Shift+F opens editor
- [ ] Ctrl+S in editor shows "Saved" message
- [ ] Ctrl+F opens search modal
- [ ] Escape closes search modal

### Performance
- [ ] No memory leaks after 30 minutes use
- [ ] CPU usage remains low
- [ ] No lag with large formulas (1000+ chars)

---

## 🐛 Common Issues & Solutions

### Issue: "Formula editor not found"
**Solution:** 
- Ensure you're on a PowerApps editing page
- Click on a formula bar first
- Wait a few seconds for React to fully load
- Refresh the page and try again

### Issue: Extension icon doesn't appear
**Solution:**
- Check chrome://extensions/ for errors
- Ensure extension is enabled
- Click puzzle piece icon in toolbar → pin the extension

### Issue: Popup blocked
**Solution:**
- Check browser popup blocker settings
- Allow popups from chrome-extension:// URLs
- Try clicking extension icon instead of keyboard shortcut

### Issue: Sync not working
**Solution:**
- Check both consoles for errors
- Ensure you're on the same property
- Try refreshing PowerApps page
- Reload extension in chrome://extensions/

### Issue: Property changes not detected
**Solution:**
- This relies on DOM observation
- Some PowerApps updates may break this
- Check for `#powerapps-property-combo-box` element

---

## 📊 Performance Testing

### Memory Usage
1. Open Chrome Task Manager (Shift+Escape)
2. Find "Extension: PowerApps Formula Editor"
3. Monitor memory usage during:
   - Initial load: Should be < 20MB
   - Active editing: Should be < 50MB
   - After 1 hour: Should not grow significantly

### Response Time
1. Open Performance tab in DevTools
2. Start recording
3. Type in editor
4. Stop recording
5. Sync should complete within 300-500ms

---

## 🚢 Preparing for Production

Before submitting to Chrome Web Store:

1. **Generate Real Icons**
   ```bash
   # Convert SVG to PNG at required sizes
   # Tools: ImageMagick, online converters, or Figma
   # Required: 16x16, 32x32, 48x48, 128x128
   ```

2. **Test on Multiple Machines**
   - Different OS (Windows, Mac, Linux)
   - Different Chrome versions
   - Different screen resolutions

3. **Security Review**
   - No eval() or innerHTML usage ✅
   - Proper CSP headers ✅
   - Minimal permissions ✅
   - No external scripts ✅

4. **Create Screenshots**
   - 1280x800 or 640x400
   - Show extension in action
   - Highlight key features

5. **Write Store Description**
   - Clear value proposition
   - Feature list
   - Installation instructions
   - Support contact

---

## 📝 Test Log Template

```markdown
Date: YYYY-MM-DD
Tester: [Name]
Browser: Chrome/Edge [Version]
OS: [Windows/Mac/Linux]

Tests Performed:
- [ ] Initial load
- [ ] Monaco detection
- [ ] Popup creation
- [ ] Bidirectional sync
- [ ] Settings persistence

Issues Found:
1. [Description]
   - Steps to reproduce
   - Expected vs actual
   - Console errors

Notes:
[Any observations or suggestions]
```

---

## 🔄 Updating During Development

After making changes:

1. Save all files
2. Go to chrome://extensions/
3. Click "Reload" button on your extension
4. Refresh PowerApps page
5. Test changes

For background script changes:
- Click "service worker" link to terminate
- It will restart automatically

For content script changes:
- Must refresh the PowerApps page

For popup changes:
- Close and reopen the popup

---

## 🎯 Ready for Testing!

Your extension is now ready for testing. Follow the steps above to load it in Chrome/Edge and start testing with PowerApps. Remember to check the console logs for any errors and use the debugging tools to troubleshoot issues.

Good luck! 🚀