const source = '@devtools-extension';
const pageSource = '@devtools-page';
const maxChromeMsgSize = 32 * 1024 * 1024;
let connected = false;
let bg: chrome.runtime.Port | undefined;

type TODO = any;

function connect() {
  connected = true;
  const name = 'devtools';

  // if ((window as any).devToolsExtensionID) {
  //   bg = chrome.runtime.connect((window as any).devToolsExtensionID, { name });
  // } else {
  bg = chrome.runtime.connect({ name });
  // }

  bg.onMessage.addListener(message => {
    if (message.action) {
      window.postMessage(
        {
          type: message.type,
          payload: message.action,
          state: message.state,
          id: message.id,
          source,
        },
        '*'
      );
    }
    // else if (message.options) {
    //   injectOptions(message.options);
    // }
    else {
      window.postMessage(
        {
          type: message.type,
          state: message.state,
          id: message.id,
          source,
        },
        '*'
      );
    }

    bg?.onDisconnect.addListener(handleDisconnect);
  });
}

function handleDisconnect() {
  window.removeEventListener('message', handleMessages);
  window.postMessage({ type: 'STOP', failed: true, source }, '*');
  bg = undefined;
}

function tryCatch(fn: (...args: any[]) => any, args: Record<string, any>) {
  try {
    return fn(args);
  } catch (err) {
    if (err.message === 'Message length exceeded maximum allowed length.') {
      const instanceId = args.instanceId;
      const newArgs: Record<string, any> = { split: 'start' };
      const toSplit: [string, any][] = [];
      let size = 0;

      Object.keys(args).map(key => {
        const arg = args[key];
        if (typeof arg === 'string') {
          size += arg.length;
          if (size > maxChromeMsgSize) {
            toSplit.push([key, arg]);
            return;
          }
        }
        newArgs[key] = arg;
      });
      fn(newArgs);
      for (let i = 0; i < toSplit.length; i++) {
        for (let j = 0; j < toSplit[i][1].length; j += maxChromeMsgSize) {
          fn({
            instanceId,
            source: pageSource,
            split: 'chunk',
            chunk: [toSplit[i][0], toSplit[i][1].substr(j, maxChromeMsgSize)],
          });
        }
      }
      return fn({ instanceId, source: pageSource, split: 'end' });
    }
    handleDisconnect();
    if (process.env.NODE_ENV !== 'production')
      console.error('Failed to send message', err);
  }
}

function send(message: TODO) {
  if (!connected) connect();
  if (message.type === 'INIT_INSTANCE') {
    // getOptionsFromBg();
    bg?.postMessage({ name: 'INIT_INSTANCE', instanceId: message.instanceId });
  } else {
    bg?.postMessage({ name: 'RELAY', message });
  }
}

function handleMessages(event: TODO) {
  if (!event || event.source !== window || typeof event.data !== 'object')
    return;
  const message = event.data;
  if (message.source !== pageSource) return;
  if (message.type === 'DISCONNECT') {
    if (bg) {
      bg.disconnect();
      connected = false;
    }
    return;
  }

  tryCatch(send, message);
}

window.addEventListener('message', handleMessages, false);

export {};
