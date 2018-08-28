function paddedMessage(message) {
  return `\n${message}\n`;
}

function resolveData(data) {
  if (data instanceof Error) {
    return paddedMessage(data.toString());
  } else if (data) {
    try {
      return paddedMessage(JSON.stringify(data, null, 2));
    } catch (e) {
      return paddedMessage('Not possible to retrieve error data');
    }
  } else {
    return paddedMessage('No additional data provided');
  }
}


export default class LTOError extends Error {

  public name;
  public data;

  constructor(message, data) {

    super(`${message}:\n${resolveData(data)}`);

    this.name = 'LTOError';
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LTOError);
    }
  }
}