export type Result = {
  nodes: HTMLElement[];
  name: string;
  message?: string;
  nodeIdentifiers: string[];
};

export type A11yResults = {
  errors: Result[];
  passes: Result[];
  warnings: Result[];
  fixes: Result[];
};

export type Action = {
  id: number;
  message: Message;
};

export type Message = {
  source: string;
  payload: A11yResults;
};
