import type { ThemeConfig } from '@chakra-ui/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { render } from 'preact/compat';
import React from 'react';
import App from './app';
import './app.css';

let config: ThemeConfig = {
  initialColorMode: 'light',
};

if (chrome.devtools.panels.themeName === 'dark') {
  config.initialColorMode = 'dark';
}

const theme = extendTheme({
  config,
});

function renderPanel() {
  const node = document.getElementById('app');

  if (!node) {
    throw new Error('`#app` node not found');
  }

  render(
    <ChakraProvider
      theme={theme}
      // disable syncing with local storage
      // so that theme changes with devtools theme
      colorModeManager={{
        get: init => init,
        set: () => {},
        type: 'localStorage',
      }}
    >
      <App />
    </ChakraProvider>,
    node
  );
}

renderPanel();
