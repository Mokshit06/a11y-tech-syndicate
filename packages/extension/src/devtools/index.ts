import iconUrl from '../assets/icon.png';

chrome.devtools.panels.create(
  'a11y',
  iconUrl,
  'static/panel.html',
  panel => {}
);

chrome.devtools.panels.elements.createSidebarPane('a11y issues', sidebar => {
  sidebar.setPage('static/sidebar.html');
  sidebar.setHeight('100vh');

  // chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
  //   sidebar.setExpression(`(${getA11yResult.toString()})()`);
  // });
});
