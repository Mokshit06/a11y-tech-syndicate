import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { render } from 'preact/compat';
import React from 'react';
import App from './app';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
});

function renderPanel() {
  const node = document.getElementById('app');

  if (!node) {
    throw new Error('`#app` node not found');
  }

  render(
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>,
    node
  );
}

renderPanel();

export {};
