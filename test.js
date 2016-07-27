const sq = require('shell-quote');

const spec = require('./spec');
const parse = require('./parse');


const test = (idx, fails, syntax, expr) => {
	let res = '';
	let err = null;
	let tree = spec(syntax);
	let args = sq.parse(expr);
	try {
		res = parse(tree, args);
	} catch (e) {
		err = e;
	}
	if (fails ^ !!err) {
		console.error(`\x1b[1;31mTest ${idx} failed:\x1b[0m `, err.message);
		console.info(`Expression : ${expr}`);
		console.info(`Syntax     : ${syntax}`);
		console.info(`Arguments  : ${sq.quote(args)}`);
		console.info(`Help       : ${tree.toHelp()}`);
	} else {
//		console.error(`Test ${idx} passed: `, fails ? 'Fails as expeted' : res);
	}
};

const tests = [

	{ syntax: 'word', expr: 'word' },
	{ syntax: 'word', expr: '', fails: true },
	{ syntax: 'word', expr: 'two words', fails: true },

	{ syntax: '{capture}', expr: 'word' },
	{ syntax: '{capture}', expr: '', fails: true },
	{ syntax: '{capture}', expr: 'two words', fails: true },
	{ syntax: '{capture}', expr: '"two words"' },

	{ syntax: '[option]', expr: 'option' },
	{ syntax: '[option]', expr: '' },
	{ syntax: '[option]', expr: 'other', fails: true },

	{ syntax: '[{option}]', expr: 'word' },
	{ syntax: '[{option}]', expr: '' },
	{ syntax: '[{option}]', expr: '"two words"' },
	{ syntax: '[{option}]', expr: 'two words', fails: true },

	{ syntax: '(a choice|some options)', expr: 'a choice' },
	{ syntax: '(a choice|some options)', expr: 'some options' },
	{ syntax: '(a choice|some options)', expr: '', fails: true },
	{ syntax: '(a choice|some options)', expr: 'selection', fails: true },

	{ syntax: '[a choice|some options]', expr: 'a choice' },
	{ syntax: '[a choice|some options]', expr: 'some options' },
	{ syntax: '[a choice|some options]', expr: '' },
	{ syntax: '[a choice|some options]', expr: 'selection', fails: true },

	{ syntax: 'match some words', expr: 'match some words' },
	{ syntax: 'match some words', expr: 'match some fails', fails: true },

	{ syntax: 'match some [optional] words', expr: 'match some words' },
	{ syntax: 'match some [optional] words', expr: 'match some optional words' },
	{ syntax: 'match some [optional] words', expr: 'match some fails', fails: true },
	{ syntax: 'match some [optional] words', expr: 'match some optional fails', fails: true },
	{ syntax: 'match some [optional] words', expr: 'match some optional', fails: true },

	{ syntax: 'capture {word} words', expr: 'capture some words' },
	{ syntax: 'capture {word} words', expr: 'capture some fails', fails: true },

	{ syntax: 'provide (several|a choice of) words', expr: 'provide several words' },
	{ syntax: 'provide (several|a choice of) words', expr: 'provide a choice of words' },
	{ syntax: 'provide (several|a choice of) words', expr: 'provide various words', fails: true },

	{ syntax: 'nested [{first word} [within {second word}]]', expr: 'nested capture' },
	{ syntax: 'nested [{first word} [within {second word}]]', expr: 'nested capture within option' },

	{ syntax: 'nested ({first word} [within {second word}]|test {message})', expr: 'nested capture' },
	{ syntax: 'nested ({first word} [within {second word}]|test {message})', expr: 'nested capture within option' },
	{ syntax: 'nested ({first word} [within {second word}]|{message})', expr: 'nested choices' },
	{ syntax: 'nested ({first word} [within {second word}]|test choices)', expr: 'nested test choices' },
	{ syntax: 'nested ({first word} [within {second word}]|test {message})', expr: 'nested test choices' },

	/* TODO fix */
	{ syntax: 'nested (test choices|{first word} [within {second word}])', expr: 'nested capture' },
	{ syntax: 'nested (test {message}|{first word} [within {second word}])', expr: 'nested capture within option' },
	{ syntax: 'nested (test choices|{first word} [within {second word}])', expr: 'nested test choices' },
	{ syntax: 'nested (test {message}|{first word} [within {second word}])', expr: 'nested test choices' },

];

tests.forEach(({ fails = false, syntax, expr }, idx) => test(idx, fails, syntax, expr));