import { render } from 'preact/compat';
import React from 'react';
import Caption from '../devpanel/components/caption';
import altText from '../rules/alt-text';
import colorContrast from '../rules/color-contrast';
import documentHasTitle from '../rules/document-has-title';
import formAssociatedLabels from '../rules/form-associated-labels';
import headingHasContent from '../rules/heading-has-content';
import htmlHasLang from '../rules/html-has-lang';
import linksDiscernableName from '../rules/links-discernible-name';
import listContainsOnlyLi from '../rules/list-contains-only-li';
import mediaHasCaption from '../rules/media-has-caption';
import noAriaHiddenBody from '../rules/no-aria-hidden-body';
import noRefresh from '../rules/no-refresh';
import noTabindex from '../rules/no-tabindex';
import validLang from '../rules/valid-lang';
import viewportUserScalable from '../rules/viewport-user-scalable';
import { A11yResults, Message } from '../types';
import nodeIdentifier from '../utils/node-identifier';
import { Context, Payload, traverser } from '../utils/traverser';
import './styles.css';

declare global {
  interface Window {
    __A11Y_EXTENSION__: {
      run: any;
      state: A11yResults;
    };
  }
}

const listeners = new Map();

function handleMessages(e: MessageEvent<any>) {
  const message = e.data;
  if (!message || message.source !== '@devtools-extension') return;

  listeners.forEach((listener, id) => {
    if (message.id && id !== message.id) return;
    listener(message);
  });
}

function addMessage(key: keyof A11yResults, name: string) {
  return (payload: Payload) => {
    const arr = window.__A11Y_EXTENSION__.state[key];
    const result = arr.find(
      e => e.name === name && e.message === payload.message
    );

    if (result) {
      result.nodes.push(payload.node);
      result.nodeIdentifiers.push(nodeIdentifier(payload.node));
      return;
    }

    arr.push({
      name,
      nodes: [payload.node],
      message: payload.message,
      nodeIdentifiers: [nodeIdentifier(payload.node)],
    });
  };
}

function createContext(name: string): Context {
  return {
    error: addMessage('errors', name),
    warn: addMessage('warnings', name),
    fix: addMessage('fixes', name),
    pass: addMessage('passes', name),
  };
}

function runTraverser() {
  traverser(
    document.documentElement,
    [
      altText,
      htmlHasLang,
      mediaHasCaption,
      headingHasContent,
      noAriaHiddenBody,
      linksDiscernableName,
      documentHasTitle,
      validLang,
      formAssociatedLabels,
      listContainsOnlyLi,
      viewportUserScalable,
      noTabindex,
      colorContrast,
      noRefresh,
      {
        name: 'append-caption',
        visitor: {
          body(node) {
            let captionNode = node.querySelector('#a11y-caption-node');

            if (!captionNode) {
              const div = document.createElement('div');
              div.id = 'a11y-caption-node';
              node.appendChild(div);
              captionNode = div;
            }

            render(<Caption />, captionNode);
          },
        },
      },
    ],
    createContext
  );

  window.postMessage(
    {
      source: '@devtools-page',
      // remove node references
      // structured cloning cannot clone dom elements
      payload: Object.fromEntries(
        Object.entries(window.__A11Y_EXTENSION__.state).map(([key, value]) => [
          key,
          value.map(v => ({ ...v, nodes: [] as HTMLElement[] })),
        ])
      ),
    } as Message,
    '*'
  );
}

window.__A11Y_EXTENSION__ = {
  run: () => {
    // delay 1s for client side rendering
    setTimeout(() => runTraverser(), 1000);
  },
  state: {
    errors: [],
    warnings: [],
    fixes: [],
    passes: [],
  },
};

window.__A11Y_EXTENSION__.run();

window.addEventListener('message', handleMessages, false);

export {};
