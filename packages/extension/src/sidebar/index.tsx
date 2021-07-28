import { render } from 'preact/compat';
import React, { useEffect, useState } from 'react';
import './styles.css';

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
  const [result, setResult] = useState({
    errors: [],
    passes: [],
    fixes: [],
    warnings: [],
  });

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

  return (
    <div className="a11y-sidebar-pane">
      <Section
        title="Errors"
        results={result.errors}
        className="error-section"
      />
      <Section
        title="Warnings"
        results={result.warnings}
        className="warning-section"
      />
      <Section title="Fixes" results={result.fixes} className="fix-section" />
      <Section
        title="Passes"
        results={result.passes}
        className="pass-section"
      />
    </div>
  );
}

function Section({
  title,
  results,
  className,
}: {
  title: string;
  results: { message: string; name: string }[];
  className: string;
}) {
  return (
    <section>
      <h3>{title}</h3>
      <ul className={className}>
        {results.map(result => (
          <li>
            <p className="rule-name">{result.name}</p>
            <p>{result.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

render(<App />, document.getElementById('app')!);
