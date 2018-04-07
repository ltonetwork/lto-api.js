import { expect } from 'chai';
import { Account} from '../src/classes/Account';
import base58 from "../src/libs/base58";
import * as sinon from 'sinon';

let lto;

describe('Account', () => {

  describe('#createEventChain', () => {
    it('should create an account with a random seed', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const account = new Account(phrase, 'W');

      account.createEventChain()
    });
  });
});