declare global {
  interface Window {
    __A11Y_EXTENSION__: {
      send: any;
    };
  }
}

window.__A11Y_EXTENSION__ = {
  send() {
    window.postMessage(
      {
        a11y: {
          type: 'some_message',
        },
      },
      '*'
    );
  },
};

export {};
