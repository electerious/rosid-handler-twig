'use strict'

const path = require('path')
const locatePath = require('locate-path')

/**
 * Look for data.
 * @public
 * @param {?String} filePath - Path to the file being rendered.
 * @returns {Promise<?String>} Path to the data file.
 */
module.exports = async function(filePath) {

	const fileDir = path.dirname(filePath)
	const fileName = path.parse(filePath).name

	// Look for the data in the same directory as filePath
	const dataPath = await locatePath([
		`${ fileName }.data.js`,
		`${ fileName }.data.json`
	], {
		cwd: fileDir
	})

	// Convert dataPath path to an absolute path
	return dataPath==null ? null : path.join(fileDir, dataPath)

}