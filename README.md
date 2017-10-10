# Collection

Async ready array like class. Provides additional methods on top of native arrays in order to ease asynchronous work.

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
collection[1]; // { foo: 2 }

collection.setAt(1, 5);
collection[1] = 2;

// Regular array methods 
collection.forEach(el => console.log(el.foo)); // 1, 2, 3
collection.map(el => console.log(el.foo)); // 1, 2, 3

// Async array methods
await collection.mapSeries(async el => el.foo * 2); // [2, 4, 6]
await collection.mapParallel(async el => el.foo * 2); // [2, 4, 6]

// Lodash methods
collection.findByProperties({ foo: 1 }); // { foo: 1 }
collection.pluck('foo'); // [1, 2, 3]
```

## Documentation

See [Github Pages](https://bluebirds-blue-jay.github.io/collection/).