import create from 'zustand';

export type Context = {
  error: (error: { node: any; message: string }) => void;
  warn: (warning: { node: any; message: string }) => void;
  fix: (message: { node: any; message: string }) => void;
  // pass: (message: { node: any; message: string }) => void;
};

export type VisitorNode<Node = Element> = (
  node: Node,
  context: Context
) => void;

export type Visitor = Partial<
  {
    [K in keyof HTMLElementTagNameMap]: VisitorNode<HTMLElementTagNameMap[K]>;
  } & {
    ALL_ELEMENTS: VisitorNode<any>;
    [key: string]: VisitorNode<any>;
  }
>;

export type Rule = {
  name: string;
  visitor: Visitor;
};

const SUCCESS_STYLE = `
  background-color: rgba(38, 252, 59, 0.5);
  color: white;
  padding: 3px 5px;
  margin: 10px 0px 7px 0px;
`;

const ERROR_STYLE = `
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 3px 5px;
  margin: 10px 0px 7px 0px;
`;

const defaultContext = (name: string): Context => ({
  error: ({ node, message }) => {
    console.log(`%c${name}: ${message}`, ERROR_STYLE, node);
  },
  warn: ({ node, message }) => {
    console.warn(`${name}: ${message}`, node);
  },
  fix: ({ node, message }) => {
    console.log(`%c${name}: ${message}`, SUCCESS_STYLE, node);
  },
});

// TODO change impl to maybe just traverse the nodes
// specified in rules
//
// rules = [
//  {
//    name: 'visitor',
//    visitor: {
//      img: () = {}
//      input: () = {}
//    }
//  }
// ]
//
// nodes = [['img', [() => {}]], ['input', [() => {}]]]
//
export function traverser(
  node: HTMLElement,
  rules: Rule[],
  createContext: (name: string) => Context = defaultContext
) {
  console.time('traverse');
  const contexts = new Map<string, Context>();

  function traverseNode(node: Element) {
    rules.forEach(rule => {
      const patch = rule.visitor[node.nodeName.toLowerCase() as keyof Rule];
      const patchAll = rule.visitor.ALL_ELEMENTS;

      const ctx = contexts.has(rule.name)
        ? contexts.get(rule.name)!
        : createContext(rule.name);

      if (patchAll) {
        patchAll(node as any, ctx);
      }

      if (patch) {
        patch(node as any, ctx);

        contexts.set(rule.name, ctx);
      }
    });

    [...node.children].forEach(node => traverseNode(node));
  }

  traverseNode(node);
  console.timeEnd('traverse');
}
