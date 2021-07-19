import iconUrl from '../assets/icon.png?url';

chrome.devtools.panels.create('a11y', iconUrl, 'static/panel.html', panel => {
  // let panelWindow: Window;
  // const data = new Set<any>();
  // const backgroundConnection = chrome.runtime.connect({ name: 'devtools' });
  // backgroundConnection.onMessage.addListener(msg => {
  //   if (panelWindow) {
  //     // do something
  //   } else {
  //     data.add(msg);
  //   }
  // });
  // const onShown = (window: Window) => {
  //   panel.onShown.removeListener(onShown);
  //   panelWindow = window;
  //   for (const msg of data) {
  //     // do something
  //     data.delete(msg);
  //   }
  // };
  // panel.onShown.addListener(onShown);
});

export {};
