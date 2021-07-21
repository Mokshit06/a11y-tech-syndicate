import { render } from 'preact/compat';
import React from 'react';
import Caption from '../devpanel/components/caption';
import altText from '../rules/alt-text';
import documentHasTitle from '../rules/document-has-title';
import formAssociatedLabels from '../rules/form-associated-labels';
import headingHasContent from '../rules/heading-has-content';
import htmlHasLang from '../rules/html-has-lang';
import linksDiscernableName from '../rules/links-discernible-name';
import listContainsOnlyLi from '../rules/list-contains-only-li';
import mediaHasCaption from '../rules/media-has-caption';
import noAriaHiddenBody from '../rules/no-aria-hidden-body';
import noTabindex from '../rules/no-tabindex';
import validLang from '../rules/valid-lang';
import viewportUserScalable from '../rules/viewport-user-scalable';
import '../utils/add-event-listener';
import nodeIdentifier from '../utils/node-identifier';
import { traverser } from '../utils/traverser';
import './styles.css';

declare global {
  interface Window {
    __A11Y_EXTENSION__: {
      run: any;
      errors: HTMLElement[];
      warnings: HTMLElement[];
      fixes: HTMLElement[];
    };
  }
}

const listeners = new Map();

function setListener(onMessage: (...args: any[]) => any, instanceId: any) {
  listeners.set(instanceId, onMessage);

  // window.addEventListener('message', handleMessages, false);
}

function handleMessages(e: MessageEvent<any>) {
  const message = e.data;
  if (!message || message.source !== '@devtools-extension') return;

  listeners.forEach((listener, id) => {
    if (message.id && id !== message.id) return;
    listener(message);
  });
}

function postMessage({
  event,
  payload,
}: {
  event: string;
  payload: { message?: string; node?: any; name?: string };
}) {
  window.postMessage(
    {
      source: '@devtools-page',
      payload: {
        event: event,
        payload: {
          message: payload.message,
          name: payload.name,
          node: payload.node && nodeIdentifier(payload.node),
        },
      },
    },
    '*'
  );
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
      {
        name: 'append-caption',
        visitor: {
          body(node) {
            let captionNode = node.querySelector('#a11y-caption-node');
            console.log(captionNode);
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
    name => ({
      error: payload => {
        window.__A11Y_EXTENSION__.errors.push(payload.node);

        postMessage({
          event: 'error',
          payload: { ...payload, name },
        });
      },
      warn: payload => {
        window.__A11Y_EXTENSION__.warnings.push(payload.node);

        postMessage({
          event: 'warn',
          payload: { ...payload, name },
        });
      },
      fix: payload => {
        window.__A11Y_EXTENSION__.fixes.push(payload.node);

        postMessage({ event: 'fix', payload: { ...payload, name } });
      },
    })
  );

  postMessage({ event: 'end', payload: {} });
}

window.__A11Y_EXTENSION__ = {
  run: runTraverser,
  errors: [],
  warnings: [],
  fixes: [],
};

window.__A11Y_EXTENSION__.run();

window.addEventListener('message', handleMessages, false);

export {};
