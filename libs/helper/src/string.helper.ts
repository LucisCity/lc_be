import { nanoid as NanoId, customAlphabet } from 'nanoid';

const simpleNanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export function randString(length: number, sources: string = null): string {
  if (!!sources) {
    const nanoid = customAlphabet(sources, length);
    return nanoid();
  }

  return simpleNanoId(length);
}

export function randId(length: number): string {
  return NanoId(length);
}

export function simple_rand_string(): string {
  return (Math.random() * 1e18).toString(36).toUpperCase();
}
