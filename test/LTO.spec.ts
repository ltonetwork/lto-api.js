import { expect } from 'chai';
import { LTO, EventChain } from '../src/LTO';
import * as sinon from 'sinon';

let lto;

describe('LTO', () => {

  beforeEach(() => {
    lto = new LTO('L');
  });

  describe('#createAccount', () => {
    it('should create an account with a random seed', () => {
      const account = lto.createAccount();

      expect(account.sign.privateKey).to.have.length(64);
      expect(account.sign.publicKey).to.have.length(32);
    });
  });

  describe('#accountFromExistingPhrase', () => {
    it('should create an account with from an existing seed', () => {
      const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';
      const account = lto.createAccountFromExistingPhrase(phrase);

      // AxlSign
      expect(account.getPrivateEncryptKey()).to.eq('3jYAfg5LFqcBP3FDBDkCkGAmhSdDUFjJXesoMzXzBHNn');
      expect(account.getPublicEncryptKey()).to.eq( 'FbbHWS97LAen2mTwDk5J2bqg2Pp68tPukL9iDqGD59oa');

      expect(account.getPrivateSignKey()).to.eq('4zsR9xoFpxfnNwLcY4hdRUarwf5xWtLj6FpKGDFBgscPxecPj2qgRNx4kJsFCpe9YDxBRNoeBWTh2SDAdwTySomS');
      expect(account.getPublicSignKey()).to.eq('GjSacB6a5DFNEHjDSmn724QsrRStKYzkahPH67wyrhAY');
      expect(account.address).to.eq('3JmCa4jLVv7Yn2XkCnBUGsa7WNFVEMxAfWe');
    });

    it('should create an account with from an existing seed for testnet', () => {
      const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';
      const lto = new LTO('T');
      const account = lto.createAccountFromExistingPhrase(phrase);

      // AxlSign
      expect(account.getPrivateEncryptKey()).to.eq('3jYAfg5LFqcBP3FDBDkCkGAmhSdDUFjJXesoMzXzBHNn');
      expect(account.getPublicEncryptKey()).to.eq( 'FbbHWS97LAen2mTwDk5J2bqg2Pp68tPukL9iDqGD59oa');

      expect(account.getPrivateSignKey()).to.eq('4zsR9xoFpxfnNwLcY4hdRUarwf5xWtLj6FpKGDFBgscPxecPj2qgRNx4kJsFCpe9YDxBRNoeBWTh2SDAdwTySomS');
      expect(account.getPublicSignKey()).to.eq('GjSacB6a5DFNEHjDSmn724QsrRStKYzkahPH67wyrhAY');
      expect(account.address).to.eq('3MyuPwbiobZFnZzrtyY8pkaHoQHYmyQxxY1');
    });
  });

  describe('#accountFromPrivateKey', () => {
    it('should create an account with from an existing seed', () => {
      const privateKey = 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp';
      const account = lto.createAccountFromPrivateKey(privateKey);

      expect(account.getPublicEncryptKey()).to.eq('Cuotpoq3gtBrqwVdrgeek7zTTVargATph5pAqPBLdo7A');
      expect(account.getPrivateEncryptKey()).to.eq('98oeCpf79LJV6UgymYZL17gRw27UYF213mC4ifbBauTk');
      expect(account.getPrivateSignKey()).to.eq('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp');
      expect(account.getPublicSignKey()).to.eq('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
    });
  });

  describe('#encryptSeedPhrase / #decryptSeedPhrase', () => {
    it('should encrypt and decrypt phrase', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const password = 'secretpassword';

      const encryptedPhrase = lto.encryptSeedPhrase(phrase, password);

      const decryptedPhrase = lto.decryptSeedPhrase(encryptedPhrase, password);
      expect(decryptedPhrase).to.eq(phrase);
    });
  });

  describe("#createEventChainId", () => {
    it('should generate a correct event chain id without a nonce', () => {
      const stub = sinon.stub(EventChain.prototype, 'getRandomNonce').returns(new Uint8Array(20).fill(0));

      const id = lto.createEventChainId('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ');

      stub.restore();

      expect(id).to.eq('2ar3wSjTm1fA33qgckZ5Kxn1x89gKcDPBXTxw56YukdUvrcXXcQh8gKCs8teBh');
      sinon.assert.calledOnce(stub);
    });

    it('should generate a correct event chain id with a nonce given', () => {
      const getRandomNonce = sinon.spy(EventChain.prototype, 'getRandomNonce');

      const id = lto.createEventChainId('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ', 'foo');

      getRandomNonce.restore();

      expect(id).to.eq('2b6QYLttL2R3CLGL4fUB9vaXXX4c5aFFsoeAmzHWEhqp3bTS49bpomCMTmbV9E');
      sinon.assert.notCalled(getRandomNonce);
    });
  })
});