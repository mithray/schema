const fs = require('fs')
const c = require('ansi-colors')
const _ = require('lodash')

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
function jsonldBlock(details){
  details = _.merge(default_details, details)
  availableProperties = getAvailableProperties(details)
}
const default_details = {
  "@id": "https://schema.org"
}
const details = {
  "@type": "Blog"
}

jsonldBlock(details)
