const connections = {
  tab: new Map<number | string, chrome.runtime.Port>(),
  panel: new Map<number | string, chrome.runtime.Port>(),
};

type Message = {};

function getId(sender: chrome.runtime.MessageSender, name?: string) {
  return sender.tab ? sender.tab.id! : name || sender.id!;
}

function disconnect(
  type: string,
  id: string | number,
  listener: (...args: any[]) => any
) {
  return function disconnectListener() {
    const connection = connections[type as keyof typeof connections];

    if (!connection) return;

    const port = connection.get(id);

    if (listener && port) port.onMessage.removeListener(listener);
    if (port) port.onDisconnect.removeListener(disconnectListener);

    connection.delete(id);
  };
}

function relay(message: any, sender: chrome.runtime.MessageSender) {
  let tabId = getId(sender);

  if (!tabId) return;
  if (sender.frameId) tabId = `${tabId}-${sender.frameId}`;

  const action = {
    type: 'relay',
    message,
    id: tabId,
  };

  console.log(action);

  console.log([...connections.panel.entries()]);

  connections.panel.forEach(connection => {
    connection.postMessage(action);
  });
}

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'content_script') {
    let id = getId(port.sender!);

    if (port.sender?.frameId) {
      id = `${id}-${port.sender.frameId}`;
    }

    connections.tab.set(id, port);

    const listener = (message: any) => {
      relay(message, port.sender!);
    };

    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(disconnect('tab', id, listener));
  } else {
    const id = port.name || port.sender?.frameId!;

    connections.panel.set(id, port);

    const listener = (message: any) => {
      console.log(message);
    };

    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(disconnect('panel', id, listener));
  }
});

export {};
