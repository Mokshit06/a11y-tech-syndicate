import { h, Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import create from 'zustand';
import './app.css';

type AccessibilityStats = {
  errors: string[];
  warnings: string[];
  fixes: string[];
  addError(error: string): void;
  addWarning(warning: string): void;
  addFix(fix: string): void;
};

const useAccessibilityStats = create<AccessibilityStats>(set => ({
  errors: [],
  warnings: [],
  fixes: [],
  addError(error) {
    set(state => ({
      ...state,
      errors: [...state.errors, error],
    }));
  },
  addWarning(warning) {
    set(state => ({
      ...state,
      warnings: [...state.warnings, warning],
    }));
  },
  addFix(fix) {
    set(state => ({
      ...state,
      fixes: [...state.fixes, fix],
    }));
  },
}));

const id = chrome.devtools.inspectedWindow.tabId;

const bgConnection = chrome.runtime.connect({
  name: id ? id.toString() : undefined,
});

export default function App() {
  const { errors, fixes, warnings } = useAccessibilityStats();

  const handleMessage = (message: any, port: chrome.runtime.Port) => {
    console.log({ message, port });
    switch (message.type) {
      case 'error': {
        console.log('error', message);
      }
      case 'fix': {
        console.log('fix', message);
      }
      case 'warning': {
        console.log('warning', message);
      }
    }
  };

  useEffect(() => {
    bgConnection.onMessage.addListener(handleMessage);

    return () => {
      bgConnection.onMessage.removeListener(handleMessage);
    };
  });

  return (
    <div>
      <div>
        <h1>Errors</h1>
        {errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </div>
      <div>
        <h1>Warnings</h1>
        {warnings.map((warning, index) => (
          <p key={index}>{warning}</p>
        ))}
      </div>
      <div>
        <h1>Fixes</h1>
        {fixes.map((fix, index) => (
          <p key={index}>{fix}</p>
        ))}
      </div>
    </div>
  );
}
