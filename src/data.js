'use strict'

const path = require('path')
const continuousStealthyRequire = require('continuous-stealthy-require')

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
		if (mustRequire === true) return continuousStealthyRequire(path.resolve(opts.data))

		return opts.data

	})()

	const localData = (() => {

		const hasData = dataPath != null
		if (hasData === false) return {}

		return continuousStealthyRequire(dataPath)

	})()

	return Object.assign({}, globalData, localData, {
		environment
	})

}