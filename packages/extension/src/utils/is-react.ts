export default function isReact() {
  // only works if devtools are installed
  // which most react devs have
  return typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
}
