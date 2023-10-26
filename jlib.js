// @ts-check
"use strict";

const filesystem = require("fs");
const process = require("process");

// class Arg {
// 	/** @type {string} type */
// 	type;
// 	/** @type {string} */
// 	ptr;
// 	/** @type {string} */
// 	name;
// }

class Func {
	/** @type {string} */
	returnType;
	/** @type {string} */
	name;
	/** @type {Array<string>} */
	args;
	/** @type {string} */
	body;

	/** @param {string} arg */
	argPush(arg) {
		this.args.push(arg);
	}

	/** @param {string} arg */
	argRemove(arg) {
		for (let i = 0; i < this.args.length; ++i) {
			if (arg == this.args[i]) {
				this.args.splice(i);
				break;
			}
		}
	}

	/** @returns {string} */
	argsToString() {
		/** @type {string} */
		let ret = '';
		for (let i = 0; i < this.args.length; ++i) {
			if (i != this.args.length - 1)
				ret += this.args[i] + " ,";
			else
				ret += this.args[i];
		}
		return ret;
	}

	/** @param {string} suffix */
	nameAppend(suffix) {
		this.name += suffix;
	}

	/** @param {string} prefix */
	namePrepend(prefix) {
		this.name = prefix + this.name;
	}

	/** @returns {boolean} */
	returnsValue() {
		return this.returnType.indexOf("void") == -1;
	}

	/** @returns {boolean} */
	isVoid() {
		return !this.returnsValue();
	}
}

/**
  @param {string} s
  @param {number} i start
  @returns {number}
*/
function skipNotSpace(s, i) {
	for (; i < s.length && /\s/.test(s[i]); ++i);
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @returns {number}
*/
function skipSpace(s, i) {
	for (; i < s.length && /\s/.test(s[i]); ++i);
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @param {number} j end
  @returns {number}
*/
function skipSpaceRev(s, i, j) {
	for (; j > i && /\s/.test(s[j]); --j);
	return j;
}

/**
  @param {string} s 
  @param {number} i 
  @returns {Array<string>}
*/
function convertArgsStrToArray(s, i) {
	/** @type {Array<string>} */
	let ret = new Array();
	outer: for (let j; i < s.length; i = j + 1) {
		for (j = i; ; ++j) {
			if (j == s.length) {
				const ii = skipSpace(s, i);
				const jj = skipSpaceRev(s, ii, j);
				ret.push(s.substring(ii, jj));
				break outer;
			}
			if (s[j] == ",") {
				const ii = skipSpace(s, i);
				const jj = skipSpaceRev(s, ii, j);
				ret.push(s.substring(ii, jj));
				break;
			}
		}
	}
	return ret;
}

/**
  @returns {Func|null}
  @param {string} s
*/
function getFunc(s) {
	const regexMatch =
		/((?:\w|\s|\*)+)*(\w+)\s*\(([^(){};]*)\)[^(){};]*\{(.*)\}/.exec(s);
	if (!regexMatch) return null;
	if (
		regexMatch[2] == "if" ||
		regexMatch[2] == "else if" ||
		regexMatch[2] == "for" ||
		regexMatch[2] == "while"
	)
		return null;
	/** @type {Func} */
	let func = new Func();
	func.returnType = regexMatch[1];
	func.name = regexMatch[2];
	const argsStr = regexMatch[3];
	func.args = convertArgsStrToArray(argsStr, 0);
	func.body = regexMatch[4];
	return func;
}

/** @type {string} */
const filename = process.argv[2];
/** @type {string} */
const fileStr = filesystem.readFileSync(filename).toString();
/** @type {Array<string>} */
const fileArray = fileStr.split("\n\n");
for (let i = 0; i < fileArray.length; ++i) console.log(fileArray[i]);
