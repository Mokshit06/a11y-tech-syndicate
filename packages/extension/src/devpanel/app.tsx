import { useEffect, useState } from 'preact/hooks';
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
  const [messages, setMessages] = useState<any[]>([]);
  const { errors, fixes, warnings } = useAccessibilityStats();

  const onClick = () => {
    bgConnection.postMessage({ type: 'SUCCESS' });
    // chrome.runtime.sendMessage('s', res => {
    //   setMessages([...messages, res]);
    // });
  };

  return (
    <div onClick={onClick}>
      <pre>{JSON.stringify(messages)}</pre>
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
