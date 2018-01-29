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
    it('should be an array', () => {
      expect(Array.isArray(new Collection([1, 2, 3]))).to.equal(true);
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
      expect(map.toArray()).to.deep.equal([1, 2, 3]);
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
      expect(map.toArray()).to.deep.equal([1, 2, 3]); // Map order is respected
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
      expect(values.toArray()).to.deep.equal([1, 2, 2]);
    });
    it('should return only unique values', () => {
      const coll = new Collection([{ a: 1 }, { a: 2 }, { a: 2 }]);
      const values = coll.mapByProperty('a', { unique: true });
      expect(values.toArray()).to.deep.equal([1, 2]);
    });
  });

  describe('#keyByProperty()', function () {
    it('should key values', () => {
      const coll = new Collection([{ a: '1' }, { a: '2' }, { a: '2' }]);
      const values = coll.keyByProperty('a');
      const expected = { '1': { a: '1' }, '2': { a: '2' } };
      expect(values).to.eql(expected);
    });
  });

  describe('#groupByProperty()', function () {
    it('should group values', () => {
      const coll = new Collection([{ a: '1' }, { a: '2' }, { a: '2' }]);
      const values = coll.groupByProperty('a');
      expect(values).to.have.keys(['1', '2']);
      expect(values[1].toArray()).to.deep.equal([{ a: '1' }]);
      expect(values[2].toArray()).to.deep.equal([{ a: '2' }, { a: '2' }]);
    });
  });

  describe('#assignEach()', function () {
    it('should assign to all objects', () => {
      const coll = new Collection<{ a: number, b?: boolean }>([{ a: 1 }, { a: 2 }]);
      coll.assignEach({ b: true });
      coll.forEach(element => expect(element.b).to.equal(true));
    });
    it('should only assign on non nil objects', () => {
      const coll = new Collection<{ a: number, b?: boolean } | null | undefined>([{ a: 1 }, null, undefined]);
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
      expect(new Collection([1, 2, null]).compact().toArray()).to.deep.equal([1, 2]);
    });
  });

  describe('#pick()', function () {
    it('should pick keys from an array', () => {
      expect(new Collection([{ a: 1, b: 1 }, { a: 2, b: 2 }]).pick(['a']).toArray()).to.deep.equal([{ a: 1 }, { a: 2 }]);
    });
  });

  describe('#omit()', function () {
    it('should omit keys from an array', () => {
      expect(new Collection([{ a: 1, b: 1 }, { a: 2, b: 2 }]).omit(['a']).toArray()).to.deep.equal([{ b: 1 }, { b: 2 }]);
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
      expect(new Collection([1, 2, 4]).filter(value => value % 2 === 0).toArray()).to.deep.equal([2, 4]);
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
      expect(new Collection([1, 2]).map(value => value * 2).toArray()).to.deep.equal([2, 4]);
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
      expect(new Collection([1, 2, 3]).slice().toArray()).to.deep.equal([1, 2, 3]);
    });
    it('should return everything after given index', () => {
      expect(new Collection([1, 2, 3]).slice(1).toArray()).to.deep.equal([2, 3]);
    });
    it('should return items between the range', () => {
      expect(new Collection([1, 2, 3, 4]).slice(1, 3).toArray()).to.deep.equal([2, 3]);
    });
  });

  describe('#orderBy()', function () {
    it('should order by a single property', () => {
      const coll = new Collection([{ a: 1 }, { a: 3 }, { a: 2 }]);
      const objects = coll.orderBy('a').toArray();
      expect(objects).to.deep.equal([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });
    it('should order by two properties', () => {
      const coll = new Collection([{ a: 1, b: 'c' }, { a: 2, b: 'b' }, { a: 2, b: 'a' }]);
      const objects = coll.orderBy(['a', 'b']).toArray();
      expect(objects).to.deep.equal([{ a: 1, b: 'c' }, { a: 2, b: 'a' }, { a: 2, b: 'b' }]);
    });
    it('should accept special ordering', () => {
      const coll = new Collection([{ a: 2, b: 'b' }, { a: 1, b: 'c' }, { a: 2, b: 'a' }]);
      const objects = coll.orderBy(['a', 'b'], ['asc', 'desc']).toArray();
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
      expect(coll.getObjects()).to.equal(coll);
    });
  });

  describe('#uniq()', function () {
    it('should return uniq values', () => {
      expect(new Collection([1, 2, 2]).uniq().toArray()).to.deep.equal([1, 2]);
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

  describe('#reverse()', function () {
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
      expect(coll.getObjects()).to.deep.equal(objects);
    });
    it('should store an array from a collection', () => {
      const original = new Collection([1, 2, 3]);
      const overridden = new Collection();
      overridden.setObjects(original);
      expect(overridden.getObjects()).to.be.an('array');
    });
  });

  describe('[] accessibility', function () {
    it('should set an object using [index]', () => {
      const coll = new Collection([1, 2, 3]);
      coll[1] = 10;
      expect(coll.getAt(1)).to.equal(10);
    });
    it('should get an object using [index]', () => {
      const coll = new Collection([1, 2, 3]);
      expect(coll[1]).to.equal(2);
    });
  });

  describe('#concat()', () => {
    it('should concat objects from an array', () => {
      const coll = new Collection([1, 2, 3]);
      const toAdd = [4, 5, 6];
      const concatenated = coll.concat(toAdd);
      expect(concatenated.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
    it('should concat objects from a collection', () => {
      const coll = new Collection([1, 2, 3]);
      const toAdd = new Collection([4, 5, 6]);
      const concatenated = coll.concat(toAdd);
      expect(concatenated.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('#join()', () => {
    it('should join elements', () => {
      expect(new Collection([1, 2, 3]).join('')).to.equal('123');
    });
  });

  describe('#splice()', () => {
    it('should remove 0 elements from index 2, and insert "drum"', () => {
      const coll = new Collection(['angel', 'clown', 'mandarin', 'sturgeon']);
      const arr = ['angel', 'clown', 'mandarin', 'sturgeon'];
      const collResult = coll.splice(2, 0, 'drum');
      const arrResult = arr.splice(2, 0, 'drum');
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should splice all objects', () => {
      const coll = new Collection([1, 2, 3]);
      const arr = [1, 2, 3];
      const collResult = coll.splice(0);
      const arrResult = arr.splice(0);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should splice objects', () => {
      const coll = new Collection([1, 2, 3]);
      const arr = [1, 2, 3];
      const collResult = coll.splice(1, 2);
      const arrResult = arr.splice(1, 2);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should splice objects with replacements', () => {
      const coll = new Collection([1, 2, 3]);
      const arr = [1, 2, 3];
      const collResult = coll.splice(1, 2, 2, 3);
      const arrResult = arr.splice(1, 2, 2, 3);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove 1 element from index 3', () => {
      const coll = new Collection(['angel', 'clown', 'drum', 'mandarin', 'sturgeon']);
      const arr = ['angel', 'clown', 'drum', 'mandarin', 'sturgeon'];
      const collResult = coll.splice(3, 1);
      const arrResult = arr.splice(3, 1);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove 1 element from index 2, and insert "trumpet"', () => {
      const coll = new Collection(['angel', 'clown', 'drum', 'sturgeon']);
      const arr = ['angel', 'clown', 'drum', 'sturgeon'];
      const collResult = coll.splice(2, 1, 'trumpet');
      const arrResult = arr.splice(2, 1, 'trumpet');
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove 2 elements from index 0, and insert "parrot", "anemone" and "blue"', () => {
      const coll = new Collection(['angel', 'clown', 'trumpet', 'sturgeon']);
      const arr = ['angel', 'clown', 'trumpet', 'sturgeon'];
      const collResult = coll.splice(0, 2, 'parrot', 'anemone', 'blue');
      const arrResult = arr.splice(0, 2, 'parrot', 'anemone', 'blue');
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove 2 elements from index 2', () => {
      const coll = new Collection(['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon']);
      const arr = ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'];
      const collResult = coll.splice(coll.length - 3, 2);
      const arrResult = arr.splice(arr.length - 3, 2);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove 1 element from index -2', () => {
      const coll = new Collection(['angel', 'clown', 'mandarin', 'sturgeon']);
      const arr = ['angel', 'clown', 'mandarin', 'sturgeon'];
      const collResult = coll.splice(-2, 1);
      const arrResult = arr.splice(-2, 1);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
    it('should remove all elements after index 2 (incl.)', () => {
      const coll = new Collection(['angel', 'clown', 'mandarin', 'sturgeon']);
      const arr = ['angel', 'clown', 'mandarin', 'sturgeon'];
      const collResult = coll.splice(2);
      const arrResult = arr.splice(2);
      expect(coll).to.deep.equal(arr);
      expect(collResult).to.deep.equal(arrResult);
    });
  });

  describe('#entries()', () => {
    it('should return an iterator', () => {
      const coll = new Collection([1, 2]);
      const entries = coll.entries();
      expect(entries.next()).to.deep.equal({ value: [0, 1], done: false });
      expect(entries.next()).to.deep.equal({ value: [1, 2], done: false });
    });
  });

  describe('#keys()', () => {
    it('should return an iterator', () => {
      const coll = new Collection([1, 2]);
      const keys = coll.keys();
      expect(keys.next()).to.deep.equal({ value: 0, done: false });
      expect(keys.next()).to.deep.equal({ value: 1, done: false });
    });
  });

  describe('#copyWithin()', () => {
    it('should copy elements', () => {
      const coll = new Collection([1, 2, 3, 4, 5]);
      coll.copyWithin(0, 3, 4);
      expect(coll.toArray()).to.deep.equal([4, 2, 3, 4, 5]);
      coll.copyWithin(1, 3);
      expect(coll.toArray()).to.deep.equal([4, 4, 5, 4, 5]);
    });
  });

  describe('#findIndex()', () => {
    it('should find and return index', () => {
      const coll = new Collection([1, 2, 3, 3, 4]);
      expect(coll.findIndex(value => value === 3)).to.equal(2);
    });
    it('should return -1', () => {
      const coll = new Collection([1, 2, 3]);
      expect(coll.findIndex(value => value === 4)).to.equal(-1);
    });
  });

  describe('#sort()', () => {
    it('should sort objects', () => {
      const coll = new Collection([5, 4, 3, 2, 1]);
      coll.sort();
      expect(coll.toArray()).to.deep.equal([1, 2, 3, 4, 5]);
    });
    it('should sort objects with a callback', () => {
      const coll = new Collection([5, 3, 2, 4, 1]);
      coll.sort((a, b) => a - b);
      expect(coll.toArray()).to.deep.equal([1, 2, 3, 4, 5]);
    });
  });

  describe('#fill()', () => {
    it('should fill with value', () => {
      const coll = new Collection([1, 2, 3, 4, 5, 6]);
      coll.fill(0, 3, 5);
      expect(coll.toArray()).to.deep.equal([1, 2, 3, 0, 0, 6]);
    });
  });

  describe('Callback binding', () => {
    it('should use default binding', () => {
      const coll = new Collection([1]);
      coll.forEach(function(this: undefined) { expect(this).to.equal(undefined); });
    });
    it('should use thisArg', () => {
      const coll = new Collection([1]);
      coll.forEach(function(this: Collection<any>) { expect(this).to.equal(coll); }, coll);
    });
    it('should use callback binding', () => {
      const coll = new Collection([1]);
      coll.forEach(function(this: Collection<any>) { expect(this).to.equal(coll); }.bind(coll));
    });
  });

  describe('Length update', () => {
    it('should maintain a proper length', () => {
      const coll = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(coll.length).to.equal(9);
      coll.unshift(0);
      expect(coll.length).to.equal(10);
      expect(coll.slice(5).length).to.equal(5);
      coll.shift();
      expect(coll.length).to.equal(9);
      coll.push(0);
      expect(coll.length).to.equal(10);
      coll.compact();
      expect(coll.length).to.equal(9);
      coll[9] = 10;
      expect(coll.length).to.equal(10);
      coll.setAt(10, 11);
      expect(coll.length).to.equal(11);
    });
  });

  describe('Array.from()', () => {
    it('should return an array', () => {
      const coll = new Collection([1, 2, 3]);
      const arr = Array.from(coll);
      expect(arr).to.deep.equal([1, 2, 3]);
      expect(arr).to.not.be.instanceOf(Collection);
    });
  });

  describe('JSON.stringify()', () => {
    it('should stringify as a valid array', () => {
      const str = JSON.stringify(new Collection([1, 2, 3]));
      expect(str).to.equal('[1,2,3]');
      expect(JSON.parse(str)).to.deep.equal([1, 2, 3]);
    });
  });

  describe('Inheritance', () => {
    type T = { str: string };
    class MyCollection extends Collection<T> {
      private foo: boolean;

      public constructor(objects: T[], options: { foo: boolean }) {
        super(objects);
        this.foo = options.foo;
      }
    }

    it('should filter', () => {
      const coll = new MyCollection([{ str: 'abc' }], { foo: true });
      coll.filterByProperties({ str: 'cba' });
    });

    it('should map', () => {
      const coll = new MyCollection([{ str: 'abc' }], { foo: true });
      coll.map(item => item);
    });

    it('should set objects', () => {
      const coll = new MyCollection([], { foo: true });
      coll.setObjects([{ str: 'abc' }]);
    });

    it('should support destructuring', () => {
      const coll = new MyCollection([{ str: 'abc' }], { foo: true });
      const [ first ] = coll;
      expect(first).to.deep.equal({ str: 'abc' });
    });
  });

  describe('Destructuring', () => {
    it('should support destructuring', () => {
      const coll = new Collection([1, 2, 3]);
      const [ first ] = coll;
      expect(first).to.equal(1);
      const [ , second, , unexistant ] = coll;
      expect(second).to.equal(2);
      expect(unexistant).to.equal(undefined);
    });
  });
});