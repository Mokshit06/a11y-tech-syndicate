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

window.addEventListener('message', e => {
  if (e.data.a11y) {
    console.log(e.data);
  }
});

export {};
