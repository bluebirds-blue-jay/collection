import { ICollection } from '../interfaces/collection';
import * as Lodash from 'lodash';
import { omit, Omit, pick } from '@bluejay/utils';

export class Collection<T> implements ICollection<T> {
  [index: number]: T; // Objects are accessible through collection[index]

  // Array compatibility
  public get length() {
    return this.size();
  }

  private _objects: T[];

  private get objects() {
    return this._objects;
  }

  private set objects(value: T[]) {
    // Ensures that `objects` is always a native array
    if (Collection.isCollection<T>(value)) {
      value = value.toArray();
    }

    this._objects = value;
  }

  public constructor(objects: T[] = []) {
    this.objects = objects;

    return new Proxy(this, {
      get(target: Collection<T>, name: string) {
        // If the property is an index, then return the object at this index.
        if (!Lodash.isSymbol(name)) {
          const int = parseInt(name, 10);
          if (Lodash.isInteger(int)) {
            return target.getAt(int);
          }
        }

        // Otherwise return the requested property.
        return target[name];
      },

      set(target: Collection<T>, name: string, value: any) {
        if (!Lodash.isSymbol(name)) {
          const int = parseInt(name, 10);
          if (Lodash.isInteger(int)) {
            target.setAt(int, value as T);
            return true;
          }
        }

        return (target[name] = value);
      }
    });
  }

  public concat(...values: T[][]): ICollection<T> {
    const objects = this.getObjects().concat(...values.map(value => Array.from(value)));
    return this.factory<T>(objects);
  }

  public join(char: string): string {
    return this.objects.join(char);
  }

  public splice(start: number, deleteCount?: number, ...replacements: T[]): ICollection<T> {
    const removed = this.objects.splice(start, deleteCount, ...replacements);
    return this.factory<T>(removed);
  }

  public entries() {
    return this.objects.entries();
  }

  public keys() {
    return this.objects.keys();
  }

  public values(): IterableIterator<T> {
    throw new Error(`Array#values() is not supported by Node at the moment.`);
    // return this.objects.values();
  }

  public copyWithin(target: number, start?: number, end?: number): this {
    this.objects.copyWithin(target, start, end);
    return this;
  }

  public findIndex(callback: (this: void, object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): number {
    callback = Collection.bindCallback(callback, arguments, 2);

    let index = -1;

    for (let i = 0, len = this.size(); i < len; i++) {
      if (callback(this.getAt(i), i, this) === true) {
        index = i;
        break;
      }
    }

    return index;
  }

  public sort(comparator?: (a: T, b: T) => number): this {
    this.objects.sort(comparator);
    return this;
  }

  public fill(object: T, start?: number, end?: number): this {
    this.objects.fill(object, start, end);
    return this;
  }

  public compact(): this {
    this.objects = Lodash.compact(this.objects);
    return this;
  }

  public pick<K extends keyof T>(key: K | K[]): ICollection<Pick<T, K>> {
    return this.map(item => pick(item, key));
  }

  public omit<K extends keyof T>(key: K | K[]): ICollection<Omit<T, K>> {
    return this.map(item => omit(item, key));
  }

  public every(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): boolean {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      if (callback(this.getAt(i), i, this) !== true) {
        return false;
      }
    }

    return true;
  }

  public filter<S extends T>(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): ICollection<T> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const result = this.factory<T>([]);

    for (let i = 0, len = this.size(); i < len; i++) {
      const object = this.getAt(i);
      if (callback(object, i, this) === true) {
        result.push(object);
      }
    }

