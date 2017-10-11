import { Collection } from '../../';
import { waitRandom } from '../resources/utils/wait-random';
import { wait } from '@bluejay/utils';

describe('Collection', function () {
  describe('constructor', function () {
    it('should build an empty collection', () => {
      expect(new Collection()).to.deep.equal([]);
    });
    it('should build a collection from an array', () => {
      expect(new Collection([1, 2, 3])).to.deep.equal([1, 2, 3]);
    });
    it('should build an array with a length', () => {
      expect(new Collection(3 as any)).to.have.lengthOf(3);
    });
  });
  describe('#forEachSeries()', function () {
    it('should process elements in series', async () => {
      const order: number[] = [];
      const coll = new Collection([1, 2, 3]);
      await coll.forEachSeries(async item => {
        await waitRandom(3, 15);
        order.push(item);
      });
      expect(order).to.deep.equal([1, 2, 3]);
    });
  });
  describe('#forEachParallel()', function () {
    it('should process elements in parallel', async () => {
      const order: number[] = [];
      const coll = new Collection([1, 2, 3]);
      await coll.forEachParallel(async (item, index) => {
        await wait((coll.length - index + 1) * 5); // Last will be first
        order.push(item);
      });
      expect(order).to.deep.equal([3, 2, 1]);
    });
  });
  describe('#mapSeries()', function () {
    it('should map elements in series', async () => {
      const order: number[] = [];
      const coll = new Collection([1, 2, 3]);
      const map = await coll.mapSeries(async item => {
        await waitRandom(3, 15);
        order.push(item);
        return item;
      });
      expect(map).to.deep.equal([1, 2, 3]);
      expect(order).to.deep.equal([1, 2, 3]);
    });
  });
  describe('#mapParallel()', function () {
    it('should map elements in parallel', async () => {
      const order: number[] = [];
      const coll = new Collection([1, 2, 3]);
      const map = await coll.mapParallel(async (item, index) => {
        await wait((coll.length - index + 1) * 5); // Last will be first
        order.push(item);
        return item;
      });
      expect(map).to.deep.equal([1, 2, 3]); // Map order is respected
      expect(order).to.deep.equal([3, 2, 1]); // But process was indeed parallel
    });
  });

  describe('#reduceSeries()', function () {
    it('should reduce elements in series', async () => {
      const order: number[] = [];
      const coll = new Collection([1, 2, 3]);
      const sum = await coll.reduceSeries(async (initial, item) => {
        await waitRandom(3, 15);
        order.push(item);
        return initial + item;
      }, 0);
      expect(sum).to.equal(6);
      expect(order).to.deep.equal([1, 2, 3]);
    });
  });

  describe('#pluck()', function () {
    it('should pluck values', () => {
      const coll = new Collection([{ a: 1 }, { a: 2 }]);
      const values = coll.pluck('a');
      expect(values).to.deep.equal([1, 2]);
    });
  });

  describe('#assign()', function () {
    it('should assign to all objects', () => {
      const coll = new Collection<{ a: number, b?: boolean }>([{ a: 1 }, { a: 2 }]);
      coll.assign({ b: true });
      coll.forEach(element => expect(element.b).to.equal(true));
    });
  });

  describe('#filterByProperties()', function () {
    it('should filter objects by properties', () => {
      const coll = new Collection([{ a: 1 }, { a: 2 }, { a: 1 }]);
      expect(coll.filterByProperties({ a: 1 })).to.have.lengthOf(2);
    });
  });

  describe('#findByProperties()', function () {
    it('should find an object by properties', () => {
      const first = { a: 1 };
      const coll = new Collection([first, { a: 2 }, { a: 1 }]);
      expect(coll.findByProperties({ a: 1 })).to.equal(first);
    });
  });

  describe('#size()', function () {
    it('should return the array length', () => {
      expect(new Collection([1, 2, 3]).size()).to.equal(3);
    });
  });

  describe('#getAt()', function () {
    it('should return the element at the index', () => {
      expect(new Collection([1, 2, 4]).getAt(1)).to.equal(2);
    });
  });

  describe('#setAt()', function () {
    it('should set the element at the index', () => {
      expect(new Collection([1, 2, 4]).setAt(1, 5).getAt(1)).to.equal(5);
    });
  });

  describe('#isEmpty()', function () {
    it('should return true', () => {
      expect(new Collection().isEmpty()).to.equal(true);
    });
    it('should return false', () => {
      expect(new Collection([1, 2, 3]).isEmpty()).to.equal(false);
    });
  });
});