import { Collection } from '../../';
import { waitRandom } from '../resources/utils/wait-random';
import { wait } from '@bluejay/utils';

describe('Collection', function () {
  describe('constructor', function () {
    it('should build an empty collection', () => {
      expect(new Collection().getObjects()).to.deep.equal([]);
    });
    it('should build a collection from an array', () => {
      expect(new Collection([1, 2, 3]).getObjects()).to.deep.equal([1, 2, 3]);
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
        await wait((coll.size() - index + 1) * 5); // Last will be first
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
        await wait((coll.size() - index + 1) * 5); // Last will be first
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

  describe('#mapByProperty()', function () {
    it('should pluck values', () => {
      const coll = new Collection([{ a: 1 }, { a: 2 }, { a: 2 }]);
      const values = coll.mapByProperty('a');
      expect(values).to.deep.equal([1, 2, 2]);
    });
    it('should return only unique values', () => {
      const coll = new Collection([{ a: 1 }, { a: 2 }, { a: 2 }]);
      const values = coll.mapByProperty('a', { unique: true });
      expect(values).to.deep.equal([1, 2]);
    });
  });

  describe('#assignEach()', function () {
    it('should assign to all objects', () => {
      const coll = new Collection<{ a: number, b?: boolean }>([{ a: 1 }, { a: 2 }]);
      coll.assignEach({ b: true });
      coll.forEach(element => expect(element.b).to.equal(true));
    });
    it('should only assign on non nil objects', () => {
      const coll = new Collection<{ a: number, b?: boolean }>([{ a: 1 }, null, undefined]);
      coll.assignEach({ b: true });
      expect(coll.getAt(0)).to.deep.equal({ a: 1, b: true });
      expect(coll.getAt(1)).to.equal(null);
      expect(coll.getAt(2)).to.equal(undefined);
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

  describe('#compact()', function () {
    it('should compact objects', () => {
      expect(new Collection([1, 2, null]).compact()).to.deep.equal([1, 2]);
    });
  });

  describe('#every()', function () {
    it('should return true', () => {
      const coll = new Collection([1, 2, 3, 4]);
      expect(coll.every(value => typeof value === 'number')).to.equal(true);
    });
    it('should return false', () => {
      const coll = new Collection([1, 2, 3, null]);
      expect(coll.every(value => typeof value === 'number')).to.equal(false);
    });
  });

  describe('#filter()', function () {
    it('should filter objects', () => {
      expect(new Collection([1, 2, 4]).filter(value => value % 2 === 0)).to.deep.equal([2, 4]);
    });
  });

  describe('#includes()', function () {
    it('should return true', () => {
      expect(new Collection([1]).includes(1)).to.equal(true);
    });
    it('should return false', () => {
      expect(new Collection([1]).includes(2)).to.equal(false);
    });
  });

  describe('#indexOf()', function () {
    it('should return 1', () => {
      expect(new Collection([1, 2]).indexOf(2)).to.equal(1);
    });
    it('should return -1', () => {
      expect(new Collection([1, 2]).indexOf(3)).to.equal(-1);
    });
    it('should return the second index', () => {
      expect(new Collection([1, 2, 1]).indexOf(1, 1)).to.equal(2);
    });
  });

  describe('#some()', function () {
    it('should return true', () => {
      expect(new Collection([1, 2]).some(value => value % 2 === 0)).to.equal(true);
    });
    it('should return false', () => {
      expect(new Collection([1, 3]).some(value => value % 2 === 0)).to.equal(false);
    });
  });

  describe('#map()', function () {
    it('should return a mapped array', () => {
      expect(new Collection([1, 2]).map(value => value * 2)).to.deep.equal([2, 4]);
    });
  });

  describe('#lastIndexOf()', function () {
    it('should return 2', () => {
      expect(new Collection([1, 2, 1]).lastIndexOf(1)).to.equal(2);
    });
    it('should return -1', () => {
      expect(new Collection().lastIndexOf(1)).to.equal(-1);
    });
    it('should return the first index', () => {
      expect(new Collection([1, 2, 1]).lastIndexOf(1, 1)).to.equal(0);
    });
  });

  describe('#find()', function () {
    it('should find item', () => {
      expect(new Collection([1]).find(value => value === 1)).to.equal(1);
    });
    it('should NOT find item', () => {
      expect(new Collection().find(value => value === 1)).to.equal(undefined);
    });
  });

  describe('#reduce()', function () {
    it('should reduce objects', () => {
      expect(new Collection([1, 2, 3]).reduce((acc, value) => acc + value, '')).to.equal('123');
    });
  });

  describe('#reduceRight()', function () {
    it('should reduce objects from the right', () => {
      expect(new Collection([1, 2, 3]).reduceRight((acc, value) => acc + value, '')).to.equal('321');
    });
  });

  describe('#lastIndex()', function () {
    it('should return the last index', () => {
      expect(new Collection([1, 2]).lastIndex()).to.equal(1);
    });
    it('should return -1 if no objects', function () {
      expect(new Collection().lastIndex()).to.equal(-1);
    });
  });

  describe('#slice()', function () {
    it('should return a cloned array', () => {
      expect(new Collection([1, 2, 3]).slice()).to.deep.equal([1, 2, 3]);
    });
    it('should return everything after given index', () => {
      expect(new Collection([1, 2, 3]).slice(1)).to.deep.equal([2, 3]);
    });
    it('should return items between the range', () => {
      expect(new Collection([1, 2, 3, 4]).slice(1, 3)).to.deep.equal([2, 3]);
    });
  });

  describe('#orderBy()', function () {
    it('should order by a single property', () => {
      const coll = new Collection([{ a: 1 }, { a: 3 }, { a: 2 }]);
      const objects = coll.orderBy('a');
      expect(objects).to.deep.equal([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });
    it('should order by two properties', () => {
      const coll = new Collection([{ a: 1, b: 'c' }, { a: 2, b: 'b' }, { a: 2, b: 'a' }]);
      const objects = coll.orderBy(['a', 'b']);
      expect(objects).to.deep.equal([{ a: 1, b: 'c' }, { a: 2, b: 'a' }, { a: 2, b: 'b' }]);
    });
    it('should accept special ordering', () => {
      const coll = new Collection([{ a: 2, b: 'b' }, { a: 1, b: 'c' }, { a: 2, b: 'a' }]);
      const objects = coll.orderBy(['a', 'b'], ['asc', 'desc']);
      expect(objects).to.deep.equal([{ a: 1, b: 'c' }, { a: 2, b: 'b' }, { a: 2, b: 'a' }]);
    });
  });

  describe('#toArray()', function () {
    it('should return a new array', () => {
      const objects = [1, 2, 3];
      const coll = new Collection(objects);
      expect(coll.toArray()).to.not.equal(objects);
    });
  });

  describe('#getObjects()', function () {
    it('should return the collection objects', () => {
      const objects = [1, 2, 3];
      const coll = new Collection(objects);
      expect(coll.getObjects()).to.equal(objects);
    });
  });

  describe('#uniq()', function () {
    it('should return uniq values', () => {
      expect(new Collection([1, 2, 2]).uniq()).to.deep.equal([1, 2]);
    });
  });

  describe('#push()', function () {
    it('should push an object', () => {
      const coll = new Collection();
      expect(coll.size()).to.equal(0);
      coll.push(1);
      expect(coll.size()).to.equal(1);
    });
    it('should push multiple objects', () => {
      const coll = new Collection();
      expect(coll.size()).to.equal(0);
      coll.push(1, 2, 3);
      expect(coll.size()).to.equal(3);
    });
  });

  describe('#pop()', function () {
    it('should pop object', () => {
      const coll = new Collection([1, 2, 3]);
      expect(coll.size()).to.equal(3);
      expect(coll.pop()).to.equal(3);
      expect(coll.size()).to.equal(2);
    });
  });

  describe('#reserve()', function () {
    it('should reverse objects', () => {
      const coll = new Collection([1, 2, 3]);
      coll.reverse();
      expect(coll.getObjects()).to.deep.equal([3, 2, 1]);
    });
  });

  describe('#shift()', function () {
    it('should shift object', () => {
      const coll = new Collection([1, 2, 3]);
      expect(coll.size()).to.equal(3);
      expect(coll.shift()).to.equal(1);
      expect(coll.size()).to.equal(2);
    });
  });

  describe('#unshift()', function () {
    it('should unshift a single object', () => {
      const coll = new Collection();
      expect(coll.size()).to.equal(0);
      coll.unshift(1);
      expect(coll.size()).to.equal(1);
    });
    it('should unshift multiple objects', () => {
      const coll = new Collection();
      expect(coll.size()).to.equal(0);
      coll.unshift(1, 2, 3);
      expect(coll.size()).to.equal(3);
    });
  });

  describe('Symbol.iterator', function () {
    it('should iterate over objects', () => {
      const coll = new Collection([1, 2, 3]);
      const collected = [];
      for (const object of coll) {
        collected.push(object);
      }
      expect(collected).to.deep.equal([1, 2, 3]);
    });
  });

  describe('#setObjects()', function () {
    it('should override objects', () => {
      const coll = new Collection([1, 2, 3]);
      const objects = [4, 5, 6];
      coll.setObjects(objects);
      expect(coll.getObjects()).to.equal(objects);
    });
  });
});