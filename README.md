# rosid-handler-twig

[![Travis Build Status](https://travis-ci.org/electerious/rosid-handler-twig.svg?branch=master)](https://travis-ci.org/electerious/rosid-handler-twig) [![Coverage Status](https://coveralls.io/repos/github/electerious/rosid-handler-twig/badge.svg?branch=master)](https://coveralls.io/github/electerious/rosid-handler-twig?branch=master) [![Dependencies](https://david-dm.org/electerious/rosid-handler-twig.svg)](https://david-dm.org/electerious/rosid-handler-twig#info=dependencies) [![Greenkeeper badge](https://badges.greenkeeper.io/electerious/rosid-handler-twig.svg)](https://greenkeeper.io/)

A function that loads a Twig template and transforms it to HTML.

> 🏗 This module is based on [Twig.js](https://github.com/twigjs/twig.js). Twig.js is still in development and shouldn't be used in production.

## Install

```
npm install rosid-handler-twig
```

## Usage

### API

```js
const handler = require('rosid-handler-twig')

handler('index.twig').then((data) => {})
handler('index.twig', { optimize: true }).then((data) => {})
handler('index.twig', { data: { key: 'value' } }).then((data) => {})
handler('index.twig', { data: 'data.json' }).then((data) => {})
```

### Rosid

Add the following object to your `rosidfile.json`, `rosidfile.js` or [routes array](https://github.com/electerious/Rosid/blob/master/docs/Routes.md). `rosid-handler-twig` will transform all matching Twig files in your source folder to HTML.

```json
{
	"name"    : "Twig",
	"path"    : "[^_]*.{html,twig}*",
	"handler" : "rosid-handler-twig"
}
```

```html
<!-- index.twig -->
<h1>Hello {{ 'World' }}</h1>
```

```html
<!-- index.html (output) -->
<h1>Hello World</h1>
```

## Parameters

- `filePath` `{String}` Path to file.
- `opts` `{?Object}` Options.
	- `optimize` `{?Boolean}` - Optimize output. Defaults to `false`.
	- `data` `{?Object|String}` - Data uses to render the template. Defaults to `{}`.
	- `localOverwrites` `{?Boolean}` - Enable or disable [custom data per file](#custom-data-per-file). Defaults to `true`.
	- `prepend` `{?String}` - String that will be placed in front of the content of filePath. Defaults to `''`.
	- `append` `{?String}` - String that will be placed at the end of the content of filePath. Defaults to `''`.
	- `src` `{?String}` - Path base for injects with the inject tag. Defaults to the current working directory.

## Returns

- `{Promise<String|Buffer>}` The transformed file content.

## Miscellaneous

### Shy filter

`rosid-handler-twig` adds a custom filter that replaces `|` with `&shy;` and indicates that the string should not be auto escaped by Twig (similar to the `safe` filter).

```html
{{ 'Long head|lines are awe|some' | shy }}
```

### Data

The data in `opts.data` will be used to render your template. `opts.data` can either be an object (the data) or a string (path to data file). `rosid-handler-twig` tries to require the path when a string is specified instead of an object. The path must be absolute or relative to the current working directory.

### Custom data per file

Create a file with the name `filename.data.json` or `filename.data.js` along your `filename.twig` to add or overwrite data from `opts.data`. You can disable this behaviour with the `localOverwrites` option.

### Environment

`rosid-handler-twig` passes a variable called `environment` to your template. `environment` is `prod` when `opts.optimize` is `true` and `dev` when `opts.optimize` is `false`.