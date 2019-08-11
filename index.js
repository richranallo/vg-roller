'use strict'
const Discord = require('discord.js')
const client = new Discord.Client()
const _ = require('lodash')
const {formatPool, pullDice} = require('./tools')
const GameSession = require ('./class/gameSession')
client.on('uncaughtException', (err) => {
  console.log('err', err)
})

const {findChannelGame} = require('./game')
let gameIndex

function sendStatusUpdate({activeGame, channel}){
  let statusMsg = `**${activeGame.name}**\n`
  statusMsg += `Group pool: ${formatPool(activeGame.group_pool.dice)}\n`
  _.each(activeGame.players, player => statusMsg += `${player.name}: ${formatPool(player.pool.dice)}\n`)
  channel.send(statusMsg)
}

process.on('uncaughtException', err => {
  console.error('caught Error:', err)
})

/**********
  rolling dice
   command: roll Xd | -wild1s -reroll1s -taketime-keepxs
   roll: roll this many dice
   wild1s: report back how many 1s, ask what they should be set to
   -reroll1s: report back what the original roll was, reroll 1s
   -taketime-keepxs: save all dice at x height form current roll, reroll x-wd and add to roll
**********/

client.on('ready', () => {
  gameIndex = []
  console.log('Connected as ' + client.user.tag)
  // List servers the bot is connected to
  console.log('Servers:')
  client.guilds.forEach((guild) => {
      console.log(' - ' + guild.name)
    // List all channels
    guild.channels.forEach((channel) => {
        // console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        console.log('-- channel', channel.name, channel.permissionOverwrites)
    })
  })
  var generalChannel = client.channels.get('597162766914027525') // Replace with known channel ID
  generalChannel.send(`\`THE_DIE_ROLLER\` has logged on`)
})

