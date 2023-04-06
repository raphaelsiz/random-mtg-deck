usage:
```js
import {Commander} from 'random-mtg-deck'
Commander({}).then(deck=>{
    deck.exportFile("./commander.cod","cod")
    deck.exportFile("./commander.json")
    let stringOfDeck = deck.exportString() //optional "cod" for cockatrice xml, otherwise it's json
})
```
Parameters for `Commander` (all optional, but if you don't pass in any you still need to pass in an empty object):
* `random`: defaults to `true`. Set to `false` if you want your deck to have an appropriate amount of lands. Will eventually add a way to actually make sure your mana base is covered with said lands (this will also be optional).
* `colors`: defaults to `"wubrg"`. If you want to limit what colors your commander can be, put it here. Think of it as searching `ci<=[insert colors here]` on scryfall.
* `sets`: defaults to a very long array of sets I copied from the wikipedia page. Must be an array with one or more values. It won't work if none of the sets in your array have valid commanders in them. This variable determines what sets the generator is allowed to pull from. Not all sets have been added yet.
* `illegal`: This parameter does nothing right now. Eventually, you can set it to true to get a deck that's not commander-legal, as a bit.

Eventually, more deck formats and export formats will be added, and I'll finish adding all possible sets and removing any that you can't get commanders from. MOM will be automatically added (in a hacky way but nonetheless) when it's released.