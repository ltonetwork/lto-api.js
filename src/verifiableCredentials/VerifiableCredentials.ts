
export default class VerifiableCredentials {

	schema: string;
	personalIdentifier: string;
	familyName: string;
	firstName: string;
	dateOfBirth: string;

	constructor(schema: string) {
		this.schema = schema;
	}

	populate(dataFromOfido){
		this.firstName = dataFromOfido.data.properties.first_name;
		this.familyName = dataFromOfido.data.properties.last_name;
		this.dateOfBirth = dataFromOfido.data.properties.date_of_birth;
		this.personalIdentifier = this.getIdentifier(dataFromOfido.data.properties.issuing_country);
	}

	getIdentifier(info){
		//TODO
		return "IT/ES/34EYR2";
	}

	issue() {

	}

	registerTo() {

	}

}