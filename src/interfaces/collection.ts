import { Omit } from '@bluejay/utils';

export interface ICollection<T> extends Array<T> {
  [index: number]: T;
  length: number;
  [Symbol.unscopables](): { copyWithin: boolean, entries: boolean, keys: boolean, fill: boolean, find: boolean, findIndex: boolean, values: boolean };

  concat(...values: T[][]): ICollection<T>;
  join(char: string): string;
  sort(comparator?: (a: T, b: T) => number): this;
  splice(start: number, deleteCount?: number): ICollection<T>;
  splice(start: number, deleteCount: number, ...replacements: T[]): ICollection<T>;
  entries(): IterableIterator<[number, T]>;
  keys(): IterableIterator<number>;
  values(): IterableIterator<T>;
  findIndex(callback: (this: void, object: T, index: number, collection: ICollection<T>) => boolean): number;
  fill(value: T, start?: number, end?: number): this;
  copyWithin(target: number, start?: number, end?: number): this;
  compact(): this;
  find(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): T;
  pick<K extends keyof T>(key: K | K[]): ICollection<Pick<T, K>>;
  omit<K extends keyof T>(key: K | K[]): ICollection<Omit<T, K>>;
  every(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): boolean;
  filter(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): ICollection<T>;
  filterByProperties(properties: Partial<T>): ICollection<T>;
  findByProperties(properties: Partial<T>): T;
  forEach(callback: (object: T, index: number, collection: ICollection<T>) => void, thisArg?: any): void;
  mapByProperty<P extends keyof T>(property: P): (T[P])[];
  keyByProperty<P extends keyof T>(property: P): { [p: string]: T; };
  groupByProperty<P extends keyof T>(property: P): { [p: string]: ICollection<T>; };
  includes(object: T, startAt?: number): boolean;
  indexOf(object: T, startAt?: number): number;
  some(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): boolean;
  map<R>(callback: (object: T, index: number, collection: ICollection<T>) => R, thisArg?: any): ICollection<R>;
  lastIndexOf(object: T, startAt?: number): number;
  getAt(index: number): T;
  setAt(index: number, value: T): this;
  reduce<R>(callback: (acc: R, object: T, index: number, collection: ICollection<T>) => R, initial: R, thisArg?: any): R;
  reduceRight<R>(callback: (acc: R, object: T, index: number, collection: ICollection<T>) => R, initial: R, thisArg?: any): R;
  assignEach(properties: Partial<T>): this;
  lastIndex(): number | null;
  slice(from?: number, to?: number): ICollection<T>;
  orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): ICollection<T>;
  toArray(): T[];
  uniq(): ICollection<T>;
  push(...objects: T[]): number;
  pop(): T;
  reverse(): this;
  shift(): T;
  unshift(...objects: T[]): number;
  [Symbol.iterator](): IterableIterator<T>;
  size(): number;
  isEmpty(): boolean;
  forEachSeries(callback: (item: T, index: number, collection: ICollection<T>) => Promise<void>, thisArg?: any): Promise<void>;
  forEachParallel(callback: (item: T, index: number, collection: ICollection<T>) => Promise<void>, thisArg?: any): Promise<void>;
  mapSeries<R>(callback: (item: T, index: number, collection: ICollection<T>) => Promise<R>): Promise<ICollection<R>>;
  mapParallel<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]>;
  reduceSeries<A>(callback: (acc: A, current: T, index: number, collection: ICollection<T>) => Promise<A>, initial: A, thisArg?: any): Promise<A>;
  getObjects(): T[];
  setObjects(objects: T[]): this;
}