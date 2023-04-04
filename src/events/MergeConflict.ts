import EventChain from './EventChain';
import Event from './Event';

export default class MergeConflict extends Error {
  constructor(public chain: EventChain, public left: Event, public right: Event) {
    super(
      `Merge conflict: Mismatch after ${left.previous.base58} between ${left.hash.base58} and ${right.hash.base58}`,
    );
  }
}
