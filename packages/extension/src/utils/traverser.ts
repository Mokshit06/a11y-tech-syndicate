import create from 'zustand';

export type Context = {
  report: (warning: { node: any; message: string }) => void;
  success: (message: { node: any; message: string }) => void;
};

export type VisitorNode<Node = Element> = (
  node: Node,
  context: Context
) => void;

export type Visitor = {
  [K in keyof HTMLElementTagNameMap]?: VisitorNode<HTMLElementTagNameMap[K]>;
} & {
  [key: string]: VisitorNode<any>;
};

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

const defaultContext = (name: string): Context => ({
  report: ({ node, message }) => {
    console.warn(`${name}: ${message}`, node);
  },
  success: ({ node, message }) => {
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
  const contexts = new Map();

  function traverseNode(node: Element) {
    rules.forEach(rule => {
      const patch = rule.visitor[node.nodeName.toLowerCase() as keyof Rule];

      if (patch) {
        const ctx = contexts.has(rule.name)
          ? contexts.get(rule.name)
          : createContext(rule.name);

        patch(node as any, ctx);

        contexts.set(rule.name, ctx);
      }
    });

    [...node.children].forEach(node => traverseNode(node));
  }

  traverseNode(node);
  console.timeEnd('traverse');
}
