const fs = require('fs')
const merge = require('deepmerge')
const path = require('path')
var pug = require('pug')
var parser = require('fast-xml-parser')
const c = require('ansi-colors')

let schema = fs.readFileSync('./schema.json', 'utf8')
schema = JSON.parse(schema)
const graph = schema['@graph']

async function getTemplate(templateName){
  var schemaHtmlTemplatePath = path.join(__dirname, 'components', templateName + '.pug')
  try{
    fs.accessSync(schemaHtmlTemplatePath)
  } catch (e){
    schemaHtmlTemplatePath = path.join(__dirname, 'components', 'Default' + '.pug')
  }
  const fdata = fs.readFileSync(schemaHtmlTemplatePath,'utf8')
  return fdata
}
async function html(data){

  const template = await getTemplate(data['@type'])
  
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    const value = data[keys[i]]
    if(typeof value === 'object'){
      data[keys[i]] =  await html(value)
    }
  }
  return await pug.render(template, {data, mustEscape: false} )
}

module.exports = html

const data = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "breadcrumb": "",
  "mainEntity": { 
    "@type": "Article",
    "articleBody": "someTextaeoueoauaeouaeo ntehu nteoh uaeonhu nae u"
  }
}

html(data).then( res => console.log(res) )
