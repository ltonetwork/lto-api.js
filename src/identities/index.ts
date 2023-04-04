export { default as IdentityBuilder } from './IdentityBuilder';
export { default as Credential } from './Credential';
export { default as Proof } from './Proof';
export { default as VerifiableCredential } from './VerifiableCredential';

export enum VerificationRelationship {
  none = 0x100,
  authentication = 0x101,
  assertion = 0x102,
  keyAgreement = 0x104,
  capabilityInvocation = 0x108,
  capabilityDelegation = 0x110,
}
