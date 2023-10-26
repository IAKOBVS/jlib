// @ts-check
"use strict";

const fs = require("fs");
const proc = require("process");

class Arg {
	/** @type {string} type */
	type;
	/** @type {string} */
	ptr;
	/** @type {string} */
	name;
}

class Func {
	/** @type {string} */
	returnType;
	/** @type {string} */
	name;
	/** @type {Array<Arg>} */
	args;
	/** @type {string} */
	body;
}

/**
  @param {string} s
  @param {number} i start
  @return {number}
*/
function skipNotSpace(s, i) {
	for (; i < s.length && /\s/.test(s[i]); ++i);
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @return {number}
*/
function skipSpace(s, i) {
	for (; i < s.length && /\s/.test(s[i]); ++i);
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @param {number} j end
  @return {number}
*/
function skipSpaceRev(s, i, j) {
	for (; j > i && /\s/.test(s[j]); --j);
	return j;
}

/**
  @param {string} s 
  @param {number} i 
  @return {Array<string>|null}
*/
function fillArgs(s, i) {
	/** @type {Array<string>} */
	let ret = new Array();
	for (let j; i < s.length; i = j + 1) {
		for (j = i; ; ++j) {
			if (j == s.length) {
				const ii = skipSpace(s, i);
				const jj = skipSpaceRev(s, ii, j);
				ret.push(s.substring(ii, jj));
				return ret;
			}
			if (s[j] == ",") {
				const ii = skipSpace(s, i);
				const jj = skipSpaceRev(s, ii, j);
				ret.push(s.substring(ii, jj));
				break;
			}
		}
	}
	return null;
}

/**
  @return {Func|null}
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
	const args = regexMatch[3];
	func.body = regexMatch[4];
	console.log(func.returnType);
	console.log(func.name);
	console.log(args);
	console.log(func.body);
	return func;
}

/** @type {string} */
const filename = proc.argv[2];
/** @type {string} */
const fileString = fs.readFileSync(filename).toString();
/** @type {Array<string>} */
const fileArray = fileString.split("\n\n");
for (let i = 0; i < fileArray.length; ++i)
	console.log(fileArray[i]);
