import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface SelectionSet {
  kind: string;
  selections: [
    {
      name: {
        value: string;
      };
      selectionSet?: SelectionSet;
    },
  ];
}

export interface GraphqlQueryInfo {
  kind: string;
  alias: string;
  name: { kind: string; value: string };
  arguments: [[any]];
  directives: [];
  selectionSet: SelectionSet;
}

export const GraphqlQuery = createParamDecorator(
  (_, context: ExecutionContext) => {
    const data = context.getArgByIndex(3);
    return data.fieldNodes as GraphqlQueryInfo[];
  },
);
