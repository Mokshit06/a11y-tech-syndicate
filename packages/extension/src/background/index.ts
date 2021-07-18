const ports = new Set<any>();

console.log('CREATING');

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'devtools') return;

  // ports.add(port);

  // port.onDisconnect.addListener(() => {
  //   ports.delete(port);
  // });

  port.onMessage.addListener(msg => {
    console.log('Received message from devtools page', msg);
  });
});

export {};
