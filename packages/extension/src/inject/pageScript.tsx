import altText from '../rules/alt-text';
import documentHasTitle from '../rules/document-has-title';
import formAssociatedLabels from '../rules/form-associated-labels';
import headingHasContent from '../rules/heading-has-content';
import htmlHasLang from '../rules/html-has-lang';
import linksDiscernableName from '../rules/links-discernible-name';
import listContainsOnlyLi from '../rules/list-contains-only-li';
import mediaHasCaption from '../rules/media-has-caption';
import noAriaHiddenBody from '../rules/no-aria-hidden-body';
import validLang from '../rules/valid-lang';
import '../utils/add-event-listener';
import { traverser } from '../utils/traverser';

declare global {
  interface Window {
    __A11Y_EXTENSION__: {
      run: any;
    };
  }
}

const listeners = new Map();

function setListener(onMessage: (...args: any[]) => any, instanceId: any) {
  listeners.set(instanceId, onMessage);

  // window.addEventListener('message', handleMessages, false);
}

function handleMessages(e: MessageEvent<any>) {
  console.log(e.data);
  const message = e.data;
  if (!message || message.source !== '@devtools-extension') return;

  listeners.forEach((listener, id) => {
    if (message.id && id !== message.id) return;
    listener(message);
  });
}

function postMessage(payload: {
  event: string;
  payload: { message: string; node: any; name: string };
}) {
  window.postMessage(
    {
      source: '@devtools-page',
      payload: {
        event: payload.event,
        payload: {
          message: payload.payload.message,
          name: payload.payload.name,
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
      {
        name: 'append-caption',
        visitor: {
          body(node) {
            let captionNode = node.querySelector('#caption-node-a11y');
            console.log(captionNode);
            // if (!captionNode) {
            //   const node = document.createElement('div');
            //   node.id = 'caption-node-a11y';
            //   node.appendChild(node);
            //   captionNode = node;
            // }
            // render(<Caption />, captionNode);
          },
        },
      },
    ],
    name => ({
      error: payload => {
        postMessage({
          event: 'error',
          payload: { ...payload, name },
        });
      },
      warn: payload => {
        console.log('Warn', payload);
        postMessage({
          event: 'warn',
          payload: { ...payload, name },
        });
      },
      success: payload => {
        console.log('fix', payload);
        postMessage({ event: 'fix', payload: { ...payload, name } });
      },
    })
  );
}

window.__A11Y_EXTENSION__ = {
  run: runTraverser,
};

window.addEventListener('message', handleMessages, false);

export {};
