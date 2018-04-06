export type Logging = {
  +log: (string, ...args: Array<Object>) => void,
  +debug: (string,...args: Array<Object>) => void,
  +info: (string, ...args: Array<Object>) => void,
  +warn: (string, ...args: Array<Object>) => void,
  +error: (string, ...args: Array<Object>) => void,
};