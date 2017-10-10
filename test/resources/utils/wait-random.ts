import { wait } from '@bluejay/utils';
import * as Lodash from 'lodash';

export async function waitRandom(minimum: number = 0, maximum: number = 1000) {
  const random = Lodash.random(minimum, maximum);
  await wait(random);
}