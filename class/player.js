'use strict';
const Pool = require('./pool.js')

module.exports = class Player {
  constructor(player_id, character){
	  this.id = player_id,
	  this.name = character,
	  this.roll = [],
	  this.pool = new Pool()
  }
}