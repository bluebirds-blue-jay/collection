import { ICollection } from '../interfaces/collection';
import * as Lodash from 'lodash';
import { omit, Omit, pick } from '@bluejay/utils';

export class Collection<T> implements ICollection<T> {
  [index: number]: T; // Objects are accessible through collection[index]

  private objects: T[];

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

  public compact(): T[] {
    return Lodash.compact(this.objects);
  }

  public pick<K extends keyof T>(key: K | K[]): Pick<T, K>[] {
    return this.map(item => pick(item, key));
  }

  public omit<K extends keyof T>(key: K | K[]): Omit<T, K>[] {
    return this.map(item => omit(item, key));
  }

  public every(callback: (object: T, index?: number) => boolean): boolean {
    return this.objects.every(callback);
  }

  public filter(callback: (object: T, index?: number) => boolean): T[] {
    return this.objects.filter(callback);
  }

  public filterByProperties(properties: Partial<T>): T[] {
    return Lodash.filter(this.objects, properties as any);
  }

  public find(callback: (object: T, index?: number) => boolean): T {
    return this.objects.find(callback);
  }

  public findByProperties(properties: Partial<T>): T {
    return Lodash.find(this.objects, properties as any);
  }

  public forEach(callback: (object: T, index?: number) => void): void {
    this.objects.forEach(callback);
  }

  public mapByProperty<P extends keyof T>(property: P, options: { unique?: boolean } = {}): T[P][] {
    const results = Lodash.map(this.objects, property);
    return options.unique ? Lodash.uniq(results) : results;
  }

  public keyByProperty<P extends keyof T>(property: P): { [p: string]: T; } {
    return Lodash.keyBy(this.objects, property);
  }

  public includes(object: T, startAt?: number): boolean {
    return this.objects.includes(object, startAt);
  }

  public indexOf(object: T, startAt?: number): number {
    return this.objects.indexOf(object, startAt);
  }

  public some(callback: (object: T, index?: number) => boolean): boolean {
    return this.objects.some(callback);
  }

  public map<R>(callback: (object: T, index?: number) => R): R[] {
    return this.objects.map(callback);
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

  public reduce<R>(callback: (acc: R, object: T, index?: number) => R, initial: R): R {
    return this.objects.reduce(callback, initial);
  }

  public reduceRight<R>(callback: (acc: R, object: T, index?: number) => R, initial: R): R {
    return this.objects.reduceRight(callback, initial);
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

  public push(...objects: T[]): this {
    this.objects.push(...objects);
    return this;
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

  public unshift(...objects: T[]): this {
    this.objects.unshift(...objects);
    return this;
  }

  public *[Symbol.iterator](): IterableIterator<T> {
    for (const object of this.objects) {
      yield object;
    }
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