client.on('message', (receivedMessage) => {
  let {author, content, channel} = receivedMessage
    // Prevent bot from responding to its own messages
    if (author == client.user) return
  function replyTo(msg){
    return channel.send(msg)
  }
  try{
    // Check if the bot's user was tagged in the message
    let botNameMatch = new RegExp('^' + client.user.toString())
    if (content.match(botNameMatch)) {
      let targetPlayer, forPlayer, for_group, rollArgs, dice, receivingPlayer
      let chatArgs = content.split(/ +/)
      let bot = chatArgs.shift()
      let command = chatArgs.shift()
      let activeGame = findChannelGame(gameIndex, channel)
      switch(_.toLower(command)){
        case 'start':
          if(_.find(gameIndex, {channel: channel.id})) {
            channel.send(`There's already a game in this channel.`)
            break
          } else {
            gameIndex.push(new GameSession(author.id, channel.id, chatArgs.join(' ')))
            activeGame = findChannelGame(gameIndex, channel)
            channel.send(`Starting **${activeGame.name}**`)
            sendStatusUpdate({activeGame, channel})
          }
          break
        if(_.isUndefined(activeGame)) throw new Error(`There's no active game. Use **start** to start one.`)
          break
        case 'end':
          if(activeGame && activeGame.isGM(author.id)) {
            _.remove(gameIndex, {channel: channel.id})
            channel.send(`Game ended.`)
          } else {
            channel.send(`You aren't running a game right now.`)
          }
          break
        case 'add':
          let newPlayer = _.replace(chatArgs.shift(), /[^a-z\d]/g, '')
          if(activeGame && activeGame.isGM(author.id) && !activeGame.isPlayer(newPlayer)) {
            let newCharacter = chatArgs.join(' ')
            activeGame.addPlayer(newPlayer, newCharacter)
            channel.send('added.')
          } else {
            channel.send(`I can't do that.`)
          }
          break
        case 'leave':
          break
        case 'roll':
          let poolSize = parseInt(chatArgs.shift(), 10)
          if(_.isNumber(poolSize) && poolSize > 0) {
            rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
            targetPlayer = author.id
            forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
            for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ? true : false
            if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
            if(activeGame && activeGame.isPlayer(author.id) && activeGame.isPlayer(targetPlayer)) activeGame.roll(poolSize, {player_id: targetPlayer, replyTo})
            if(_.find(rollArgs, arg => _.startsWith(arg, '!reroll1s') &&
              !_.find(rollArgs, arg => _.startsWith(arg, '!wild1s')))) activeGame.reroll1s({player_id: targetPlayer, replyTo})
            if(_.find(rollArgs, arg => _.startsWith(arg, '!double'))) activeGame.double({player_id: targetPlayer, replyTo})
            sendStatusUpdate({activeGame, channel})
          } else {
            channel.send(`You need to tell me how many dice to roll.`)
          }
          break
        case 'double':
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          targetPlayer = author.id
          forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
          for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ? true : false
          if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
          if(activeGame && activeGame.isPlayer(author.id) && activeGame.isPlayer(targetPlayer)) activeGame.double({player_id: targetPlayer, replyTo})
          break
        case 'reroll1s':
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          targetPlayer = author.id
          forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
          for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ? true : false
          if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
          if(activeGame && activeGame.isPlayer(author.id) && activeGame.isPlayer(targetPlayer)) activeGame.reroll1s({player_id: targetPlayer, replyTo})
          break
        case 'wild':
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          targetPlayer = author.id
          forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
          for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ? true : false
          if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
          if(activeGame && activeGame.isPlayer(author.id) && activeGame.isPlayer(targetPlayer)) activeGame.wild({player_id: targetPlayer, dice, replyTo})
          break
        case 'status':
          if(activeGame && activeGame.isPlayer(author.id)) {
            sendStatusUpdate({activeGame, channel})
          }
          break
        case 'spend':
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          targetPlayer = author.id
          forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
          for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ?
            true :
            false
          let leave = (_.find(rollArgs, arg => _.startsWith(arg, '!leave'))) ?
            _.toNumber(_.find(rollArgs, arg => _.startsWith(arg, '!leave')).split(/ +/i)[1]) :
            undefined
          let take = (_.find(rollArgs, arg => _.startsWith(arg, '!take'))) ?
            _.toNumber(_.find(rollArgs, arg => _.startsWith(arg, '!take')).split(/ +/i)[1]) :
            undefined
          if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
          activeGame.spend({player_id: targetPlayer, dice, leave, take, replyTo})
          break
        case 'scrap':
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          targetPlayer = author.id
          forPlayer = _.find(rollArgs, arg => _.startsWith(arg, '!for '))
          for_group = (_.find(rollArgs, arg => _.startsWith(arg, '!group'))) ?
            true :
            false
          if(forPlayer && activeGame.isGM(author.id)) targetPlayer =  forPlayer.replace(/[^\d]/g, '')
          activeGame.spend({player_id: targetPlayer, dice, leave: 0, replyTo})
          break
        case 'give':
          receivingPlayer = chatArgs.shift().replace(/[^\d]/g, '')
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          targetPlayer = author.id
          activeGame.give({giving_player_id: targetPlayer, receiving_player_id: receivingPlayer, dice, replyTo})
          break
        case 'grant':
          receivingPlayer = chatArgs.shift().replace(/[^\d]/g, '')

          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          activeGame.grant({player_id: receivingPlayer, dice, replyTo})
          break
        case 'take':
          let holdingPlayer = chatArgs.shift().replace(/[^\d]/g, '')
          rollArgs = chatArgs.join(' ').split(/ +(?=!)/)
          dice = pullDice(rollArgs.shift())
          targetPlayer = author.id
          activeGame.give({giving_player_id: holdingPlayer, receiving_player_id: targetPlayer, dice, replyTo})
          break
        default:
          channel.send(`I don't know what you're talking about.`)
        /********
        NEEDED NEW COMMANDS:
          give wxh: give someone dice from your pool (lover relationship)
            !random: roll the die to them instead of giving it
            !reroll1s
          useSaved: spend an arbitrary set regardless of your roll
          take wxh: take dice from someone's pool (rival relationship)
          roll !keep wxh: keep a set from your existing pool and reroll remainder
          roll !wild: needs to respond back to the player with their existing roll, asking them what to set their 1s to
          clearGroupPool: empty the group pool

          ******/
        }
    } else return
  } catch(e){ 
    console.error('err', e)
    replyTo(`Couldn't do that for reasons: ${e}`)
  } 
})

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> 'Click to Reveal Token'
const bot_secret_token = process.env.BOT_SECRET_TOKEN

client.login(bot_secret_token)