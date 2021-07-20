import React, { useEffect } from 'react';
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
  const { errors, fixes, warnings, addError, addFix, addWarning } =
    useAccessibilityStats();

  const handleMessage = (message: any, port: chrome.runtime.Port) => {
    if (message.id !== id) return;

    switch (message?.message.payload.event) {
      case 'error': {
        addError(message.message.payload.payload.message);
        break;
      }
      case 'fix': {
        addFix(message.message.payload.payload.message);
        break;
      }
      case 'warn': {
        addWarning(message.message.payload.payload.message);
        break;
      }
    }
  };

  useEffect(() => {
    bgConnection.onMessage.addListener(handleMessage);

    return () => {
      bgConnection.onMessage.removeListener(handleMessage);
    };
  });

  const handleStart = (e: MouseEvent) => {
    bgConnection.postMessage({
      source: '@devtools-extension',
      payload: {
        event: 'start',
        payload: undefined,
      },
    });
  };

  return (
    <div>
      <button onClick={handleStart}>Start</button>
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
