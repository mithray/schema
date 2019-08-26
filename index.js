const fs = require('fs')

let data = fs.readFileSync('./schema.json', 'utf8')
let data_json = JSON.parse(data)
console.log(data_json.children[0].children[0].children[0].children)


console.log(data_json)
