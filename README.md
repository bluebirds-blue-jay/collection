# Collection

Async ready, chainable, highly convenient array compatible class. Supports all array methods, plus a bunch of async iterations and some common Lodash methods out of the box.

## Requirements

- `node >= 7.10`
- `typescript >= 2.4`

## Installation

`npm i @bluejay/collection [--save]`

## Usage

### Array compatibility VS inheritance

Collections are fully compatible with the [ES6 array specification](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). However, a `Collection` **does not** inherit from / **is not** an `Array`. Instead, it **implements** the `Array` interface. Internally through, it keeps track of an actual array and *forwards* method calls to it.

In practice:

```typescript
const collection = new Collection([1, 2, 3]);

Array.isArray(collection); // false

function foo(bar: number[]) {
  // Do stuff
}

foo([1, 2, 3]); // Compiles
foo(collection); // Compiles too!
```


If you wish to check if an object is a collection, use `Collection.isCollection()`:

```typescript
const collection = new Collection([1, 2, 3]);

Collection.isCollection(collection); // true
```

If you wish to check if an object is either a `Collection` or an `Array`, use `Collection.isArrayCompatible()`:

```typescript
const values = [1, 2, 3]; 
const collection = new Collection(values);

Collection.isArrayCompatible(values); // true
Collection.isArrayCompatible(collection); // true

function foo(bar: any) {
  if (Collection.isArrayCompatible(bar)) {
    // bar can be an array or a collection here
    bar.forEach(...); // This will compile
  }
}
```

Additionally, you can still use `Array.from()` since a `Collection` is *iterable*:

```typescript
const collection = new Collection([1, 2, 3]);

Array.from(collection); // [1, 2, 3]
```

### Available methods

- All array methods are supported
- Some `Lodash` methods such as `omit()` or `pick()` are built-in as instance methods
- A few async methods allow you to perform async operations directly from the collection itself

```typescript
import { Collection } from '@bluejay/collection';

const collection = new Collection([{ foo: 1 }, { foo: 2 }, { foo: 3 }]); // Initialize with an array

collection.size(); // 3
collection.getAt(1); // { foo: 2 }
collection.setAt(1, 5);

// Array style elements access
collection[1] = { foo: 18 };
collection[1]; // { foo: 18 }

// Regular array methods 
collection.forEach(el => console.log(el.foo)); // 1, 2, 3
collection.map(el => console.log(el.foo)); // 1, 2, 3

// Async array methods
await collection.mapSeries(async el => el.foo * 2); // Collection<[2, 4, 6]>
await collection.mapParallel(async el => el.foo * 2); // Collection<[2, 4, 6]>

// Lodash methods
collection.findByProperties({ foo: 1 }); // { foo: 1 }
collection.mapByProperty('foo'); // Collection<[1, 2, 3]>

// Iterate
for (const object of collection) {
  // Do something
}
```

### Collections and inheritance

To create a Collection subclass, just do what you do best:

```typescript
class MyCollection<T> extends Collection<T> {
  private persistent: 
  
  public constructor(objects: T[], options: { persistent: boolean }) {
    super(objects);
    this.persistent = options.persistent;
  }
  
  public isPersistent() {
    return this.persistent;
  }
}

const instance = new MyCollection([1, 2, 3], { persistent: true });

instance.size(); // 3
instance.isPersistent(); // true
```

You will, however, soon notice that methods that return a collection return an instance of `Collection`, not `Mycollection`.

```typescript
const filtered = instance.filter(value => value >= 2);
filtered.toArray(); // [2, 3]
filtered.isPersistent(); // Compilation error! `isPersistent()` does not exist on type `Collection`
```

This is because this Bluejay has no way to know which arguments your implementation requires. In order to solve this issue, we need to override the `factory()` method which Bluejay calls each time it needs to create a new Collection. 

```typescript
class MyCollection<T> extends Collection<T> {
  private persistent: 
  
  public constructor(objects: T[], options: { persistent: boolean }) {
    super(objects);
    this.persistent = options.persistent;
  }
  
  protected factory<Y>(objects: Y[]) { // We don't know which type exactly we're getting here since `map()` and other methods might create collections of a different type than T
    return new MyCollection<Y>(objects, { persistent: this.persistent });
  }
  
  public isPersistent() {
    return this.persistent;
  }
}

const instance = new MyCollection([1, 2, 3], { persistent: true });

instance.isPersistent(); // true

const filtered = instance.filter(value => value >= 2);

filtered.isPersistent(); // true - Not compilation error anymore

instance.forEach((value, index, currentObj: MyCollection<number>) => { // Note that we need to explicitly set the type here as TS doesn't manage to infer it from the implementation
  currentObj.isPersistent(); // true
});
```


**Note:** While we made sure to provide a way for you to override the instances created by Bluejay, most implementations will not need such a complex setup. It is absolutely NOT necessary to override this method if you don't explicitly need to.  

## API Documentation

See [Github Pages](https://bluebirds-blue-jay.github.io/collection/).