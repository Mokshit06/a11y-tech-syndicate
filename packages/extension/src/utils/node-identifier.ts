export default function nodeIdentifier(node: HTMLElement) {
  let id = node.localName;

  if (node.id) id += `#${node.id}`;

  for (const className of node.classList) {
    id += `.${className}`;
  }

  return id;
}
