import { Omit } from '@bluejay/utils';
import { ICollection } from '..';
export declare class Collection<T> extends Array<T> implements ICollection<T> {
    constructor(objects?: T[]);
    concat(...values: T[][]): ICollection<T>;
    /**
     * This is a full re-implementation of splice which we're forced to provide in order to support inheritance of
     * Collection.
     * This implementation is based on
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
     */
    splice(start: number, deleteCount?: number, ...replacements: T[]): ICollection<T>;
    copyWithin(target: number, start?: number, end?: number): this;
    findIndex(callback: (this: void, object: T, index: number, collection: this) => boolean, thisArg?: any): number;
    sort(comparator?: (a: T, b: T) => number): this;
    fill(object: T, start?: number, end?: number): this;
    compact(): this;
    pick<K extends keyof T>(key: K | K[]): ICollection<Pick<T, K>>;
    omit<K extends keyof T>(key: K | K[]): ICollection<Omit<T, K>>;
    every(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean;
    filter(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): ICollection<T>;
    filterByProperties(properties: Partial<T>): ICollection<T>;
    find(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): T | undefined;
    findByProperties(properties: Partial<T>): T | undefined;
    forEach(callback: (object: T, index: number, collection: this) => void, thisArg?: any): void;
    mapByProperty<P extends keyof T>(property: P, options?: {
        unique?: boolean;
    }): ICollection<T[P]>;
    keyByProperty<P extends keyof T>(property: P): {
        [p: string]: T;
    };
    groupByProperty<P extends keyof T>(property: P): {
        [p: string]: ICollection<T>;
    };
    some(callback: (object: T, index: number, collection: this) => boolean, thisArg?: any): boolean;
    map<R>(callback: (object: T, index: number, collection: this) => R, thisArg?: any): ICollection<R>;
    getAt(index: number): T;
    setAt(index: number, value: T): this;
    reduce<R>(callback: (acc: R, object: T, index: number, collection: this) => R, initial: R, thisArg?: any): R;
    reduceRight<R>(callback: (acc: R, object: T, index: number, collection: this) => R, initial: R, thisArg?: this): R;
    assignEach(properties: Partial<T>): this;
    lastIndex(): number;
    slice(from?: number, to?: number): ICollection<T>;
    orderBy(properties: (keyof T)[] | keyof T, orders?: ('asc' | 'desc')[]): ICollection<T>;
    toArray(): T[];
    uniq(): ICollection<T>;
    reverse(): this;
    size(): number;
    isEmpty(): boolean;
    forEachSeries(callback: (item: T, index: number, collection: this) => Promise<void>, thisArg?: any): Promise<void>;
    forEachParallel(callback: (item: T, index: number, collection: this) => Promise<void>, thisArg?: any): Promise<void>;
    mapSeries<R>(callback: (item: T, index: number, collection: this) => Promise<R>, thisArg?: any): Promise<ICollection<R>>;
    mapParallel<R>(callback: (item: T, index: number, collection: this) => Promise<R>, thisArg?: any): Promise<ICollection<R>>;
    reduceSeries<A>(callback: (acc: A, current: T, index: number, collection: this) => Promise<A>, initial: A, thisArg?: any): Promise<A>;
    getObjects(): T[];
    setObjects(objects: T[]): this;
    clone<R extends this>(): R;
    cloneDeep<R extends this>(): R;
    protected factory<Y>(objects: Y[]): ICollection<Y>;
    protected static bindCallback(callback: Function, args: IArguments, lengthIfPresent: number): any;
    static isCollection<T>(obj: any): obj is ICollection<T>;
    static isArrayCompatible<T>(obj: any): obj is Array<T>;
}
