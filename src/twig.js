'use strict'

const util = require('util')
const fs = require('fs')
const Twig = require('twig')
const twig = Twig.twig

/**
 * Custom filter for Twig. Replaces pipes with shy and
 * indicates that the string should not be auto escaped.
 * @param {?String} target - The target object the filter gets applied on.
 * @returns {*}
 */
const shyFilter = function(target) {

	if (target == null) return target

	target = new String(target.replace(/\|/g, '&shy;'))

	// Don't escape output
	target.twig_markup = true

	return target

}

/**
 * Renders a Twig file with a new enviroment.
 * @param {String} filePath - Path to the Twig file being rendered.
 * @param {Object} data - Twig data used to render the file.
 * @param {Object} opts - Options.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, str.
 */
const render = function(filePath, data, opts, next) {

	Twig.extendFilter('shy', shyFilter)

	fs.readFile(filePath, 'utf8', (err, str) => {

		if (err != null) return next(err)

		str = opts.prepend + str + opts.append

		try {

			const template = twig({
				data: str,
				path: filePath,
				autoescape: true,
				allowInlineIncludes: true,
				rethrow: true
			})

			const result = template.render(data)

			return next(null, result.toString())

		} catch (err) {

			return next(err)

		}

	})

}

/**
 * Transforms Twig to HTML.
 * @public
 * @param {?String} filePath - Path to the Twig file being rendered.
 * @param {?Object} data - Twig data used to render the file.
 * @param {?Object} opts - Options.
 * @returns {Promise<String>} HTML.
 */
module.exports = async function(filePath, data, opts) {

	const prepend = (opts != null && typeof opts.prepend === 'string') ? opts.prepend : ''
	const append = (opts != null && typeof opts.append === 'string') ? opts.append : ''
	const src = (opts != null && typeof opts.src === 'string') ? opts.src : process.cwd()

	return util.promisify(render)(filePath, data, {
		prepend,
		append,
		src
	})

}