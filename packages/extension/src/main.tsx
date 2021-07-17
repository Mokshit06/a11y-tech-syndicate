import './utils/add-event-listener';
import './main.css';
import altText from './rules/alt-text';
import documentHasTitle from './rules/document-has-title';
import formAssociatedLabels from './rules/form-associated-labels';
import headingHasContent from './rules/heading-has-content';
import htmlHasLang from './rules/html-has-lang';
import linksDiscernableName from './rules/links-discernible-name';
import listContainsOnlyLi from './rules/list-contains-only-li';
import mediaHasCaption from './rules/media-has-caption';
import noAriaHiddenBody from './rules/no-aria-hidden-body';
import validLang from './rules/valid-lang';
import { traverser } from './utils/traverser';

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
]);
