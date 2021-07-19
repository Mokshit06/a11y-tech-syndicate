const script = document.createElement('script');

script.type = 'text/javascript';
script.src = chrome.extension.getURL('out/inject/pageScript.js');

script.addEventListener('load', () => {
  script.parentNode?.removeChild(script);
});

(document.head || document.documentElement).appendChild(script);

export {};
