# Collection

Async ready array like class. Offers most array methods, plus a bunch of async iterations and some common Lodash methods out of the box.

## Requirements

- `node >= 7.10`
- `typescript >= 2.4`

## Installation

`npm i @bluejay/collection [--save]`

## Usage

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
await collection.mapSeries(async el => el.foo * 2); // [2, 4, 6]
await collection.mapParallel(async el => el.foo * 2); // [2, 4, 6]

// Lodash methods
collection.findByProperties({ foo: 1 }); // { foo: 1 }
collection.mapByProperty('foo'); // [1, 2, 3]

// Iterate
for (const object of collection) {
  // Do something
}
```

## Documentation

See [Github Pages](https://bluebirds-blue-jay.github.io/collection/).