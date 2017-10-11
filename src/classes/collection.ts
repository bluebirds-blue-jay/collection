import { ICollection } from '../interfaces/collection';
import * as Lodash from 'lodash';

export class Collection<T> extends Array implements ICollection<T> {
  public constructor(objects: T[] = []) {
    const isArray = Array.isArray(objects);

    // The engine will call this constructor with a length parameter when you do a .map() for example, so we need to
    // handle the case where the constructor is not called with an array of objects.
    super(isArray ? 0 : arguments[0]);

    // Push elements into the array, this will set the property length and populate it.
    if (isArray) {
      this.push(...objects);
    }
  }

  public getAt(index: number): T {
    return this[index];
  }

  public setAt(index: number, value: T): this {
    this[index] = value;
    return this;
  }

  public size() {
    return this.length;
  }

  public isEmpty() {
    return this.size() === 0;
  }

  public async forEachSeries(callback: (item: T, index?: number) => Promise<void>): Promise<void> {
    for (let i = 0, len = this.size(); i < len; i++) {
      await callback(this.getAt(i), i);
    }
  }

  public async forEachParallel(callback: (item: T, index?: number) => Promise<void>): Promise<void> {
    await Promise.all(this.map(async (item, index) => {
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
    return await Promise.all(this.map(async (item: T, index: number) => {
      return await callback(item, index);
    }));
  }

  public async reduceSeries<A>(callback: (acc: A, current: T, index?: number) => Promise<A>, initial: A): Promise<A> {
    for (let i = 0, len = this.size(); i < len; i++) {
      initial = await callback(initial, this.getAt(i), i);
    }
    return initial;
  }

  public pluck<P extends keyof T>(property: P): T[P][] {
    return Lodash.map(this, property);
  }

  public assign(properties: Partial<T>): this {
    for (const item of this) {
      Object.assign(item, properties);
    }
    return this;
  }

  public filterByProperties(properties: Partial<T>): T[] {
    return Lodash.filter(this, properties);
  }

  public findByProperties(properties: Partial<T>): T {
    return Lodash.find(this, properties);
  }
}