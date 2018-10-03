/**
 * This script generate the most lightweight min-js for browsers, unfortunatly it is very tideous to keep alive
 */

const fs = require('fs')

/**
 * assert than anonymous function have a name
 */
const getFunctionToString = (name, func) => {
  if (func.name === '') {
    console.log(func.name);
    return `const ${name} = ${func.toString()}`
  } else {
    return func.toString()
  }
}

/**
 * Create an object
 * @param {*} name 
 * @param {*} obj 
 */
const makeObject = (name, obj) => {
  return `const ${name} = ${JSON.stringify(obj, null, 2)}`
}

const main = async () => {
  // const socketio = fs.readFileSync('./socketio.js', 'utf-8')
  // const pouchdb = fs.readFileSync('.//pouchdb-7.0.0.min.js', 'utf-8')
  const PropagandeClient = require('../lib/client/propagandeClient').PropagandeClient.toString()
  const genId = getFunctionToString('genId', require('../lib/common/utils').genId)
  const pouchConnexion = require('../lib/common/pouchWrapper').PouchConnexion.toString()
  const pouchWrapper = require('../lib/common/pouchWrapper').default.toString()
  const DirectCallClient = require('../lib/common/directCall').DirectCallClient.toString()
  const propagandeGlobal = makeObject('propagandeGlobal', require('../lib/common/propagandeGlobal'))

  const final = `

${propagandeGlobal}

${genId}

${pouchConnexion}

${pouchWrapper}

${DirectCallClient}

${PropagandeClient}

  `
  console.log(final);
}

main()