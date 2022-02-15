import Transaction from "./transactions/Transaction";
import {fromData as txFromData} from "./transactions";
import axios from "axios";

export class PublicNode {
	public readonly url: string;
	public readonly apiKey: string;

	constructor(url: string, apiKey?: string) {
		this.url = url;
		this.apiKey = apiKey;
	}

	request(endpoint: string, postData?: string, host?, header = {}) {
		host = host ?? this.url;

		if (this.apiKey)
			header = { "X-API-Key": this.apiKey };

		if (postData) {
			return axios.post(
				host.concat(endpoint),
				postData,
				{
					baseURL: this.url,
					headers: Object.assign({}, header, { "content-type": "application/json" }),
				})
				.then(function (response) {
					return response.data;
				})
				.catch(function (error) {
					console.error(error.response);
					return false;
				});
		} else {
			const config = { headers: Object.assign({}, header, { "content-type": "application/json" }) };
			return axios.get(host.concat(endpoint), config)
				.then(function (response) {
					return response.data;
				})
				.catch(function (error) {
					console.log(error.data);
					return false;
				});
		}
	}

	async broadcast<T extends Transaction>(transaction: T): Promise<T> {
		const data = JSON.stringify(transaction.toJson());
		const response = await this.request("/transactions/broadcast", data);

		return txFromData(response) as unknown as T;
	}

	async nodeStatus(): Promise<{blockchainHeight: number, stateHeight: number, updatedTimestamp: number, updatedDate: string}> {
		return await this.request("/node/status");
	}

	async nodeVersion(): Promise<{version: string}> {
		return await this.request("/node/version");
	}

	async getBalance(address: string): Promise<{address: string, confirmations: number, balance: number}> {
		return await this.request(`/addresses/balance/${address}`);
	}
}
