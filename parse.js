module.exports = (spec, words) => {
	const res = spec.match(words);
	if (res === false) {
		throw new Error('Failed to parse expression');
	}
	if (res.taken < words.length) {
		throw new Error('Unexpected trailing tokens: ' + words.slice(res.taken).join(' '));
	}
	return new Map(res.capture);
};
