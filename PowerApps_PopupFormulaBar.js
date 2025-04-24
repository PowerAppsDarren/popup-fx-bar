(function openFormulaEditorPopup() {
  const getFxEditorModel = () => {
    const el = document.querySelector("#formulabar");
    if (!el) return console.warn('No element with ID "formulabar" found.'), null;

    const fiberKey = Object.keys(el).find(k => k.startsWith('__reactInternalInstance'));
    if (!fiberKey) return console.warn('No React internal instance found.'), null;

    let fiber = el[fiberKey];
    const visited = new Set();
    const MAX_DEPTH = 20;

    const isFxEditorModel = (obj) => {
      try {
        return (
          obj &&
          typeof obj.getValue === 'function' &&
          typeof obj.setValue === 'function' &&
          typeof obj.doesFxEditorHaveMultipleLines === 'function'
        );
      } catch {
        return false;
      }
    };

    const deepScan = (root, depth = 0) => {
      const stack = [{ value: root, depth }];
      const seen = new WeakSet();

      while (stack.length) {
        const { value: current, depth } = stack.pop();
        if (!current || typeof current !== 'object' || seen.has(current)) continue;
        seen.add(current);

        if (isFxEditorModel(current)) return current;

        if (depth < MAX_DEPTH) {
          for (const key in current) {
            try {
              const val = current[key];
              if (typeof val === 'object' && val !== null) {
                stack.push({ value: val, depth: depth + 1 });
              }
            } catch {}
          }
        }
      }

      return null;
    };

    while (fiber && !visited.has(fiber)) {
      visited.add(fiber);
      const sources = [fiber.memoizedState, fiber.memoizedProps, fiber.stateNode];

      for (const src of sources) {
        if (src && typeof src === 'object') {
          const model = deepScan(src);
          if (model) return model;
        }
      }

      fiber = fiber.return;
    }

    return null;
  };

  const model = getFxEditorModel();
  if (!model) return alert("Formula model not found.");

  const popup = window.open("", "FormulaPopup", "width=800,height=400");
  popup.document.write(`
    <title>Formula Editor</title>
    <textarea id="formulaInput" style="width:100%; height:100%; font-family:monospace; font-size:14px;"></textarea>
  `);

  const textarea = popup.document.getElementById("formulaInput");

  // Initial content
  textarea.value = model.getValue();

  // Send changes to Monaco on input
  textarea.addEventListener("input", () => {
    model.setValue(textarea.value);
  });

  // Sync back if edited externally in Power Apps (poll-based)
  const syncInterval = setInterval(() => {
    if (popup.closed) return clearInterval(syncInterval);
    const current = model.getValue();
    if (textarea.value !== current) {
      textarea.value = current;
    }
  }, 200); // adjust for perf/speed trade-off
})();
