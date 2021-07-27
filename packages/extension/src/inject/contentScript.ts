const pageSource = '@devtools-page';
let connected = false;
let bg: chrome.runtime.Port | undefined;

function connect() {
  connected = true;

  bg = chrome.runtime.connect({ name: 'content_script' });

  bg.onMessage.addListener(message => {
    debugger;

    if (message?.event === 'traverse') {
      window.postMessage(
        {
          source: '@devtools-extension',
          payload: {
            event: 'traverse',
          },
        },
        '*'
      );
    }
  });

  bg.onDisconnect.addListener(() => {
    console.log('DISCONNECTING');
    window.removeEventListener('message', handleMessages);
    bg = undefined;
  });
}

function handleMessages(e: MessageEvent<any>) {
  if (!e || e.source !== window || typeof e.data !== 'object') return;

  const message = e.data;
  if (message.source !== pageSource) return;

  if (!connected) connect();

  bg?.postMessage(message);
}

window.addEventListener('message', handleMessages);

export {};
