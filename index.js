const fs = require('fs')
const path = require('path')
var pug = require('pug')
var parser = require('fast-xml-parser')
const c = require('ansi-colors')
const _ = require('lodash')
const fetch = require('node-fetch')
const jsdom = require("jsdom")
const { JSDOM } = jsdom

let data = fs.readFileSync('./schema.json', 'utf8')
let jsObj = JSON.parse(data)
const graph = jsObj['@graph']

function getSchema(className){
  var classSchema = graph.filter( (obj) => {
    return obj['@id'] === className
  })
  if (classSchema.length > 0) return classSchema[0]
  return undefined
}
function addClasses(className){
  const classSchema = getSchema(className)
  classes.push(classSchema)
  if (classSchema['rdfs:subClassOf']){
    const parentClassName = classSchema['rdfs:subClassOf']['@id']
    const parentClass = getSchema(parentClassName)
    addClasses(parentClassName)
  }
}

const classes = []
function getAvailableProperties(details){
  addClasses(`https://schema.org/${details['@type']}`)
  const availableProperties = graph.filter( (obj) => {
    const isProperty = obj['@type'] === 'rdf:Property'
    if(!isProperty || !obj['https://schema.org/domainIncludes']){
      return false
    }
    const domainIncludes = [obj['https://schema.org/domainIncludes']].flat()
    const contains = domainIncludes.filter( (el) => {
      for (let i = 0 ; i < classes.length; i++){
        if( el['@id'] === classes[i]['@id']) return true
      }
    })
    if ( contains.length > 0 ){
      return true
    }
    return false
  })
  return availableProperties

}
function toArray(obj){
  const arr = []
  const keys = Object.keys(obj)
  const values = Object.values(obj)
  for (let i = 0; i < keys.length; i++){
    const subObj = {}
    subObj.key = keys[i]
    subObj.value = values[i]
    arr.push(subObj)
  }
  return arr
}
async function getJsonldBlock(details, options){
  details = _.merge(default_details, details)
  availableProperties = getAvailableProperties(details)
  const id = details['@context'] + '/' + details['@type']
  const schema = getSchema(id)
  var jsonld = details
  if (jsonld['@type'] === 'Book' && !jsonld.about){
    const query = jsonld['name'] + ' ' + jsonld['author']
    const domain = 'http://fast.oclc.org'
    const url = `${domain}/searchfast/services?${domain}/fastIndex/select?q=keywords%3A(${query})&rows=10&start=0&version=2.2&indent=on&fl=id,fullphrase,type,usage,status&sort=usage%20desc`
    await fetch(url,{method: 'GET'})
      .then(res => res.text())
      .then(body => {
        options = {attrNodeName: 'attr', ignoreAttributes: false, textNodeName: 'text'}
        var tObj = parser.getTraversalObj(body,options)
        var jsonObj = parser.convertToJson(tObj,options)
        res = jsonObj.response.result.doc
        el_id = res.str.filter(el=>{
          return el.attr['@_name'] === 'id'
        })[0].text.replace(/^[a-z]*/,'')
        worldcat_url = `http://id.worldcat.org/fast/${el_id}/`
        jsonld['about'] = worldcat_url
      })
  }
  if (options.wrap){
    jsonld = '<script type="application/ld+json">\n' + JSON.stringify(jsonld, null, 2) + '\n</script>'
  }
  return jsonld
}
async function getHtmlBlock(jsObj, options){
  jsObj = _.merge(default_details, jsObj)
  obj = await getJsonldBlock(jsObj, {wrap: false})
  const arr = toArray(jsObj)
  schemaHtmlTemplatePath = path.join(__dirname, 'components', obj['@type'] + '.pug')
  try{
    fs.accessSync(schemaHtmlTemplatePath)
  } catch (e){
    schemaHtmlTemplatePath = path.join(__dirname, 'components', 'Default' + '.pug')
    //console.log(e)
  }
//console.log('schemaHtmlTemplateExists')
//console.log(schemaHtmlTemplateExists)
  const fdata = fs.readFileSync(schemaHtmlTemplatePath,'utf8')
  
//console.log(arr)
//console.log(obj)

  const keys = Object.keys(obj)
  const values = Object.values(obj)
  for (let i = 0; i < arr.length; i++) {
    value = obj[keys[i]]
      console.log(value)
    if(typeof value === 'object'){
      obj[keys[i]] =  getHtmlBlock(value)
//      console.log(obj[keys[i]])
    }
/*
*/
  }
  const htmlstr = await pug.render(fdata,{arr,obj})
//  console.log(htmlstr)
  return htmlstr
}

function getAllBlocks(){}
const default_details = {
  "@context": "https://schema.org"
}
const details = {
  "@type": "WebPage",
  "breadcrumb": "",
  "mainEntity": { "@type": "Article" }
}


const schema = {
  JSONLD: getJsonldBlock,
  HTML: getHtmlBlock,
  ALL: getAllBlocks
}
options = { wrap: true }
//const jsonld = schema.JSONLD(details, options)
const html = schema.HTML(details, options)
//const all = schema.ALL(details, options)

//jsonld.then( res => console.log(res) )
