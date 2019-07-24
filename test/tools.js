'use strict'

const {expect} = require('chai')
const {faker} = require('faker')
const _ = require('lodash')
const {pullDice} = require('../tools.js')

describe('Tools', () => {
	describe('pullDice', () => {
		it('should pull sets from a command', () => {
			let pulledSets = pullDice(`1☆  6, 2   ☆    4, 5, 5 5s 10☆3, 1*2, 1☆1`)
			expect(pulledSets).to.be.an('array').with.length(17)
				.and.any.members([
				  5, 5, 6, 4, 4, 3, 3,
				  3, 3, 3, 3, 3, 3, 3,
				  3, 2, 1
				])
		})
	})
})