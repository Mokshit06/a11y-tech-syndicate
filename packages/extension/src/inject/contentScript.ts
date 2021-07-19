const source = '@devtools-extension';
const pageSource = '@devtools-page';
const maxChromeMsgSize = 32 * 1024 * 1024;
let connected = false;
let bg: chrome.runtime.Port | undefined;

type TODO = any;

function connect() {
  console.log('CONNECTING');
  connected = true;

  bg = chrome.runtime.connect({ name: 'content_script' });

  console.log({ bg });

  // bg?.onMessage.addListener(message => {
  //   if (message.action) {
  //     window.postMessage(
  //       {
  //         type: message.type,
  //         payload: message.action,
  //         state: message.state,
  //         id: message.id,
  //         source,
  //       },
  //       '*'
  //     );
  //   } else {
  //     window.postMessage(
  //       {
  //         type: message.type,
  //         state: message.state,
  //         id: message.id,
  //         source,
  //       },
  //       '*'
  //     );
  //   }

  //   bg?.onDisconnect.addListener(handleDisconnect);
  // });
}

window.addEventListener('message', e => {
  if (!e || e.source !== window || typeof e.data !== 'object') return;

  console.log('RECEIVED', e.data);
  const message = e.data;
  if (message.source !== pageSource) return;

  if (!connected) connect();

  bg?.postMessage(message);
});

// runTraverser();

// function handleDisconnect() {
//   console.log('DISCONNECTING');
//   window.removeEventListener('message', handleMessages);
//   window.postMessage({ type: 'STOP', failed: true, source }, '*');
//   bg = undefined;
// }

// function tryCatch(fn: (...args: any[]) => any, args: Record<string, any>) {
//   try {
//     return fn(args);
//   } catch (err) {
//     // if (err.message === 'Message length exceeded maximum allowed length.') {
//     //   const instanceId = args.instanceId;
//     //   const newArgs: Record<string, any> = { split: 'start' };
//     //   const toSplit: [string, any][] = [];
//     //   let size = 0;

//     //   Object.keys(args).map(key => {
//     //     const arg = args[key];
//     //     if (typeof arg === 'string') {
//     //       size += arg.length;
//     //       if (size > maxChromeMsgSize) {
//     //         toSplit.push([key, arg]);
//     //         return;
//     //       }
//     //     }
//     //     newArgs[key] = arg;
//     //   });
//     //   fn(newArgs);
//     //   for (let i = 0; i < toSplit.length; i++) {
//     //     for (let j = 0; j < toSplit[i][1].length; j += maxChromeMsgSize) {
//     //       fn({
//     //         instanceId,
//     //         source: pageSource,
//     //         split: 'chunk',
//     //         chunk: [toSplit[i][0], toSplit[i][1].substr(j, maxChromeMsgSize)],
//     //       });
//     //     }
//     //   }
//     //   return fn({ instanceId, source: pageSource, split: 'end' });
//     // }
//     handleDisconnect();

//     if (process.env.NODE_ENV !== 'production') {
//       console.error('Failed to send message', err);
//     }
//   }
// }

// function send(message: TODO) {
//   console.log('SENDING', message);
//   if (!connected) connect();
//   if (message.type === 'INIT_INSTANCE') {
//     bg?.postMessage({ name: 'INIT_INSTANCE', instanceId: message.instanceId });
//   } else {
//     bg?.postMessage({ name: 'RELAY', message });
//   }
// }

// function handleMessages(this: Window, e: MessageEvent<any>) {
//   if (!e || e.source !== window || typeof e.data !== 'object') return;
//   console.log('RECEIVED', e.data);
//   const message = e.data;
//   if (message.source !== pageSource) return;
//   if (message.type === 'DISCONNECT') {
//     if (bg) {
//       bg.disconnect();
//       connected = false;
//     }
//     return;
//   }

//   tryCatch(send, message);
// }

// window.addEventListener('message', handleMessages, false);

export {};
