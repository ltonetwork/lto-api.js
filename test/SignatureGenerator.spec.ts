import { expect } from 'chai';
import { LTO } from '../src/LTO';
import { TX_TYPE_MAP } from '../src/signatureFactory/SignatureFactory';
import {IDATA_PROPS, ILEASE_PROPS, ITRANSFER_PROPS} from '../src/signatureFactory/interface';

let phrase = 'some random test phrase used only for testing';
let phrase2 = 'another random test phrase used only for testing';
let lto = new LTO('T');
let account = lto.createAccountFromExistingPhrase(phrase);
let account2 = lto.createAccountFromExistingPhrase(phrase2);

describe('SignatureGenerator', () => {

  describe('#getSignature', () => {

    it('should generate the correct transfer signature', async () => {

      const transerData: ITRANSFER_PROPS = {
        senderPublicKey : account.getPublicVerifyKey(),
        fee : '100000',
        timestamp : 1535981574970,
        recipient : account2.address,
        amount : '10000000000',
        attachment : ''
      };

      let generator = new TX_TYPE_MAP.transfer(transerData);
      const signature = await generator.getSignature(account.getPrivateSignKey());
      expect(signature).to.eq('2DDKy64xsrkSztwLPRL9dcPdhMjpUBGAM86qC4dxXGfP9g16qsQxiEXdqLFjUUxJxmHsJCiL7sGNgjhD8Wa1NDHL');
    });

    it('should generate the correct lease signature', async () => {
      const transerData: ILEASE_PROPS = {
        senderPublicKey : account.getPublicVerifyKey(),
        fee : '100000',
        timestamp : 1535981574970,
        recipient : account2.address,
        amount : '100000000'
      };

      let generator = new TX_TYPE_MAP.lease(transerData);
      const signature = await generator.getSignature(account.getPrivateSignKey());
      expect(signature).to.eq('5Ws9zbHjS4pTVK2VqPLRp337URjnGXZLoaHgknedTJmFD28Vx775GviqguUVBWxYK17RhAyVvtS1qzfoogeyqwU');
    });

    it('should generate the correct data signature', async () => {

      const transerData: IDATA_PROPS = {
        senderPublicKey : account.getPublicVerifyKey(),
        fee : '100000',
        timestamp : 1535981574970,
        data: [
          {
            key: '\u2693',
            type: 'binary',
            value: 'base64:n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg='
          }
        ]
      };

      let generator = new TX_TYPE_MAP.data(transerData);
      const signature = await generator.getSignature(account.getPrivateSignKey());
      expect(signature).to.eq('CDaEDBRftK3iCBpRarNm93kfqzunAe2UAPbPJpq7hdQxU3qxURfzc4TvVakT8te5fFVCHFRr9fnwWLRwaqto1Qj');
    });
  });
});
