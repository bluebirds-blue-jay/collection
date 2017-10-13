export interface ICollection<T> {
  compact(): T[];
  every(callback: (object: T, index?: number) => boolean): boolean;
  filter(callback: (object: T, index?: number) => boolean): T[];
  filterByProperties(properties: Partial<T>): T[];
  find(callback: (object: T, index?: number) => boolean): T;
  findByProperties(properties: Partial<T>): T;
  forEach(callback: (object: T, index?: number) => void): void;
  mapByProperty<P extends keyof T>(property: P): (T[P])[];
  includes(object: T, startAt?: number): boolean;
  indexOf(object: T, startAt?: number): number;
  some(callback: (object: T, index?: number) => boolean): boolean;
  map<R>(callback: (object: T, index?: number) => R): R[];
  lastIndexOf(object: T, startAt?: number): number;
  getAt(index: number): T;
  setAt(index: number, value: T): this;
  reduce<R>(callback: (acc: R, object: T, index?: number) => R, initial: R): R;
  reduceRight<R>(callback: (acc: R, object: T, index?: number) => R, initial: R): R;
  assignEach(properties: Partial<T>): this;
  lastIndex(): number | null;
  slice(from?: number, to?: number): T[];
  orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): T[];
  toArray(): T[];
  uniq(): T[];
  push(...objects: T[]): this;
  pop(): T;
  reverse(): this;
  shift(): T;
  unshift(...objects: T[]): this;
  [Symbol.iterator](): IterableIterator<T>;
  size(): number;
  isEmpty(): boolean;
  forEachSeries(callback: (item: T, index?: number) => Promise<void>): Promise<void>;
  forEachParallel(callback: (item: T, index?: number) => Promise<void>): Promise<void>;
  mapSeries<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]>;
  mapParallel<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]>;
  reduceSeries<A>(callback: (acc: A, current: T, index?: number) => Promise<A>, initial: A): Promise<A>;
  getObjects(): T[];
  setObjects(objects: T[]): this;
}