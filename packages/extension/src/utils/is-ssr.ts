// should work most of the time
export default function isSSR() {
  if (!document.body) return false;

  const bodyChildren = [...document.body.children];

  if (
    bodyChildren.every(child => {
      child.children.length === 0;
    })
  ) {
    return false;
  }

  return true;
}
