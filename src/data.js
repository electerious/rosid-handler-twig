'use strict'

const path = require('path')
const requireData = require('require-data')
const continuousStealthyRequire = require('continuous-stealthy-require')

/**
 * Loads and parses data.
 * @public
 * @param {String} dataPath - Path to the data JSON.
 * @param {Object} opts - Options.
 * @returns {Promise<Object>} Data.
 */
module.exports = async function(dataPath, opts) {

	const defaultData = {
		environment: opts.optimize === true ? 'prod' : 'dev'
	}

	const globalData = (async () => {

		const hasData = opts.data != null
		if (hasData === false) return {}

		const mustRequire = typeof opts.data === 'string'
		if (mustRequire === true) return requireData(path.resolve(opts.data), continuousStealthyRequire)

		return opts.data

	})()

	const localData = (async () => {

		const mustUseData = opts.localOverwrites !== false
		if (mustUseData === false) return {}

		const hasData = dataPath != null
		if (hasData === false) return {}

		return requireData(dataPath, continuousStealthyRequire)

	})()

	return Object.assign(
		defaultData,
		await globalData,
		await localData
	)

}