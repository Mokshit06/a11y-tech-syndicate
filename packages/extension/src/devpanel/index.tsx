import { render, h, Fragment } from 'preact';
import App from './app';
// // import '../utils/add-event-listener';
// // import '../main.css';

function renderPanel() {
  const node = document.getElementById('app');

  if (!node) {
    throw new Error('`#app` node not found');
  }

  render(<App />, node);
}

renderPanel();

export {};
