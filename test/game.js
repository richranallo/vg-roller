'use strict'
const {expect} = require('chai')
const {faker} = require('faker')
const _ = require('lodash')

describe('Game', () => {
	const {findChannelGame} = require('../game')
	const gm_id = '999999999'
	const channel_id = '888888888'
	const GameSession = require('../class/gameSession')
	/******/console.log('GameSession', GameSession)
	const Player = require('../class/player')
	const Pool = require('../class/pool')
	const Round = require('../class/round')

	let testGame
	const seedPlayers = [
		{
			player_id: 777777777,
			character: 'Wild Rosemarie'
		},
		{
			player_id: 66666666,
			character: 'Sister Havana'
		},
		{
			player_id: 55555555,
			character: 'Dixie Narco'
		},
		{
			player_id: 44444444,
			character: 'Jean Genie'
		},
		{
			player_id: 33333333,
			character: 'Wade Alaska'
		},
		{
			player_id: 22222222,
			character: 'Ginger Brown'
		},
		{
			player_id: 111111111,
			character: 'Halloween Jack'
		}
	]
	const replyTo = (msg) => console.log(msg)

	it('should create a new game', () => {
		testGame = new GameSession(gm_id, channel_id, 'New Game')
		expect(testGame.gm_id).to.equal(gm_id)
		expect(testGame.channel).to.equal(channel_id)
		expect(testGame.name).to.equal('New Game')
		expect(testGame).to.be.instanceof(GameSession)
	})

	it('should have the correct players', () => {
		expect(testGame.players).to.be.an('array').with.length(1)
		expect(testGame.players[0]).to.be.instanceof(Player)
	})

	it('should have the right pool', () => {
		expect(testGame.group_pool).to.be.instanceof(Pool)
	})

	it('should verify the GM', () => {
		expect(testGame.isGM(gm_id)).to.be.true
	})

	describe('players', () => {
		it('should add players', () => {
			_.each(seedPlayers, (seed, i) => {
				let {player_id, character} = seedPlayers[i]
				testGame.addPlayer(player_id, character)
				expect(testGame.players[i+1]).to.be.an.instanceof(Player)
				expect(testGame.players[i+1].pool).to.be.an.instanceof(Pool)
				expect(testGame.players[i+1].id).to.equal(player_id)
				expect(testGame.players[i+1].name).to.equal(character)
				expect(testGame.isPlayer(player_id)).to.be.true
				expect(testGame.isGM(player_id)).to.be.false
			})
			expect(testGame.players).to.be.an('array').with.length(seedPlayers.length + 1)
		})

		describe('roll', () => {
			it('should roll dice for each player', () => {
				_.each(seedPlayers, (seed, i) => {
					let {player_id, character} = seedPlayers[i]
					testGame.roll(7, {player_id, replyTo})
					expect(testGame.players[i+1].pool.dice).to.be.an('array').with.length(7)
				})
			})
		})

		describe('double', () => {
			it('should double dice in one player\'s pool', () => {
				testGame.players[1].pool.dice = [1,2,3,4,5,6]
				testGame.double({player_id: testGame.players[1].id, replyTo})
				expect(testGame.players[1].pool.dice).to.be.an('array').with.length(6)
				expect(testGame.players[1].pool.dice).to.have.any.members([2,4,4,5,6,6])
			})
		})

		describe('give', () => {
			it('should give dice from one player to another', () => {
				testGame.players[1].pool.dice = [3,3,3]
				testGame.players[2].pool.dice = [3,3]
				testGame.give({giving_player_id: testGame.players[1].id, receiving_player_id: testGame.players[2].id, dice: [3,3,3], replyTo})
				expect(testGame.players[1].pool.dice).to.be.an('array').with.length(0)
				expect(testGame.players[2].pool.dice).to.be.an('array').with.length(5)
			})

			it('should not let a player give dice that they don\'t have', () => {
				testGame.players[1].pool.dice = [3,3,3]
				testGame.players[2].pool.dice = [3,3]
				testGame.give({giving_player_id: testGame.players[1].id, receiving_player_id: testGame.players[2].id, dice: [3,3,3,3], replyTo})
				expect(testGame.players[1].pool.dice).to.be.an('array').with.length(3)
				expect(testGame.players[2].pool.dice).to.be.an('array').with.length(2)
			})
		})

		describe('spend', () => {
			it('should let a player spend a set they have', () => {
				testGame.players[1].pool.dice = [3,3,3]
				testGame.spend({player_id: testGame.players[1].id,dice: [3,3,3], replyTo})
				expect(testGame.players[1].pool.dice).to.be.an('array').with.length(0)
			})
			it('should not let a player spend a set don\'t they have', () => {
				testGame.players[1].pool.dice = [3,3,3]
				testGame.spend({player_id: testGame.players[1].id,dice: [3,3,3,3], replyTo})
				expect(testGame.players[1].pool.dice).to.be.an('array').with.length(3)
			})
		})
	})
/*	
  roll
  reroll1s
  double
  give
  spend
  status
	*/
})