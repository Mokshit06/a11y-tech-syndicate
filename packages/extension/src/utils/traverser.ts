import memoize from './memoize';

export type Payload = { node: any; message: string };

export type Context = {
  error: (error: Payload) => void;
  warn: (warning: Payload) => void;
  fix: (message: Payload) => void;
  pass: (message: Payload) => void;
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

const commonStyles = `
  color: white;
  padding: 3px 5px;
  margin: 10px 0px 7px 0px;
`;

const SUCCESS_STYLE = `
  background-color: rgba(38, 252, 59, 0.5);
  ${commonStyles}
`;

const ERROR_STYLE = `
  background-color: rgba(255, 0, 0, 0.7);
  ${commonStyles}
`;

const WARNING_STYLE = `
  background-color: rgba(255, 187, 0, 0.8);
  ${commonStyles}
`;

const FIX_STYLE = `
  background-color: rgba(0, 183, 255, 0.8);
  ${commonStyles}
`;

const defaultContext = (name: string): Context => ({
  error: ({ node, message }) => {
    console.log(`%c${name}: ${message}`, ERROR_STYLE, node);
  },
  warn: ({ node, message }) => {
    console.log(`%c${name}: ${message}`, WARNING_STYLE, node);
  },
  fix: ({ node, message }) => {
    console.log(`%c${name}: ${message}`, FIX_STYLE, node);
  },
  pass: ({ node, message }) => {
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
  const memCreateContext = memoize(createContext);
  console.time('traverse');

  function traverseNode(node: Element) {
    rules.forEach(rule => {
      const patch = rule.visitor[node.nodeName.toLowerCase() as keyof Rule];
      const patchAll = rule.visitor.ALL_ELEMENTS;
      const context = memCreateContext(rule.name);

      if (patchAll) {
        patchAll(node as any, context);
      }

      if (patch) {
        patch(node as any, context);
      }
    });

    [...node.children].forEach(node => traverseNode(node));
  }

  traverseNode(node);
  console.timeEnd('traverse');
}
