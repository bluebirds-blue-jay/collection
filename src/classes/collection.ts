import { cloneDeep, omit, Omit, pick } from '@bluejay/utils';
import * as Lodash from 'lodash';
import { ICollection } from '..';

const { version } = require('../../package.json');
const VERSION_PROPERTY = '__bluejayCollectionVersion';

export class Collection<T> extends Array<T> implements ICollection<T> {
  public constructor(objects: T[] = []) {
    if (objects.length > 1) {
      const len = objects.length;

      super(len);

      for (let i = 0; i < len; i++) {
        this[i] = objects[i];
      }
    } else {
      super(objects.length);
      if (objects.length) {
        this[0] = objects[0];
      }
    }

    Object.defineProperty(this, VERSION_PROPERTY, {
      value: version,
      enumerable: false
    });

    Object.defineProperty(this, '__isPureCollection', {
      value: new.target === Collection,
      enumerable: false
    });
  }

  public concat(...values: T[][]): ICollection<T> {
    const ret = this.factory<T>(this);

    for (const value of values) {
      if (Array.isArray(value)) {
        for (let i = 0, len = value.length; i < len; i++) {
          ret.push(value[i]);
        }
      } else {
        ret.push(value);
      }
    }

    return ret;
  }

  /**
   * This is a full re-implementation of splice which we're forced to provide in order to support inheritance of
   * Collection.
   * This implementation is based on
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
   */
  public splice(start: number, deleteCount?: number, ...replacements: T[]): ICollection<T> {
    const removed = this.factory<T>([]);
    const len = this.size();

    if (start < 0) {
      // Start from length - (start - 1)
      // If this is negative, then start at 0
      start = Math.max(len + start, 0);
    } else if (start > len) {
      start = len;
    }

    if (!Lodash.isNumber(deleteCount) || deleteCount > len - start) {
      deleteCount = len - start;
    }

    // Build a new array with final values
    const rewritten: T[] = [];

    // Keep the part before "start"
    for (let i = 0; i < start; i++) {
      rewritten[i] = this.getAt(i);
    }

    for (let i = start, j = start + deleteCount; i < j; i++) {
      removed.push(this.getAt(i));
    }

    // Insert replacements
    for (const replacement of replacements) {
      rewritten.push(replacement);
    }

    // Insert non deleted elements
    for (let i = start + deleteCount; i < len; i++) {
      rewritten.push(this.getAt(i));
    }

    // Rewrite the current array
    for (let i = 0, rewrittenLen = rewritten.length; i < rewrittenLen; i++) {
      this.setAt(i, rewritten[i]);
    }

    // Remove exceeding elements
    while (this.size() > rewritten.length) {
      this.pop();
    }

    // Finally return the removed elements
    return removed;
  }

  public copyWithin(target: number, start?: number, end?: number): this {
    super.copyWithin(target, start as number, end);
    return this;
  }

  public findIndex(
    callback: (this: void, object: T, index: number, collection: this) => boolean, thisArg?: any
  ): number {
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
    super.sort(comparator);
    return this;
  }

  public fill(object: T, start?: number, end?: number): this {
    super.fill(object, start, end);
    return this;
  }

  public compact(): this {
    this.setObjects(Lodash.compact(this));
    return this;
  }

  public pick<K extends keyof T>(key: K | K[]): ICollection<Pick<T, K>> {
    return this.map(item => pick(item, key));
  }

  public omit<K extends keyof T>(key: K | K[]): ICollection<Omit<T, K>> {
    return this.map(item => omit(item, key));
  }

  public every(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      if (callback(this.getAt(i), i, this) !== true) {
        return false;
      }
    }

