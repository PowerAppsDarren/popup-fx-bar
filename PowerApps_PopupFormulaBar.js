(function openFormulaEditorPopup() {
  const getFxEditorModel = () => {
    const el = document.querySelector("#formulabar");
    if (!el)
      return console.warn('No element with ID "formulabar" found.'), null;

    const fiberKey = Object.keys(el).find((k) =>
      k.startsWith("__reactInternalInstance")
    );
    if (!fiberKey)
      return console.warn("No React internal instance found."), null;

    let fiber = el[fiberKey];
    const visited = new Set();
    const MAX_DEPTH = 20;

    const isFxEditorModel = (obj) => {
      try {
        return (
          obj &&
          typeof obj.getValue === "function" &&
          typeof obj.setValue === "function" &&
          typeof obj.doesFxEditorHaveMultipleLines === "function"
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
        if (!current || typeof current !== "object" || seen.has(current))
          continue;
        seen.add(current);

        if (isFxEditorModel(current)) return current;

        if (depth < MAX_DEPTH) {
          for (const key in current) {
            try {
              const val = current[key];
              if (typeof val === "object" && val !== null) {
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
      const sources = [
        fiber.memoizedState,
        fiber.memoizedProps,
        fiber.stateNode,
      ];

      for (const src of sources) {
        if (src && typeof src === "object") {
          const model = deepScan(src);
          if (model) return model;
        }
      }

      fiber = fiber.return;
    }

    return null;
  };

  const model = getFxEditorModel();
  window.fxModel = model;
  window.fxSelector = document.querySelector("#powerapps-property-combo-box");
  window.POPUP_BAR_LOGGING = false;

  if (!model) return alert("Formula model not found.");

  const popup = window.open("", "FormulaPopup", "width=800,height=400");
  popup.document.write(`
    <title>Formula Editor</title>
    <textarea id="formulaInput" style="width:100%; height:100%; font-family:monospace; font-size:14px;"></textarea>
  `);

  const textarea = popup.document.getElementById("formulaInput");

  // Initial content
  textarea.value = model.getValue();

  let selectedProperty = window.fxSelector.attributes["value"].value;
  let ignoreChange = false;
  let disposeModelChange = model.onDidChangeModelContent((event) => {
    if (window.POPUP_BAR_LOGGING)
      console.info({ modelDidChangeContent: event });
    //Ignore changes when we are setting them ourselves
    if (ignoreChange) return;

    //Stop syncing after popup is closed
    if (popup.closed) return;

    //If isFlush is set, we will ignore changes to text area
    //and instead change set the Monaco value again (as this could
    //be a synchronisation event)
    if (event.isFlush) {
      //Only revert change IF selectedProperty hasnt changed.
      if (selectedProperty == window.fxSelector.attributes["value"].value) {
        //Update text area
        ignoreChange = true;
        model.setValue(textarea.value);
        ignoreChange = false;
        return;
      } else {
        selectedProperty = window.fxSelector.attributes["value"].value;
      }
    }

    //Update text area
    const current = model.getValue();
    if (textarea.value !== current) {
      textarea.value = current;
    }
  });

  // Send changes to Monaco on input
  textarea.addEventListener("input", () => {
    ignoreChange = true;
    model.setValue(textarea.value);
    ignoreChange = false;
  });

  //Cleanup if popup closes
  const cleanupInterval = setInterval(() => {
    if (popup.closed) {
      disposeModelChange.dispose();
      clearInterval(cleanupInterval);
    }
  }, 500);
})();
