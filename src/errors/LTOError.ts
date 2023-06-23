function paddedMessage(message: string): string {
  return `\n${message}\n`;
}

function resolveData(data: any): string {
  if (data instanceof Error) return paddedMessage(data.toString());

  if (data === undefined || data === null) return '';

  try {
    return paddedMessage(JSON.stringify(data, null, 2));
  } catch (e) {
    return paddedMessage('Not possible to retrieve error data');
  }
}

export default class LTOError extends Error {
  readonly data: any;

  constructor(message: string, data: any = null) {
    super(`${message}:\n${resolveData(data)}`);
    this.data = data;
  }
}
