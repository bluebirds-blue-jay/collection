import { ICollection } from './collection';

export interface ICollectionConstructor<T> {
  new(items?: T[]): ICollection<T>;
}
