export interface ICollection<T> extends Array<T> {
  concat(...values: T[][]): ICollection<T>;
  sort(comparator?: (a: T, b: T) => number): this;
  splice(start: number, deleteCount?: number): ICollection<T>;
  splice(start: number, deleteCount: number, ...replacements: T[]): ICollection<T>;
  findIndex(callback: (this: void, object: T, index: number, collection: this) => boolean): number;
  fill(value: T, start?: number, end?: number): this;
  copyWithin(target: number, start?: number, end?: number): this;
  find(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined;
  every(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean;
  filter(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): ICollection<T>;
  filterByProperties(properties: Partial<T>): ICollection<T>;
  findByProperties(properties: Partial<T>): T | undefined;
  forEach(callback: (object: T, index: number, collection: this) => void, thisArg?: any): void;
  mapByProperty<P extends keyof T>(property: P, options?: { unique: boolean; }): ICollection<(T[P])>;
  keyByProperty<P extends keyof T>(property: P): { [p: string]: T; };
  groupByProperty<P extends keyof T>(property: P): { [p: string]: ICollection<T>; };
  some(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean;
  map<R>(callback: (object: T, index: number, collection: this) => R, thisArg?: any): ICollection<R>;
  reverse(): this;
  slice(from?: number, to?: number): ICollection<T>;
  reduce(
    callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T
  ): T;
  reduce(
    callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T,
    initialValue: T
  ): T;
  reduce<R>(
    callback: (previousValue: R, currentValue: T, currentIndex: number, collection: this) => R,
    initialValue: R
  ): R;
  reduceRight(
    callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T
  ): T;
  reduceRight(
    callback: (previousValue: T, currentValue: T, currentIndex: number, collection: this) => T,
    initialValue: T
  ): T;
  reduceRight<R>(
    callback: (previousValue: R, currentValue: T, currentIndex: number, collection: this) => R,
    initialValue: R
  ): R;

  pick<K extends keyof T>(key: K | K[]): ICollection<Pick<T, K>>;
  omit<K extends keyof T>(key: K | K[]): ICollection<Omit<T, K>>;
  getAt(index: number): T;
  setAt(index: number, value: T): this;
  compact(): this;
  assignEach(properties: Partial<T>): this;
  lastIndex(): number | null;
  orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): ICollection<T>;
  toArray(): T[];
  uniq(): ICollection<T>;
  clone(): this;
  cloneDeep(): this;
  size(): number;
  isEmpty(): boolean;
  forEachSeries(
    callback: (item: T, index: number, collection: this) => Promise<void>,
    thisArg?: any
  ): Promise<void>;
  forEachParallel(
    callback: (item: T, index: number, collection: this) => Promise<void>,
    thisArg?: any
  ): Promise<void>;
  mapSeries<R>(callback: (item: T, index: number, collection: this) => Promise<R>): Promise<ICollection<R>>;
  mapParallel<R>(callback: (item: T, index?: number) => Promise<R>): Promise<ICollection<R>>;
  reduceSeries<A>(
    callback: (acc: A, current: T, index: number, collection: this) => Promise<A>,
    initial: A,
    thisArg?: any
  ): Promise<A>;
  getObjects(): T[];
  setObjects(objects: T[]): this;
}
