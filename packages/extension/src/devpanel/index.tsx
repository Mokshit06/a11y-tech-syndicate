import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Caption from '../components/caption';
// import '../utils/add-event-listener';
// import '../main.css';
import altText from '../rules/alt-text';
import documentHasTitle from '../rules/document-has-title';
import formAssociatedLabels from '../rules/form-associated-labels';
import headingHasContent from '../rules/heading-has-content';
import htmlHasLang from '../rules/html-has-lang';
import linksDiscernableName from '../rules/links-discernible-name';
import listContainsOnlyLi from '../rules/list-contains-only-li';
import mediaHasCaption from '../rules/media-has-caption';
import noAriaHiddenBody from '../rules/no-aria-hidden-body';
import validLang from '../rules/valid-lang';
import { traverser } from '../utils/traverser';

function runTraverser() {
  traverser(document.documentElement, [
    altText,
    htmlHasLang,
    mediaHasCaption,
    headingHasContent,
    noAriaHiddenBody,
    linksDiscernableName,
    documentHasTitle,
    validLang,
    formAssociatedLabels,
    listContainsOnlyLi,
    {
      name: 'append-caption',
      visitor: {
        body(node) {
          let captionNode = node.querySelector('#caption-node-a11y');

          if (!captionNode) {
            const node = document.createElement('div');
            node.id = 'caption-node-a11y';
            node.appendChild(node);
            captionNode = node;
          }

          render(<Caption />, captionNode);
        },
      },
    },
  ]);
}

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    chrome.devtools.inspectedWindow.eval(`window.__VAR__ = ${count}`);
  }, [count]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </>
  );
}

render(<App />, document.querySelector('#app')!);
