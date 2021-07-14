export default function isHiddenFromScreenReader<TElement extends HTMLElement>(
  node: TElement
) {
  if (node.nodeName === 'INPUT') {
    const hidden = node.hidden;

    if (hidden) return true;
  }

  const ariaHidden = node.getAttribute('aria-hidden');

  return ariaHidden === '';
}
