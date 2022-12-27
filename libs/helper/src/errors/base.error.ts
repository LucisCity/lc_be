import { ApolloError } from 'apollo-server-errors';

export class AppError extends ApolloError {
  constructor(message: string, code?: string, extensions?: Record<string, any>) {
    super(message, code, extensions);
  }
}

export class InvalidInput extends ApolloError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT');
  }
}
