import LTOError from './LTOError';

const FAILED_TO_FETCH = 'Failed to fetch';

function normalizeErrorData<T extends { error?: number; message?: string }>(
  data: T,
): T | { error: number; message: string } {
  return !data.error && data.message && data.message.indexOf(FAILED_TO_FETCH) !== -1
    ? { error: -1, message: 'Failed to fetch' }
    : data;
}

export default class RequestError extends LTOError {
  constructor(url: string, data: object) {
    super(`Server request to '${url}' has failed`, normalizeErrorData(data));
  }
}
