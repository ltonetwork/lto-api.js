function paddedMessage(message) {
	return `\n${message}\n`;
}

function resolveData(data) {
	if (data instanceof Error)
		return paddedMessage(data.toString());

    if (data) {
        try {
            return paddedMessage(JSON.stringify(data, null, 2));
        } catch (e) {
            return paddedMessage("Not possible to retrieve error data");
        }
    }
}

export default class LTOError extends Error {
    public readonly data;

    constructor(message: string, data: any = null) {
        super(`${message}:\n${resolveData(data)}`);
        this.data = data;
    }
}
