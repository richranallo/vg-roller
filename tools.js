const _ = require('lodash')

let die = () => _.random(1,6)

let roll = (pool) => _.map(new Array(pool), d=> die())

let formatPool = (pool) => {
  return _.chain(pool)
    .thru(formSets)
    .thru(sort)
    .thru(_.reverse)
    .join(', ')
    .value()
}

let pullDice = (command) => {
  let parsedDice = []
  let trimmedCommand = _.replace(command, /(\d+)\s*[☆\*]\s*([1-6])/gi, '$1☆$2')
  let sets = trimmedCommand.match(/\d+☆[1-6]/g)
  let singleDice = trimmedCommand.replace(/\d+☆[1-6]/g, '').match(/[1-6](?!s)/g)
  _.each(singleDice, die => parsedDice.push(parseInt(die, 10)))
  _.each(sets, set => {
    let splitSet = set.split('☆').map(d => parseInt(d, 10))
    parsedDice.push(..._.fill(new Array(splitSet[0]), splitSet[1]))
  })
  return parsedDice
}

let sort = (r) => {
  return _.sortBy(r)
}

let takeOnes = (r) => {
  return _.filter(r, v => v>1)
}

let formSets = (r) => {
  let heights = _.uniq(r)
  return _.chain(heights)
    .map(h => `${r.filter(v => v===h).length}☆${h}`)
    // .filter(s => s[0] !== '1')
    .value()
}

let aggregateRolls = (counts) => {
  let tot = 0
  return _.mapValues(counts, v => {
    tot += v
    return tot
  })
}

let percentageRolls = (counts, total) => _.mapValues(counts, v => v/total)

/*let formatResults = (counts, total, depth) => {
  let allSets = _.keys(_.first(counts))
  let formatted = "set | "
  for (var d=0; d<depth; d++) {
    formatted += `set ${d+1} | `
  }
  formatted += "\n"
  for (var d=0; d<depth; d++) {
    formatted += "----- | "
  }
  formatted += "\n"
  _.each(allSets, set => {
    formatted += `${set} | `
    for(var d=0; d<depth; d++){
      formatted += `${_.get(counts[d], set, 0)} | `
    }
    formatted += "\n"
  })

  return formatted
}*/

function removeSubset(set, subset){
  /*******/ console.log('set', set)
  /*******/ console.log('subset', subset)
  let resultSet = []
  let foundResults
  _.each(subset, e => {
    let foundIndex = _.findIndex(set, i => _.eq(e,i))
    /*******/ console.log('foundIndex', foundIndex)
    if(foundIndex < 0){
      set.push(...resultSet)
      resultSet = []
      foundResults = false
      return foundResults
    }
    resultSet.push(...set.splice(foundIndex, 1))
    foundResults = true
  })
  return resultSet
}

module.exports = {
  die,
  roll,
  formatPool,
  aggregateRolls,
  percentageRolls,
  removeSubset,
  pullDice/*,
  formatResults*/
}