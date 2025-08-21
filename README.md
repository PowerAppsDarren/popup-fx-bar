# PowerApps Popup Formula Bar

A browser extension/bookmarklet that creates a popup formula editor for Microsoft PowerApps, providing a larger editing window for complex Power Fx formulas.

## ⚠️ Security Notice

**CRITICAL**: This code contains a security vulnerability (XSS) that must be fixed before production use. See [ROADMAP.md](ROADMAP.md) for implementation status and required fixes.

**Current Status**: 🔴 Phase 1 - Security Fixes In Progress (10% complete)

## 📋 Quick Links

- [📊 Implementation Roadmap](ROADMAP.md) - Current status and timeline
- [📝 Detailed Code Review](docs/code-review-and-improvements.md) - Comprehensive analysis and fixes
- [🔧 Development Guide](CLAUDE.md) - Technical documentation for contributors

## 🚀 How to Use

1. Right click in the PowerApps user interface
2. Select `Inspect` (Important: This ensures you're in the correct `iframe` context)
3. Navigate to the Console tab
4. Copy and paste the contents of `PowerApps_PopupFormulaBar.js` into the console
5. A popup window will open with your formula editor

[![Watch the demo](https://img.youtube.com/vi/JW5jcPhGYLs/hqdefault.jpg)](https://youtu.be/JW5jcPhGYLs)

## 🔧 How It Works

1. **Searches** for the Monaco editor within the `__reactInternalInstance` variable on the formula bar element
2. **Identifies** the Monaco editor by its unique method `doesFxEditorHaveMultipleLines`
3. **Creates** a popup window with a synchronized textarea
4. **Syncs** bidirectionally using `getValue()` and `setValue()` methods

## ✅ Features

- 📝 Larger editing area for complex formulas
- 🔄 Real-time bidirectional synchronization
- 🎯 Automatic property change detection
- 🪟 Resizable popup window

## 🚨 Known Issues

1. **Security Vulnerability** - XSS risk with `document.write()`
2. **Stability Issues** - Can crash with undefined properties
3. **Performance** - No input debouncing on large formulas
4. **Memory Leaks** - Improper cleanup of event listeners
5. **Browser Support** - No fallback for popup blockers

See [ROADMAP.md](ROADMAP.md) for detailed fix timeline.

## 🗺️ Development Roadmap

### Phase 1: Critical Security (In Progress)
- Fix XSS vulnerability
- Add error handling
- Implement null checks

### Phase 2: Performance (Next Week)
- Fix memory leaks
- Add input debouncing
- Optimize sync logic

### Phase 3-5: Architecture & Features (Future)
- Modularize codebase
- Add testing framework
- Create browser extension
- Implement advanced features

Full roadmap with timeline: [ROADMAP.md](ROADMAP.md)

## 🛠️ Development

### Prerequisites
- Microsoft PowerApps access
- Modern browser (Chrome, Edge, Firefox)
- Developer tools enabled

### Debug Mode
Enable debug logging:
```javascript
window.POPUP_BAR_LOGGING = true;
```

### Testing Checklist
- [ ] No security vulnerabilities
- [ ] Handles all errors gracefully
- [ ] No memory leaks after extended use
- [ ] Works across browsers
- [ ] Syncs accurately without data loss

## 📁 Project Structure

```
/
├── PowerApps_PopupFormulaBar.js    # Main implementation
├── README.md                        # This file
├── ROADMAP.md                       # Implementation phases
├── CLAUDE.md                        # AI assistant guidance
└── docs/
    └── code-review-and-improvements.md  # Detailed analysis
```

## ⚖️ License

This project is provided as-is for educational purposes. Use at your own risk, especially given the current security issues.

## 🤝 Contributing

Contributions are welcome! Priority areas:
1. Security fixes (Phase 1)
2. Performance improvements (Phase 2)
3. Code modularization (Phase 3)
4. Testing implementation (Phase 4)

Please review [ROADMAP.md](ROADMAP.md) and [CLAUDE.md](CLAUDE.md) before contributing.

## ⚠️ Disclaimer

This tool modifies the PowerApps interface through browser injection. It:
- Is not officially supported by Microsoft
- May break with PowerApps updates
- Should not be used in production until security fixes are complete
- Requires careful testing in your environment

## 📞 Support

For issues or questions:
1. Check the [detailed code review](docs/code-review-and-improvements.md)
2. Review the [roadmap](ROADMAP.md) for planned fixes
3. Open an issue with reproduction steps

---

**Remember**: Do not use in production until Phase 1 security fixes are complete!