    return true;
  }

  public filter(
    callback: (object: T, index: number, collection: this) => boolean,
    thisArg?: any
  ): ICollection<T> {
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
    const objects = Lodash.filter(this, properties as any);
    return this.factory<T>(objects);
  }

  public find(
    callback: (object: T, index: number, collection: this) => boolean,
    thisArg?: any
  ): T | undefined {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      const object = this.getAt(i);
      if (callback(object, i, this) === true) {
        return object;
      }
    }

    return undefined;
  }

  public findByProperties(properties: Partial<T>): T | undefined {
    return Lodash.find(this, properties as any);
  }

  public forEach(callback: (object: T, index: number, collection: this) => void, thisArg?: any): void {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      callback(this.getAt(i), i, this);
    }
  }

  public mapByProperty<P extends keyof T>(property: P, options: { unique?: boolean } = {}): ICollection<T[P]> {
    const results = Lodash.map(this, property);
    const final = options.unique ? Lodash.uniq(results) : results;
    return this.factory<T[P]>(final);
  }

  public keyByProperty<P extends keyof T>(property: P): { [p: string]: T; } {
    return Lodash.keyBy(this, property as string);
  }

  public groupByProperty<P extends keyof T>(property: P): { [p: string]: ICollection<T>; } {
    const raw = Lodash.groupBy(this, property as string);
    return Object.keys(raw).reduce((acc, key) => Object.assign(acc, { [key]: this.factory<T>(raw[key]) }), {});
  }

  public some(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      if (callback(this.getAt(i), i, this) === true) {
        return true;
      }
    }

    return false;
  }

  public map<R>(callback: (object: T, index: number, collection: this) => R, thisArg?: any): ICollection<R> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const result = this.factory<R>([]);

    for (let i = 0, len = this.size(); i < len; i++) {
      const mapped = callback(this.getAt(i), i, this);
      result.push(mapped);
    }

    return result;
  }

  public getAt(index: number): T {
    return this[index];
  }

  public setAt(index: number, value: T): this {
    this[index] = value;
    return this;
  }

  public reduce<R = T>(callback: (acc: R, object: T, index: number, collection: this) => R, initial?: R): R;
  public reduce<R>(callback: (acc: R, object: T, index: number, collection: this) => R, initial: R): R {
    let i = 0;

    if (arguments.length < 2) {
      i = 1;
      initial = this.getAt(0) as any;
    }

    for (let len = this.size(); i < len; i++) {
      initial = callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public reduceRight<R = T>(callback: (acc: R, object: T, index: number, collection: this) => R, initial?: R): R;
  public reduceRight<R>(callback: (acc: R, object: T, index: number, collection: this) => R, initial: R): R {
    let i = this.lastIndex();

    if (arguments.length < 2) {
      i = i - 1;
      initial = this.getAt(0) as any;
    }

    for (; i > -1; i--) {
      initial = callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public assignEach(properties: Partial<T>): this {
    for (const object of this) {
      if (!Lodash.isNil(object)) {
        Object.assign(object, properties);
      }
    }

    return this;
  }

  public lastIndex(): number {
    return this.size() - 1;
  }

  public slice(from = 0, to: number = this.size()): ICollection<T> {
    const res = super.slice(from, to);
    return this.factory<T>(res);
  }

  public orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): ICollection<T> {
    return this.factory<T>(Lodash.orderBy(this, properties as string | string[], orders));
  }

  public toArray(): T[] {
    return Array.from(this);
  }

  public uniq(): ICollection<T> {
    return this.factory<T>(Lodash.uniq(this));
  }

  public reverse(): this {
    super.reverse();
    return this;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public async forEachSeries(
    callback: (item: T, index: number, collection: this) => Promise<void>,
    thisArg?: any
  ): Promise<void> {
    callback = Collection.bindCallback(callback, arguments, 2);

    for (let i = 0, len = this.size(); i < len; i++) {
      await callback(this.getAt(i), i, this);
    }
  }

  public async forEachParallel(
    callback: (item: T, index: number, collection: this) => Promise<void>,
    thisArg?: any
  ): Promise<void> {
    callback = Collection.bindCallback(callback, arguments, 2);

    await Promise.all(this.map(async (item, index) => {
      await callback(item, index, this);
    }));
  }

  public async mapSeries<R>(
    callback: (item: T, index: number, collection: this) => Promise<R>,
    thisArg?: any
  ): Promise<ICollection<R>> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const result = this.factory<R>([]);

    for (let i = 0, len = this.size(); i < len; i++) {
      const mapped = await callback(this.getAt(i), i, this);
      result.push(mapped);
    }

    return result;
  }

  public async mapParallel<R>(
    callback: (item: T, index: number, collection: this) => Promise<R>,
    thisArg?: any
  ): Promise<ICollection<R>> {
    callback = Collection.bindCallback(callback, arguments, 2);

    const results = await Promise.all(this.map(async (item: T, index: number) => {
      return await callback(item, index, this);
    }));

    return this.factory<R>(results);
  }

  public async reduceSeries<A>(
    callback: (acc: A, current: T, index: number, collection: this) => Promise<A>,
    initial: A,
    thisArg?: any
  ): Promise<A> {
    callback = Collection.bindCallback(callback, arguments, 3);

    for (let i = 0, len = this.size(); i < len; i++) {
      initial = await callback(initial, this.getAt(i), i, this);
    }

    return initial;
  }

  public getObjects(): T[] {
    return this.toArray();
  }

  public setObjects(objects: T[]): this {
    this.splice(0);
    this.push(...objects);
    return this;
  }

  public clone(): this {
    if (!(this as any).__isPureCollection) {
      throw new Error(`Collection subclasses do not support cloning.`);
    }
    return this.factory(this.getObjects()) as this;
  }

  public cloneDeep(): this {
    return this.clone().map(object => cloneDeep(object)) as this;
  }

  protected factory<Y>(objects: Y[]): ICollection<Y> {
    return new Collection<Y>(objects) as ICollection<Y>;
  }

  protected static bindCallback(callback: Function, args: IArguments, lengthIfPresent: number) {
    if (args.length === lengthIfPresent) {
      return callback.bind(args[lengthIfPresent - 1]);
    }
    return callback;
  }

  public static isCollection<T>(obj: any): obj is ICollection<T> {
    return obj instanceof Collection || Array.isArray(obj) && typeof (obj as any)[VERSION_PROPERTY] === 'string';
  }

  public static isArrayCompatible<T>(obj: any): obj is Array<T> {
    return Array.isArray(obj) || Collection.isCollection<T>(obj);
  }
}
