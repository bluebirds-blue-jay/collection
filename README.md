# Collection

Async ready, chainable, highly convenient array compatible class. Supports all array methods, plus a bunch of async iterations and some common Lodash methods out of the box.

## Requirements

- `node >= 7.10`
- `typescript >= 2.4`

## Installation

`npm i @bluejay/collection [--save]`

## Usage

### Array compatibility VS inheritance

Collections are fully compatible with the [ES6 array specification](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). However, a `Collection` **does not** inherit from `Array`. Instead, it keeps track of an internal array and *forwards* method calls to it.

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


If you wish to check if an object is a collection, use:

```typescript
const collection = new Collection([1, 2, 3]);

Collection.isCollection(collection); // true
```

If, for example, you have a loosely typed argument and wish to know if a value supports array methods, use:

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

Additionally, you can still use `Array.from()` since a collection is *iterable*:

```typescript
const collection = new Collection([1, 2, 3]);

Array.from(collection); // [1, 2, 3]
```

### Basic usage

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

## API Documentation

See [Github Pages](https://bluebirds-blue-jay.github.io/collection/).