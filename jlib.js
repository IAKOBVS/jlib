// @ts-check
"use strict";

const fs = require("fs");
const process = require("process");

if (false) {
	class Arg {
		/**
		 * @type {string} type
		 */
		type;
		/**
		 * @type {string}
		 */
		ptr;
		/**
		 * @type {string}
		 */
		name;
	}
}

class Func {
	/**
	 * @type {string}
	 */
	attr;
	/**
	 * @type {string}
	 */
	returnType;
	/**
	 * @type {string}
	 */
	name;
	/**
	 * @type {string[]}
	 */
	args;
	/**
	 * @type {string}
	 */
	body;

	/**
	 * @param {string} arg
	 * @returns {void}
	 */
	argPush(arg)
	{
		this.args.push(arg);
	}

	/**
	 * @param {string} arg
	 * @returns {void}
	 */
	argRemove(arg)
	{
		for (let i = 0; i < this.args.length; ++i)
			if (arg == this.args[i]) {
				this.args.splice(i);
				break;
			}
	}

	/**
	 * @returns {string}
	 */
	argsToString()
	{
		/**
		 * @type {string}
		 */
		let ret = "";
		for (let i = 0; i < this.args.length; ++i)
			if (i != this.args.length - 1)
				ret += this.args[i] + " ,";
			else
				ret += this.args[i];
		return ret;
	}

	/**
	 * @param {string} suffix
	 * @returns {void}
	 */
	nameAppend(suffix)
	{
		this.name += suffix;
	}

	/**
	 * @param {string} prefix
	 * @returns {void}
	 */
	namePrepend(prefix)
	{
		this.name = prefix + this.name;
	}

	/**
	 * @returns {boolean}
	 */
	returnsValue()
	{
		return this.returnType.indexOf("void") == -1;
	}

	/**
	 * @returns {boolean}
	 */
	isVoid()
	{
		return !this.returnsValue();
	}

	/**
	 * @returns {string}
	 */
	toString()
	{
		return this.returnType + ' ' + this.name + '(' + this.argsToString() + ')' +
		       '\n{' + this.body + '}';
	}
}

/**
  @param {string} s
  @param {number} i start
  @returns {number}
*/
function skipNotSpace(s, i)
{
	for (; i < s.length && /\s/.test(s[i]); ++i)
		;
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @returns {number}
*/
function skipSpace(s, i)
{
	for (; i < s.length && /\s/.test(s[i]); ++i)
		;
	return i;
}

/**
  @param {string} s
  @param {number} i start
  @param {number} j end
  @returns {number}
*/
function skipSpaceRev(s, i, j)
{
	for (; j > i && /\s/.test(s[j]); --j)
		;
	return j;
}

/**
  @param {string} s
  @returns {string[]}
*/
function convertArgsStrToArray(s)
{
	return s.split(',');
}

/**
  @param {string} s
  @returns {Func|null}
*/
function getFunc(s)
{
	const regexMatch = /^((?:.|\n)*?(?:^|\W))(\w+\s*[* \t\n]*)\s+(\w+)\s*\(((?:.|\n)*?)\)(?:.|\n)*?\{((?:.|\n)*)\}/m.exec(s);
	if (!regexMatch)
		return null;
	/**
	 * @type {Func}
	 */
	let func = new Func();
	func.attr = regexMatch[1];
	func.returnType = regexMatch[2];
	func.name = regexMatch[3];
	func.args = convertArgsStrToArray(regexMatch[4]);
	func.body = regexMatch[5];
	if (func.name == "if"
	    || func.name == "else if"
	    || func.name == "for"
	    || func.name == "while")
		return null;
	return func;
}

/**
  @param {string[]} fileArray
  @param {string} prefix
  @returns {string[]}
*/
function namespaceMacro(fileArray, prefix)
{
	/**
	 * @type {RegExpMatchArray|null}
	 */
	let regexMatch;
	for (let i = 0; i < fileArray.length; ++i) {
		regexMatch = /^\s*#\s*undef\s+(\w+)/.exec(fileArray[i]);
		if (!regexMatch
		    || regexMatch[1].startsWith("JSTR")
		    || regexMatch[1].startsWith("PJSTR")
		    || regexMatch[1].startsWith("jstr")
		    || regexMatch[1].startsWith("pjstr"))
			continue;
		for (let j = i; j >= 0; --j)
			fileArray[j] = fileArray[j].replace(new RegExp("(\\W|^)" + regexMatch[1] + "(\\W|$)", 'g'), "$1" + prefix + regexMatch[1] + "$2");
	}
	return fileArray;
}

const namespace = "PJSTR_";
const filename = process.argv[2];
const fileStr = fs.readFileSync(filename).toString();
let fileArray = fileStr.split("\n\n");
fileArray = namespaceMacro(fileArray, namespace);
for (let i = 0; i < fileArray.length; ++i) {
	const func = getFunc(fileArray[i]);
	if (!func)
		continue;
	func.namePrepend("_");
	console.log(func.toString());
}
