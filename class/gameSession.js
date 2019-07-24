'use strict'
const _ = require('lodash')
const Pool = require('./pool.js')
const Player = require ('./player.js')
const Round = require ('./round.js')
const {roll, formatPool, removeSubset} = require('../tools.js')

module.exports =  class GameSession {
  constructor(gm_id, channel_id, name){
    this.gm_id = gm_id
    this.channel = channel_id
    this.name = name
    this.players = [new Player(gm_id, 'Game Master')]
    this.group_pool = new Pool()
    this.round = new Round()
  }
  isGM = player_id => this.isPlayer && _.eq(player_id, this.gm_id)
  isPlayer = player_id => !_.isNil(_.find(this.players, {id: player_id}))
  addPlayer(player_id, character){
    this.players.push(new Player(player_id, character))
  }
  roll = (pool, {player_id, replyTo} = options) => {
  	let rollingPlayer = _.find(this.players, {id: player_id})
  	rollingPlayer.pool.set(roll(pool))
    replyTo(`<@${player_id}>, you rolled ${formatPool(rollingPlayer.pool.dice)}`)
    return rollingPlayer.pool.dice
  }
  reroll1s = ({player_id, replyTo} = options) => {
    if(this.round.start_of_round){
      let rollingPlayer = _.find(this.players, {id: player_id})
      let all1s = _.remove(rollingPlayer.pool.dice, r => r ===1)
      if(!_.isEmpty(all1s)){
        replyTo(`<@${player_id}>, you rolled ${formatPool(all1s)}. rerolling...`)
        rollingPlayer.pool.dice.push(...roll(all1s.length))
        replyTo(`<@${player_id}>, you now have ${formatPool(rollingPlayer.pool.dice)}.`) 
      } else replyTo(`<@${player_id}>, you didn't roll any 1s.`)
    } else replyTo(`<@${player_id}>, you can only reroll 1s at the start of the round.`)
  }
  /*commitRoll = ({player_id, for_group, replyTo} = options) => {
    let rollingPlayer = _.find(this.players, {id: player_id})
    if(for_group){
      this.group_pool.set(rollingPlayer.roll)
    } else {
      rollingPlayer.pool.set(rollingPlayer.roll)
    }
    rollingPlayer.roll = []
  }*/
  double = ({player_id, replyTo} = options) => {
     if(this.round.start_of_round){
      let rollingPlayer = _.find(this.players, {id: player_id})
      let lowRolls = _.remove(rollingPlayer.pool.dice, r => r <= 3)
      if(!_.isEmpty(lowRolls)){
        rollingPlayer.pool.dice.push(..._.map(lowRolls, r => r*2))
        replyTo(`<@${player_id}>, your doubled roll is ${formatPool(rollingPlayer.pool.dice)}`)
      } else replyTo(`<@${player_id}>, you have no dice to double.`)
    } else replyTo(`<@${player_id}>, you can only double dice at the start of the round.`)
  }
  give = ({giving_player_id, receiving_player_id, dice, replyTo}) => {
    let givingPlayer = _.find(this.players, {id: giving_player_id})
    let receivingPlayer = _.find(this.players, {id: receiving_player_id})
    let givingPool = removeSubset(givingPlayer.pool.dice, dice)
    if(_.isEmpty(givingPool)) {
      replyTo(`<@${giving_player_id}>, you don't have that many dice to give`)
      return false
    }
    receivingPlayer.pool.dice.push(...givingPool)
    replyTo(`<@${receiving_player_id}> now has ${formatPool(receivingPlayer.pool.dice)}`)
  }
  spend = ({player_id, dice, replyTo}) => {
    let spendingPlayer = _.find(this.players, {id: player_id})
    let spentSet = removeSubset(spendingPlayer.pool.dice, dice)
    if(_.isEmpty(spentSet)) {
      replyTo(`<@${player_id}>, you don't have that many dice to spend`)
      return false
    }
    replyTo(`<@${player_id}> spent ${formatPool(spentSet)}`)
  }
  status = () => {
    return _.toPlainObject(this)
  }
}