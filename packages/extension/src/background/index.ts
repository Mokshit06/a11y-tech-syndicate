chrome.runtime.onConnect.addListener(port => {
  console.log({ port });
  port.onMessage.addListener(console.log);
});

export {};
