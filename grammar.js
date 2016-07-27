module.exports = {
	Group, Word, Capture
};

const $ = c => `\x1b[35m${c}\x1b[0m`;

function Phrase(tokens) {
	tokens = tokens.slice();

	this.match = expr => tokens.reduce(
		(res, token) => {
			const test = res && token.match(expr.slice(res.taken));
			return test && {
				taken: res.taken + test.taken,
				capture: [
					...res.capture,
					...(test.capture ? test.capture : [])
				]
			};
		}, { taken: 0, capture: [] });

	this.toHelp = () => tokens.map(t => t.toHelp()).join(' ');
}

function Group(optional, closeChar) {
	const sub = [];
	const choices = [];

	const isRoot = closeChar === '$ROOT';

	this.closeChar = closeChar;

	this.append = x => sub.push(x);
	this.close = () => {
		this.closeChoice();
		if (optional) {
			this.closeChoice();
		}
		delete this.closeChar;
		delete this.append;
		delete this.close;
		delete this.closeChoice;
		if (sub.length) {
			throw new Error('Subexpression not closed');
		}
		return this;
	};

	this.optional = optional;
	this.choice = false;

	this.closeChoice = () => {
		choices.push(new Phrase(sub));
		sub.length = 0;
		this.choice = choices.length > (this.optional ? 2 : 1);
	};

	this.match = expr => choices.reduce(
		(res, choice) => res || choice.match(expr),
		false);

	this.toHelp = () => this.optional ?
		this.choice ?
			$('[ ') + choices.slice(0, choices.length - 1).map(c => c.toHelp()).join($(' | ')) + $(' ]') :
			$('[') + choices.slice(0, choices.length - 1).map(c => c.toHelp()).join($('|')) + $(']') :
		this.choice ?
			(isRoot ? '' : $('{ ')) + choices.map(c => c.toHelp()).join($(' | ')) + (isRoot ? '' : $(' }')) :
			(isRoot ? '' : $('{')) + choices.map(c => c.toHelp()).join($('|')) + (isRoot ? '' : $('}'));
}

function Word() {
	let word = '';

	this.append = c => word = word + c;

	this.match = expr => expr.length === 0 ||
		word.toLowerCase() !== expr[0].toLowerCase() ? false :
			{ taken: 1 };

	this.close = () => {
		delete this.append;
		delete this.close;
	};

	this.toString = () => word;

	this.toHelp = () => `\x1b[37m${word}\x1b[0m`;
}

function Capture(closeChar) {
	const sub = [];
	let name = null;

	this.closeChar = closeChar;

	this.append = x => {
		if (!(x instanceof Word)) {
			throw new Error('Invalid name for capture group');
		}
		sub.push(x);
	};
	this.close = (delim = '_') => {
		name = sub.join(delim);
		delete this.closeChar;
		delete this.append;
		delete this.close;
	};

	this.match = expr => expr.length === 0 ? false :
		{ taken: 1, capture: [[name, expr[0]]] };

	this.toHelp = () => `\x1b[36;4m${sub.join(' ')}\x1b[0m`;
}
