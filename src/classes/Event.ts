export class Event {

  /**
   * Base58 encoded JSON string with the body of the event.
   *
   */
  public body: string;

  /**
   * Time when the event was signed.
   *
   */
  public timestamp: string;

  /**
   * Hash to the previous event
   *
   */
  public previous: string;

  /**
   * URI of the public key used to sign the event
   *
   */
  public signkey: string;

  /**
   * Base58 encoded signature of the event
   *
   */
  public signature: string;

  /**
   * Base58 encoded SHA256 hash of the event
   *
   */
  public hash: string;

}