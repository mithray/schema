const fs = require('fs')
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
function getHtmlBlock(){}
function getAllBlocks(){}
const default_details = {
  "@context": "https://schema.org"
}
const details = {
  "@type": "Book",
  "name": "1984",
  "author": "George Orwell"
}


const schema = {
  JSONLD: getJsonldBlock,
  HTML: getHtmlBlock,
  ALL: getAllBlocks
}
options = { wrap: true }
const jsonld = schema.JSONLD(details, options)
const html = schema.HTML(details, options)

jsonld.then(res => console.log(res))
