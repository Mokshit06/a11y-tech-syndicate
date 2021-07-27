import React, { useEffect, useState } from 'react';
import { render } from 'preact/compat';

declare const $0: HTMLElement;

function getA11yResult() {
  const a11yResult = {
    errors: [],
    passes: [],
    fixes: [],
    warnings: [],
  } as Record<string, any>;

  for (const [key, results] of Object.entries(
    window.__A11Y_EXTENSION__.state
  )) {
    for (const result of results) {
      if (result.nodes.includes($0)) {
        a11yResult[key].push({
          message: result.message,
          name: result.name,
        });
      }
    }
  }

  return a11yResult;
}

function App() {
  const [result, setResult] = useState({});

  const handleSelectionChange = () => {
    chrome.devtools.inspectedWindow.eval(
      `(${getA11yResult.toString()})()`,
      result => {
        setResult(result as any);
      }
    );
  };

  useEffect(() => {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(
      handleSelectionChange
    );

    return () => {
      chrome.devtools.panels.elements.onSelectionChanged.removeListener(
        handleSelectionChange
      );
    };
  }, []);

  return <pre style={{ color: 'red' }}>{JSON.stringify(result, null, 2)}</pre>;
}

render(<App />, document.getElementById('app')!);

export {};
