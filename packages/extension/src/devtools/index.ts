import iconUrl from '../assets/icon.png';

chrome.devtools.panels.create(
  'a11y',
  iconUrl,
  'static/panel.html',
  panel => {}
);

declare const $0: HTMLElement;

function getA11yResult() {
  const a11yResult = {
    errors: [],
    passes: [],
    fixes: [],
    warnings: [],
  } as Record<string, any>;

  for (const [key, results] of Object.entries(
    window.__A11Y_EXTENSION__.state
  )) {
    for (const result of results) {
      if (result.nodes.includes($0)) {
        a11yResult[key].push({
          message: result.message,
          name: result.name,
        });
      }
    }
  }

  console.log(a11yResult);

  return a11yResult;
}

chrome.devtools.panels.elements.createSidebarPane('a11y issues', sidebar => {
  sidebar.setPage('static/sidebar.html');
  sidebar.setHeight('100vh');
  // sidebar.setObject({
  //   someBool: true,
  //   someString: 'hello there',
  //   someObject: {
  //     someNumber: 42,
  //     someOtherString: "this is my pane's content",
  //   },
  // });
  // chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
  //   chrome.devtools.inspectedWindow.eval(
  //     `(${getA11yResult.toString()})()`,
  //     result => {
  //       sidebar.setObject(result as any);
  //       console.log({ result });
  //     }
  //   );
  // });
});

export {};
