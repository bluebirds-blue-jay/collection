import { ICollection } from '../interfaces/collection';
import * as Lodash from 'lodash';
import { omit, Omit, pick } from '@bluejay/utils';

export class Collection<T> implements ICollection<T> {
  [index: number]: T; // Objects are accessible through collection[index]
  private objects: T[];

  public get length() { return this.size(); }

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

  public concat(...values: T[][]): T[] {
    // FIXME
    return this.getObjects();
  }

  public join(char: string): string {
    // FIXME
    return '';
  }

  public splice(start: number, deleteCount?: number): T[];
  public splice(start: number, deleteCount: number, ...replacements: T[]): T[] {
    this.objects.splice(start, deleteCount, ...replacements);
    // FIXME
    return this.objects;
  }

  public entries() {
    return this.objects.entries();
  }

  public keys() {
    return this.objects.keys();
  }

  public values() {
    return this.objects.values();
  }

  public copyWithin(target: number, start?: number, end?: number): this {
    this.objects.copyWithin(target, start, end);
    return this;
  }

  public findIndex(callback: (this: void, object: T, index: number, collection: T[]) => boolean): number {
    return this.objects.findIndex(callback);
  }

  public fill(object: T, start?: number, end?: number): this {
    this.objects.fill(object, start, end);
    return this;
  }

  public sort(comparator?: (a: T, b: T) => number): this {
    this.objects.sort(comparator);
    return this;
  }


  public compact(): T[] {
    return Lodash.compact(this.objects);
  }

  public pick<K extends keyof T>(key: K | K[]): Pick<T, K>[] {
    return this.map(item => pick(item, key));
  }

  public omit<K extends keyof T>(key: K | K[]): Omit<T, K>[] {
    return this.map(item => omit(item, key));
  }

  public every(callback: (object: T, index: number, collection: T[]) => boolean, thisArg: any = this): boolean {
    return this.objects.every(callback.bind(thisArg));
  }

  public filter<S extends T>(callback: (object: T, index: number, collection: T[]) => object is S, thisArg = this): T[] {
    return this.objects.filter(callback.bind(thisArg));
  }

  public filterByProperties(properties: Partial<T>): T[] {
    return Lodash.filter(this.objects, properties as any);
  }

  public find(callback: (object: T, index: number, collection: T[]) => boolean, thisArg = this): T {
    return this.objects.find(callback.bind(thisArg));
  }

  public findByProperties(properties: Partial<T>): T {
    return Lodash.find(this.objects, properties as any);
  }

  public forEach(callback: (object: T, index: number, collection: T[]) => void, thisArg = this): void {
    this.objects.forEach(callback.bind(thisArg));
  }

  public mapByProperty<P extends keyof T>(property: P, options: { unique?: boolean } = {}): T[P][] {
    const results = Lodash.map(this.objects, property);
    return options.unique ? Lodash.uniq(results) : results;
  }

  public keyByProperty<P extends keyof T>(property: P): { [p: string]: T; } {
    return Lodash.keyBy(this.objects, property);
  }

  public groupByProperty<P extends keyof T>(property: P): { [p: string]: T[]; } {
    return Lodash.groupBy(this.objects, property);
  }

  public includes(object: T, startAt?: number): boolean {
    return this.objects.includes(object, startAt);
  }

  public indexOf(object: T, startAt?: number): number {
    return this.objects.indexOf(object, startAt);
  }

  public some(callback: (object: T, index: number, collection: T[]) => boolean, thisArg = this): boolean {
    return this.objects.some(callback.bind(thisArg));
  }

  public map<R>(callback: (object: T, index: number, collection: T[]) => R, thisArg = this): R[] {
    return this.objects.map(callback.bind(thisArg));
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

  public reduce<R>(callback: (acc: R, object: T, index: number, collection: T[]) => R, initial: R, thisArg = this): R {
    return this.objects.reduce(callback.bind(thisArg), initial);
  }

  public reduceRight<R>(callback: (acc: R, object: T, index: number, collection: T[]) => R, initial: R, thisArg = this): R {
    return this.objects.reduceRight(callback.bind(this), initial);
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

  public slice(from: number = 0, to: number = this.size()): T[] {
    return this.objects.slice(from, to);
  }

  public orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): T[] {
    return Lodash.orderBy(this.objects, properties, orders);
  }

  public toArray(): T[] {
    return this.slice();
  }

  public uniq(): T[] {
    return Lodash.uniq(this.objects);
  }

  public push(...objects: T[]): number {
    this.objects.push(...objects);
    return this.size();
  }

  public pop(): T {
    return this.objects.pop();
  }

  public reverse(): T[] {
    this.objects.reverse();
    return this.toArray();
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

  public [Symbol.unscopables](): { copyWithin: boolean, entries: boolean, keys: boolean, fill: boolean, find: boolean, findIndex: boolean, values: boolean } {
    return this.objects[Symbol.unscopables]();
  }

  public size(): number {
    return this.objects.length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public async forEachSeries(callback: (item: T, index?: number) => Promise<void>): Promise<void> {
    for (let i = 0, len = this.size(); i < len; i++) {
      await callback(this.getAt(i), i);
    }
  }

  public async forEachParallel(callback: (item: T, index?: number) => Promise<void>): Promise<void> {
    await Promise.all(this.objects.map(async (item, index) => {
      await callback(item, index);
    }));
  }

  public async mapSeries<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0, len = this.size(); i < len; i++) {
      results.push(await callback(this.getAt(i), i));
    }

    return results;
  }

  public async mapParallel<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]> {
    return await Promise.all(this.objects.map(async (item: T, index: number) => {
      return await callback(item, index);
    }));
  }

  public async reduceSeries<A>(callback: (acc: A, current: T, index?: number) => Promise<A>, initial: A): Promise<A> {
    for (let i = 0, len = this.size(); i < len; i++) {
      initial = await callback(initial, this.getAt(i), i);
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

}