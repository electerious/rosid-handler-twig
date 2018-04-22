'use strict'

const locate = require('./locate')
const twig = require('./twig')
const data = require('./data')

/**
 * Load Twig and transform to HTML.
 * @public
 * @param {String} filePath - Path to file.
 * @param {?Object} opts - Options.
 * @returns {Promise<String>} HTML.
 */
module.exports = async function(filePath, opts) {

	if (typeof filePath !== 'string') throw new Error(`'filePath' must be a string`)
	if (typeof opts !== 'object' && opts != null) throw new Error(`'opts' must be undefined, null or an object`)

	const dataPath = await locate(filePath)
	const json = await data(dataPath, opts)

	return twig(filePath, json, opts)

}

/**
 * Tell Rosid with which file extension it should load the file.
 * @public
 * @param {?Object} opts - Options.
 * @returns {String} File extension.
 */
module.exports.in = function(opts) {

	return (opts != null && opts.in != null) ? opts.in : '.twig'

}

/**
 * Tell Rosid with which file extension it should save the file.
 * @public
 * @param {?Object} opts - Options.
 * @returns {String} File extension.
 */
module.exports.out = function(opts) {

	return (opts != null && opts.out != null) ? opts.out : '.html'

}

/**
 * Attach an array to the function, which contains a list of
 * file patterns used by the handler. The array will be used by Rosid for caching purposes.
 * @public
 */
module.exports.cache = [
	'**/*.twig',
	'**/*.js',
	'**/*.json'
]