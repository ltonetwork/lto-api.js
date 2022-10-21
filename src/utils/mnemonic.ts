import dictionary from "../seedDictionary";
import {generateRandomUint32Array} from "./byte-array";

export function generateNewSeed(words = 15): string {
	const random = generateRandomUint32Array(words);
	const wordCount = dictionary.length;
	const phrase = [];

	for (let i = 0; i < words; i++) {
		const wordIndex = random[i] % wordCount;
		phrase.push(dictionary[wordIndex]);
	}

	return phrase.join(" ");
}
