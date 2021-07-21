export default function nodeIdentifier(node: HTMLElement) {
  let id = node.localName;

  if (node.id) id += `#${node.id}`;
  if (node.className) id += `.${node.className}`;

  return id;
}
