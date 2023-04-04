export function addPrefix(x: string, y: string): string {
  const significant_bit = y.slice(y.length - 1);
  const int = parseInt(significant_bit, 16);

  return int % 2 == 0 ? '02' + x : '03' + x;
}

/** returns a hexadecimal compressed publicKey from a hexadecimal uncompressed one */
export function getCompressPublicKey(pubKey: string): string {
  if (pubKey[1] == 'x') pubKey = pubKey.substring(4);
  else pubKey = pubKey.substring(2);
  const middle = pubKey.length / 2;
  return this.add_prefix(pubKey.substr(0, middle), pubKey.substr(middle + 1));
}
