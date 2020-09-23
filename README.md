# Schema

## Introduction

*Still in design stage, nothing to see here*

This project houses schema.org json data and also provides some html representations of these schema in the form of html blocks.

## Contents

* [Introduction](#introduction)
* [Contents](#contents)
* [Installation](#installation)
* [Purpose](#purpose)
* [Usage](#usage)

## Installation

```sh
npm i @mithray/schema
```

## Purpose

See [docs](https://github.com/mithrayls/schema/docs) for more information.

## Usage

```javascript
const schema = require('@mithray/schema')

const animal_farm = {
	@context: "http://schema.org/",
	@graph: [{
		@type: "Book",
		@id: "http://id.worldcat.org/fast/1357727/",
		name: "Animal Farm",
		author: {
			@type: "Person",
    	@id": "http://viaf.org/viaf/17813",
			name: "George Orwell"
		}
		datePublished: ""
	}]
}

/**
 * @param {jsonld} required. An object containing linkable data.
 * @param {string=} optional. A string which identifies a mapping to an HTML component. The component will default to definition list if omitted.
 */
const html = schema.Book(animal_farm, 'dl')

console.log(html)
```

Result is
```html
<div itemscope itemtype="http://schema.org/Book">
	<span itemprop="name">Animal Farm</span>
	<span itemprop="author" itemscope itemtype="http://schema.org/Person">Orwell</span>
</div>
```

## Release Notes

### Release 0.0.13

* Update Readme
