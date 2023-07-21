export interface IDIDService {
  id?: string;
  type: string;
  serviceEndpoint: string | Record<string, any> | Array<string | Record<string, any>>;
  description?: string;
  [key: string]: any;
}

export type TDIDRelationship =
  | 'authentication'
  | 'assertionMethod'
  | 'keyAgreement'
  | 'capabilityInvocation'
  | 'capabilityDelegation';
