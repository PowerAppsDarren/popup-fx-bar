# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL SECURITY NOTICE

**THIS CODE HAS A CRITICAL XSS VULNERABILITY** (Lines 86-89)
- Must fix `document.write()` usage before any production use
- See `ROADMAP.md` Phase 1 for immediate fixes required
- Current status: **Phase 1 - Security Fixes In Progress**

## Project Overview

This is a browser extension/bookmarklet for Microsoft PowerApps that creates a popup formula editor. It works by injecting JavaScript into the PowerApps interface to access the Monaco editor instance and provide a separate editing window.

## Current Implementation Status

📊 **Overall Progress**: 10% (Phase 1 of 5)

### Working Features ✅
- React Fiber traversal to find Monaco editor
- Basic popup window creation
- Bidirectional text synchronization
- Property change detection

### Critical Issues 🔴
1. **XSS Vulnerability** - `document.write()` usage
2. **No null/undefined checks** - Causes crashes
3. **Silent error suppression** - Hides failures
4. **Memory leaks** - No proper cleanup
5. **No input debouncing** - Performance issues

See `docs/code-review-and-improvements.md` for detailed analysis and `ROADMAP.md` for fix timeline.

## Architecture

The main functionality is contained in `PowerApps_PopupFormulaBar.js`:

1. **React Fiber Traversal**: The code searches for the Monaco editor by traversing React's internal fiber structure starting from the `#formulabar` element
2. **Model Detection**: Identifies the formula editor model by checking for specific methods (`getValue`, `setValue`, `doesFxEditorHaveMultipleLines`)
3. **Popup Window Sync**: Creates a popup window with a textarea that syncs bidirectionally with the Monaco editor
4. **Property Change Handling**: Tracks changes to the selected property and handles synchronization events

## Key Components

- **getFxEditorModel()**: Traverses React internals to find the Monaco editor instance
- **Model sync**: Uses `onDidChangeModelContent` to monitor changes and sync between popup and main editor
- **Cleanup**: Monitors popup window status and disposes event listeners when closed

## Development Priorities

### Immediate (Phase 1 - TODAY)
1. Fix XSS vulnerability (replace `document.write()`)
2. Add null/undefined checks
3. Implement proper error handling
4. Create user-friendly error messages

### Next Week (Phase 2)
1. Fix memory leaks
2. Add input debouncing
3. Prevent race conditions
4. Optimize performance

### Future (Phase 3-5)
- Modularize code architecture
- Add comprehensive testing
- Implement configuration system
- Create browser extension package

## Development Commands

Since this is a JavaScript bookmarklet/extension without a build system:

```bash
# No build/test commands - this is a standalone JavaScript file
# To use: Copy PowerApps_PopupFormulaBar.js content to browser console

# Git commands for version control
git status
git diff
git add .
git commit -m "message"

# View documentation
cat docs/code-review-and-improvements.md  # Detailed code review
cat ROADMAP.md                           # Implementation roadmap
```

## Usage

1. Open PowerApps in browser
2. Right-click and select "Inspect" to open developer tools
3. Navigate to Console tab
4. Paste the contents of `PowerApps_PopupFormulaBar.js`
5. A popup window will open with the formula editor

## Important Notes

⚠️ **WARNINGS**:
- Contains critical security vulnerability - DO NOT use in production yet
- The code relies on React internals which may change between PowerApps versions
- No error recovery - crashes silently on failures

📝 **Configuration**:
- Maximum traversal depth is set to 20 to prevent infinite loops
- Window references are stored globally: `window.fxModel`, `window.fxSelector`
- Debug logging can be enabled via `window.POPUP_BAR_LOGGING = true`

## Testing Checklist

When making changes, ensure:
- [ ] No `document.write()` usage
- [ ] All property accesses have null checks
- [ ] Errors are logged, not silently suppressed
- [ ] Memory cleanup on popup close
- [ ] Debounced input handlers
- [ ] Works in Chrome, Edge, Firefox
- [ ] No console errors in normal usage

## File Structure

```
/
├── PowerApps_PopupFormulaBar.js    # Main implementation (needs security fixes)
├── ROADMAP.md                       # Implementation phases and timeline
├── CLAUDE.md                        # This file - AI assistant guidance
├── README.md                        # User-facing documentation
└── docs/
    └── code-review-and-improvements.md  # Comprehensive code analysis
```