    return result;
  }

  public filterByProperties(properties: Partial<T>): ICollection<T> {
    const objects = Lodash.filter(this.objects, properties as any);
    return this.factory<T>(objects);
  }

  public find(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): T {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      const object = this.getAt(i);
      if (callback(object, i, this) === true) {
        return object;
      }
    }

    return undefined;
  }

  public findByProperties(properties: Partial<T>): T {
    return Lodash.find(this.objects, properties as any);
  }

  public forEach(callback: (object: T, index: number, collection: ICollection<T>) => void, thisArg?: any): void {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      callback(this.getAt(i), i, this);
    }
  }

  public mapByProperty<P extends keyof T>(property: P, options: { unique?: boolean } = {}): ICollection<T[P]> {
    const results = Lodash.map(this.objects, property);
    const final = options.unique ? Lodash.uniq(results) : results;
    return this.factory<T[P]>(final);
  }

  public keyByProperty<P extends keyof T>(property: P): { [p: string]: T; } {
    return Lodash.keyBy(this.objects, property);
  }

  public groupByProperty<P extends keyof T>(property: P): { [p: string]: ICollection<T>; } {
    const raw = Lodash.groupBy(this.objects, property);
    return Object.keys(raw).reduce((acc, key) => Object.assign(acc, { [key]: this.factory<T>(raw[key]) }), {});
  }

  public includes(object: T, startAt?: number): boolean {
    return this.objects.includes(object, startAt);
  }

  public indexOf(object: T, startAt?: number): number {
    return this.objects.indexOf(object, startAt);
  }

  public some(callback: (object: T, index: number, collection: ICollection<T>) => boolean, thisArg?: any): boolean {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      if (callback(this.getAt(i), i, this) === true) {
        return true;
      }
    }

    return false;
  }

  public map<R>(callback: (object: T, index: number, collection: ICollection<T>) => R, thisArg?: any): ICollection<R> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const result = this.factory<R>([]);

    for (let i = 0, len = this.size(); i < len; i++) {
      const mapped = callback(this.getAt(i), i, this);
      result.push(mapped);
    }

    return result;
  }

  public lastIndexOf(object: T, startAt: number = this.lastIndex()): number {
    return this.objects.lastIndexOf(object, startAt);
  }

  public getAt(index: number): T {
    return this.objects[index];
  }

  public setAt(index: number, value: T): this {
    this.objects[index] = value;
    return this;
  }

  public reduce<R>(callback: (acc: R, object: T, index: number, collection: ICollection<T>) => R, initial: R, thisArg?: any): R {
    callback = Collection.bindCallback(callback, arguments, 3);

    for (let i = 0, len = this.size(); i < len; i++) {
      initial = callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public reduceRight<R>(callback: (acc: R, object: T, index: number, collection: ICollection<T>) => R, initial: R, thisArg = this): R {
    callback = Collection.bindCallback(callback, arguments, 3);

    for (let i = this.lastIndex(); i > -1; i--) {
      initial = callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public assignEach(properties: Partial<T>): this {
    for (const object of this.objects) {
      if (!Lodash.isNil(object)) {
        Object.assign(object, properties);
      }
    }

    return this;
  }

  public lastIndex(): number {
    return this.size() - 1;
  }

  public slice(from: number = 0, to: number = this.size()): ICollection<T> {
    return this.factory<T>(this.objects.slice(from, to));
  }

  public orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): ICollection<T> {
    return this.factory<T>(Lodash.orderBy(this.objects, properties, orders));
  }

  public toArray(): T[] {
    // Copy the array to ensure that the instance is not modified.
    return this.objects.slice();
  }

  public uniq(): ICollection<T> {
    return this.factory<T>(Lodash.uniq(this.objects));
  }

  public push(...objects: T[]): number {
    this.objects.push(...objects);
    return this.size();
  }

  public pop(): T {
    return this.objects.pop();
  }

  public reverse(): this {
    this.objects.reverse();
    return this;
  }

  public shift(): T {
    return this.objects.shift();
  }

  public unshift(...objects: T[]): number {
    this.objects.unshift(...objects);
    return this.size();
  }

  public *[Symbol.iterator](): IterableIterator<T> {
    for (const object of this.objects) {
      yield object;
    }
  }

  /* istanbul ignore next */
  public [Symbol.unscopables](): { copyWithin: boolean, entries: boolean, keys: boolean, fill: boolean, find: boolean, findIndex: boolean, values: boolean } {
    return this.objects[Symbol.unscopables]();
  }

  public size(): number {
    return this.objects.length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public async forEachSeries(callback: (item: T, index: number, collection: ICollection<T>) => Promise<void>, thisArg?: any): Promise<void> {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      await callback(this.getAt(i), i, this);
    }
  }

  public async forEachParallel(callback: (item: T, index: number, collection: ICollection<T>) => Promise<void>, thisArg?: any): Promise<void> {
    callback = Collection.bindCallback(callback, arguments, 2);

    await Promise.all(this.objects.map(async (item, index) => {
      await callback(item, index, this);
    }));
  }

  public async mapSeries<R>(callback: (item: T, index: number, collection: ICollection<T>) => Promise<R>, thisArg?: any): Promise<ICollection<R>> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const result = this.factory<R>([]);

    for (let i = 0, len = this.size(); i < len; i++) {
      const mapped = await callback(this.getAt(i), i, this);
      result.push(mapped);
    }

    return result;
  }

  public async mapParallel<R>(callback: (item: T, index: number, collection: ICollection<T>) => Promise<R>, thisArg?: any): Promise<ICollection<R>> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const results = await Promise.all(this.objects.map(async (item: T, index: number) => {
      return await callback(item, index, this);
    }));

    return this.factory<R>(results);
  }

  public async reduceSeries<A>(callback: (acc: A, current: T, index: number, collection: ICollection<T>) => Promise<A>, initial: A, thisArg?: any): Promise<A> {
    callback = Collection.bindCallback(callback, arguments, 3);

    for (let i = 0, len = this.size(); i < len; i++) {
      initial = await callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public getObjects(): T[] {
    return this.objects;
  }

  public setObjects(objects: T[]): this {
    this.objects = objects;
    return this;
  }

  protected factory<Y>(objects: Y[]): ICollection<Y> {
    return new Collection<Y>(objects);
  }

  protected static bindCallback(callback: Function, args: IArguments, lengthIfPresent: number) {
    if (args.length === lengthIfPresent) {
      return callback.bind(args[lengthIfPresent - 1]);
    }
    return callback;
  }

  public static isCollection<T>(obj: any): obj is ICollection<T> {
    return obj instanceof Collection;
  }

  public static isArrayCompatible<T>(obj: any): obj is Array<T> {
    return Array.isArray(obj) || Collection.isCollection<T>(obj);
  }
}


class Child<T> extends Collection<T> {
  private luckyNumber: number;

  public constructor(luckyNumber: number, objects: T[]) {
    super(objects);
    this.luckyNumber = luckyNumber;
  }

  public getLuckyNumber() {
    return this.luckyNumber;
  }

  protected factory<Y>(objects: Y[]) {
    return new Child(this.luckyNumber, objects);
  }
}

const child = new Child(7, [1, 2, 3]);

child.splice(1, 2);

child.getLuckyNumber();

child.forEach((element, index, currentObj: Child<number>) => {
  currentObj.getLuckyNumber();
});
