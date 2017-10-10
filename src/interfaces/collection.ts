export interface ICollection<T> extends Array<T> {
  forEachSeries(callback: (item: T, index?: number) => Promise<void>): Promise<void>;
  forEachParallel(callback: (item: T, index?: number) => Promise<void>): Promise<void>;
  mapSeries<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]>;
  mapParallel<R>(callback: (item: T, index?: number) => Promise<R>): Promise<R[]>;
  reduceSeries<A>(callback: (acc: A, current: T, index?: number) => Promise<A>, initial: A): Promise<A>;
  pluck<P extends keyof T>(property: P): (T[P])[];
  assign(properties: Partial<T>): this;
  filterByProperties(properties: Partial<T>): T[];
  findByProperties(properties: Partial<T>): T;
  getAt(index: number): T;
  setAt(index: number, value: T): this;
  size(): number;
}