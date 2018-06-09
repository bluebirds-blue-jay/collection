import { wait } from '@bluejay/utils';
import * as Lodash from 'lodash';

export async function waitRandom(minimum = 0, maximum = 1000) {
  const random = Lodash.random(minimum, maximum);
  await wait(random);
}
