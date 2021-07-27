import iconUrl from '../assets/icon.png';

chrome.devtools.panels.create('a11y', iconUrl, 'static/panel.html', () => {});

chrome.devtools.panels.elements.createSidebarPane('a11y issues', sidebar => {
  sidebar.setPage('static/sidebar.html');
});

export {};
