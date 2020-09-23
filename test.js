const pug = require('pug')
const html = pug.render('h1= title', {title: 'hi'})
console.log(html)
