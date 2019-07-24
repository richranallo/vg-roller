# vg-roller
A die roller for the *Velvet Generation* RPG.

Since the *Velvet Generation* rules engine involves a lot more player-to-player interaction than most RPGs, this bot exists to track what players have rolled, and to allow them to exchange dice between one another and the group pool.

This app works through a bot named **Nomi.** Invite Nomi to your server by following this link: https://discordapp.com/api/oauth2/authorize?client_id=597149708909150229&permissions=0&scope=bot

## Commands

Interact with Nomi by @mentioning it in a chat message and then using one of the following commands. Commands are case insensitive and often involve additional language that tells Nomi what to do specifically. If a command needs something afterward in order to work, it will be noted below in the command.

Commands also sometimes take optional arguments, which are single words that need to start with an `!`. 

### Start `Name`

Start a *Velvet Generation* game session. To cut down on confusion, there can only be one game session running in a channel at a time.

**Usage:** `@nomi start Invitation to the Blues` will begin a game session named **Invitation to the Blues** in the channel you're in. The player who started the game session will be assigned as the session's GM.

### Status

Report the current dice status of the game session. This will give the session's name, then show the number of dice in the group pool, then those rolled by every player (including the GM).

This will not work if there isn't a game session currently active in the channel.

**Usage:** `@nomi status` will pull the current status of the session, prompting a response like:

````
Invitation to the Blues
Group pool: 2☆3, 1☆6
Game Master: 2☆5, 2☆3, 2☆1, 2☆6
Jennie DiMilo: 2☆6, 2☆4
Wade Alaska:2☆5, 2☆3
Sister Havana: 3☆6, 2☆5
````

### Add `player` `character`

Add a player to the active game session. Only the GM can do this.

A player needs to be in the active session in order to roll dice or interact with Nomi.

**Usage:** `@nomi add @Ryvre Carrie Virtue` adds the player @Ryvre to the game, and names their character "Carrie Virtue."

Note that you need to @mention the player after the `add` command.

### Roll `dice`

Rolls a number of `dice	` and adds them to your pool.

**Usage:** `@nomi roll 7` will roll 7d and report back the results of your roll:

`@Rich Ranallo, you rolled 3☆3, 2☆2, 1☆5, 1☆4`

#### Options
`roll` takes a number of options to handle rules exceptions.

* `!for` `player` rolls dice but gives them to `player` instead of you. Example: `@nomi roll 3 !for @jack` rolls 3 dice for @jack instead of the player who asked.
* `reroll1s` automatically rerolls any dice that come up 1. `@nomi roll 7 !reroll1s` is functionally the same as asking `@nomi roll 7` and then `@nomi reroll1s ` immediately after.
* `!double` automatically turns any 1s rolled into 2s, 2s into 4s and 3s into 6es. `@nomi roll 7 !double` is functionally the same as asking `@nomi roll 7` and then `@nomi double` immediately after.

### Double

Turn all 1s in your pool into 2s, 2s into 4s and 3s into 6es.

**Usage: ** if you had previously rolled `3☆3, 2☆2, 1☆5, 1☆4`, then calling `@nomi double` would result in a pool of `3☆6, 3☆4, 1☆5`.

### Reroll1s

Replace every 1 in your pool with a random die roll (the random die roll still might return a 1, however).

**Usage:** if you had previously rolled `3☆3, 2☆1, 1☆5, 1☆4`, then calling `@nomi reroll1s` might result in a pool of `3☆3, 2☆4, 1☆5, 1☆2`.

### Spend `dice`

Removes the named `dice` from your pool and reports that you've spent them

#### Options
* `leave` `number` leaves some number of dice from your set in the group pool (defaults to 1).
* `take` `number` takes some number of matching dice from the group pool before you send it (defaults to all).
* `multiply` `number` increases the number of dice you contribute to the pool by `number` (default 2).

### Give `player` `dice`

Takes the matching `dice` from your pool and adds them to `player`'s pool.

### Take


## Models

### Game Session

### Player

### Pool