'use strict'; 

module.exports = class Pool {
  constructor(...dice){
    this.dice = [...dice]
  }
  set(dice){
    this.dice = dice
  }
}
