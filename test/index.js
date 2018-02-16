'use strict'

const os = require('os')
const path = require('path')
const assert = require('chai').assert
const uuid = require('uuid/v4')
const index = require('./../src/index')

const fsify = require('fsify')({
	cwd: os.tmpdir()
})

describe('index()', function() {

	it('should return an error when called without a filePath', async function() {

		return index().then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(err.message, `'filePath' must be a string`)

		})

	})

	it('should return an error when called with invalid options', async function() {

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`
			}
		])

		return index(structure[0].name, '').then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.strictEqual(err.message, `'opts' must be undefined, null or an object`)

		})

	})

	it('should return an error when called with a fictive filePath', async function() {

		return index(`${ uuid() }.twig`).then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.isNotNull(err)
			assert.isDefined(err)

		})

	})

	it('should return an error when called with invalid Twig', async function() {

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: '{{ & }}'
			}
		])

		return index(structure[0].name).then(() => {

			throw new Error('Returned without error')

		}, (err) => {

			assert.isNotNull(err)
			assert.isDefined(err)

		})

	})

	it('should load Twig and transform it to HTML', async function() {

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: '{{ environment }}'
			}
		])

		const result = await index(structure[0].name)

		assert.strictEqual(result, 'dev')

	})

	it('should load Twig and transform it to escaped HTML with custom global data', async function() {

		const data = { key: '<p>value</p>' }

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: '{{ key }}'
			}
		])

		const result = await index(structure[0].name, { data })

		assert.strictEqual(result, '&lt;p&gt;value&lt;/p&gt;')

	})

	it('should load Twig and transform it to HTML with external custom global data', async function() {

		const data = { key: 'value' }

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: '{{ key }}'
			},
			{
				type: fsify.FILE,
				name: `${ uuid() }.json`,
				contents: JSON.stringify(data)
			}
		])

		const result = await index(structure[0].name, { data: structure[1].name })

		assert.strictEqual(result, data.key)

	})

	it('should load Twig and transform it to HTML with relative included content', async function() {

		const folderName = uuid()
		const fileName = `${ uuid() }.twig`

		const structure = await fsify([
			{
				type: fsify.DIRECTORY,
				name: folderName,
				contents: [
					{
						type: fsify.FILE,
						name: fileName,
						contents: 'value'
					}
				]
			},
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: `{% include './${ folderName }/${ fileName }' %}`
			}
		])

		const file = path.relative(process.cwd(), structure[1].name)
		const result = await index(file)

		assert.strictEqual(result, structure[0].contents[0].contents)

	})

	it('should load Twig and transform it to HTML with included content', async function() {

		const fileName = `${ uuid() }.twig`

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: fileName,
				contents: 'value'
			},
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: `{% include '${ fileName }' %}`
			}
		])

		const result = await index(structure[1].name, { src: path.dirname(structure[1].name) })

		assert.strictEqual(result, structure[0].contents)

	})

	it('should load Twig and transform it to HTML with included content but without global data', async function() {

		const data = { key: 'value' }
		const fileName = `${ uuid() }.twig`

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: fileName,
				contents: '{{ key }}{{ environment }}'
			},
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: `{% include '${ fileName }' with ${ JSON.stringify(data) } only %}`
			}
		])

		const result = await index(structure[1].name, { src: path.dirname(structure[1].name) })

		assert.strictEqual(result, data.key)

	})

	it('should load Twig and transform it to HTML with custom shy filter', async function() {

		const target = 'Long head|lines are awe|some'

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: `{{ '${ target }' | shy }}`
			}
		])

		const result = await index(structure[0].name)

		assert.strictEqual(result, 'Long head&shy;lines are awe&shy;some')

	})

	it('should load Twig and transform it to HTML with custom shy filter on an undefined variable', async function() {

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: `{{ target | shy }}`
			}
		])

		const result = await index(structure[0].name)

		assert.strictEqual(result, '')

	})

	it('should load Twig and transform it to optimized HTML when optimization enabled', async function() {

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: '{{ environment }}'
			}
		])

		const result = await index(structure[0].name, { optimize: true })

		assert.strictEqual(result, 'prod')

	})

	it('should load Twig and transform it to HTML with a custom prepend', async function() {

		const prepend = 'value'

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: ''
			}
		])

		const result = await index(structure[0].name, { prepend })

		assert.strictEqual(result, prepend)

	})

	it('should load Twig and transform it to HTML with a custom append', async function() {

		const append = 'value'

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ uuid() }.twig`,
				contents: ''
			}
		])

		const result = await index(structure[0].name, { append })

		assert.strictEqual(result, append)

	})

	it('should load Twig and transform it to HTML with custom data from a JS data file', async function() {

		const data = { key: 'value' }
		const fileName = uuid()

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ fileName }.twig`,
				contents: '{{ key }}'
			},
			{
				type: fsify.FILE,
				name: `${ fileName }.data.js`,
				contents: `module.exports = ${ JSON.stringify(data) }`
			}
		])

		const result = await index(structure[0].name)

		assert.strictEqual(result, data.key)

	})

	it('should load Twig and transform it to HTML with custom data from a JSON data file', async function() {

		const data = { key: 'value' }
		const fileName = uuid()

		const structure = await fsify([
			{
				type: fsify.FILE,
				name: `${ fileName }.twig`,
				contents: '{{ key }}'
			},
			{
				type: fsify.FILE,
				name: `${ fileName }.data.json`,
				contents: JSON.stringify(data)
			}
		])

		const result = await index(structure[0].name)

		assert.strictEqual(result, data.key)

	})

	describe('.in()', function() {

		it('should be a function', function() {

			assert.isFunction(index.in)

		})

		it('should return a default extension', function() {

			assert.strictEqual(index.in(), '.twig')

		})

		it('should return a default extension when called with invalid options', function() {

			assert.strictEqual(index.in(''), '.twig')

		})

		it('should return a custom extension when called with options', function() {

			assert.strictEqual(index.in({ in: '.xml' }), '.xml')

		})

	})

	describe('.out()', function() {

		it('should be a function', function() {

			assert.isFunction(index.in)

		})

		it('should return a default extension', function() {

			assert.strictEqual(index.out(), '.html')

		})

		it('should return a default extension when called with invalid options', function() {

			assert.strictEqual(index.out(''), '.html')

		})

		it('should return a custom extension when called with options', function() {

			assert.strictEqual(index.out({ out: '.xml' }), '.xml')

		})

	})

	describe('.cache', function() {

		it('should be an array', function() {

			assert.isArray(index.cache)

		})

	})

})