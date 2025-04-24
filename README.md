# How to use

1. Right click in the user interface
2. Select `inspect`. Note: This is important to ensure you pop into the `iframe` document stack.
3. Go to console.
4. Copy and paste the `PowerApps_PopupFormulaBar.js` code into the console.

[![Watch the demo](https://img.youtube.com/vi/JW5jcPhGYLs/hqdefault.jpg)](https://youtu.be/JW5jcPhGYLs)

# How it works

1. Searches for the monaco editor within the `__reactInternalInstance` var which is held on the monaco editor wrapper element.
2. The monaco editor itself has a function named `doesFxEditorHaveMultipleLines` making it easy-ish to find.
3. Open the popup window and sync with `getValue()` and `setValue()` methods
