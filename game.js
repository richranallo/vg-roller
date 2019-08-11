'use strict'
const _ = require('lodash')
const {roll, aggregateRolls, percentageRolls, formatResults, formatPool, removeSubset} = require('./tools.js')

function findChannelGame(gameIndex, channel){
  return _.find(gameIndex, {channel: channel.id})
}

module.exports = {
	findChannelGame
}