'use strict'

const path = require('path')
const stealthyRequire = require('stealthy-require')

/**
 * Requires a fresh, uncached module.
 * Applies an additional workaround to avoid a memory leak when running stealthyRequire multiple times.
 * This workaround is recommended by stealthyRequire.
 * @param {String} filePath - File to require.
 * @returns {*} Required module.
 */
const requireUncached = function(filePath) {

	// Create a shallow copy of the array
	const initialChildren = module.children.slice()

	// Force a fresh require by removing module from cache,
	// including all of its child modules.
	const requiredModule = stealthyRequire(require.cache, () => require(filePath))

	// Reset children to avoid a memory leak when repeatedly requiring fresh modules
	module.children = initialChildren

	return requiredModule

}

/**
 * Loads and parses data.
 * @public
 * @param {String} dataPath - Path to the data JSON.
 * @param {?Object} opts - Options.
 * @returns {Promise<Object>} Data.
 */
module.exports = async function(dataPath, opts) {

	const environment = (opts != null && opts.optimize === true) ? 'prod' : 'dev'

	const globalData = (() => {

		const hasData = opts != null && opts.data != null
		if (hasData === false) return {}

		const mustRequire = typeof opts.data === 'string'
		if (mustRequire === true) return requireUncached(path.resolve(opts.data))

		return opts.data

	})()

	const localData = (() => {

		const hasData = dataPath != null
		if (hasData === false) return {}

		return requireUncached(dataPath)

	})()

	return Object.assign({}, globalData, localData, {
		environment
	})

}