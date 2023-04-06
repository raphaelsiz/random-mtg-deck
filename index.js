import axios from 'axios';
import encodeUrl from 'encodeurl';
import encode from 'encodeurl';
import fs from 'node:fs'
const allSets = ["10E","M13","M15","ORI","M19","M20","M21","LEG","ICE","HML","ALL","MIR","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG","MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP","TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON","ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR","RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ","OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM","GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR","MID","VOW","NEO","SNC","DMU","BRO","ONE","MOM","MH1","MH2","P3K","CHR","ATH","DPA","MD1","MB1","TSR","DMR","EVG","DDC","DDE","DDL","DDN","DDQ","DDS","DDT","DDU","DRB","V10","V11","V13","V14","V15","V16","V17","H09","PD2","PD3","MMA","MM2","EMA","MM3","IMA","A25","UMA","2XM","2X2","ORI","MP2","BRR","JMP","J22","SLD","SLX","BOT","HOP","PC2","PCA","ARC","E01","CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18","C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC","NCC","CLB","40K","BRC","CNS","CN2","BBD","UGL","UNH","UST","UND","UNF"]
const sortMethods = ["name","rarity","color","usd","tix","eur","cmc","power","toughness","edhrec","penny","artist","review"];
const dirs = ["auto","asc","desc"];
const indexed = ["10E","M13","M15","ORI","M19","M20","M21","LEG","ICE","HML","ALL","MIR","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG","MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP","TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON","ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR","RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ","OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM","GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR","MID","VOW","NEO","SNC","DMU","BRO","ONE","MH1","MH2","P3K","CHR","ATH","DPA","MD1","MB1","TSR","DMR","EVG","DDC","DDE","DDL","DDN","DDQ","DDS","DDT","DDU","DRB","V10","V11","V13","V14","V15","V16","V17","H09","PD2","PD3","MMA","MM2","EMA","MM3","IMA","A25","UMA","2XM","2X2","ORI","MP2","BRR","JMP","J22","SLD","SLX","BOT","HOP","PC2","PCA","ARC","E01","CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18","C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC","NCC","CLB","40K","BRC","CNS","CN2","BBD","UGL","UNH","UST","UND","UNF"];
const toIndex = allSets.filter(x=> !indexed.includes(x) && x != "MOM");
const setIndex = {}
loadIndex()
export const Commander = async function({colors="wubrg",illegal=false,sets,random=true}) {
    let validSets = (sets && Array.isArray(sets) && sets.length) ? sets : [...allSets];
    let set = validSets[Math.floor(Math.random()*validSets.length)];
    let commanderData;
    do {
        let data = await callCommander(colors,set);
        if (data) {
            commanderData = data[Math.floor(Math.random()*data.length)]
            console.log(commanderData.colors)
            let cid = commanderData.colors.join('');
            let commander = simplify(commanderData);
            let cards;
            if (random) {
                let cardsData = await callCommanderCards(cid,sets);
                if (!cardsData) return Error("Couldn't find enough cards. Please lower your standards.")
                cards = simplify(cardsData)
                if (cards.length < 99) {
                    let basics = cards.filter(x=>["Plains","Island","Swamp","Mountain","Forest"].includes(x.name));
                    let upTo = 99 - (cards.length - basics.length);
                    addBasics(upTo,basics);
                    cards.push(...basics);
                }
                makeCuts(99,cards)
                return {commander,cards,exportFile}
            }
            else {
                let cardsData = await callCommanderNonLands(cid,sets);
                let landsData = await callCommanderLands(cid,sets);
                if (!cardsData) return Error("Couldn't find enough cards. Please lower your standards.");
                if (!landsData) return Error("Couldn't find enough lands. Please lower your standards.");
                let nonLands = simplify(cardsData);
                let lands = simplify(landsData);
                makeCuts(61,nonLands);
                makeCuts(38,lands);
                addBasics(38,lands);
                cards = nonLands.concat(lands);
                return {commander,cards,exportFile}
            }
            function exportFile (filePath,type="json") {
                switch (type.toLowerCase()) {
                    case "cod":
                        let reducedCards = reduceBasics(cards);
                        let codStr = `<?xml version="1.0" encoding="UTF-8"?>
                        <cockatrice_deck version="1">
                            <deckname></deckname>
                            <comments></comments>
                            <zone name="side">
                                <card number="1" name="${commander.name}"/>
                            </zone>
                            <zone name="main">`
                        for (let card of reducedCards) {
                            let count = card.count || 1;
                            codStr += `<card number="${count}" name="${card.name}"/>`
                        }
                        codStr += `
                        </zone>
                    </cockatrice_deck>`
                        fs.writeFileSync(filePath,codStr)
                        break;
                    default: fs.writeFileSync(filePath,JSON.stringify({commander,cards}))
                }
            }
            function exportString (type="json") {
                switch (type.toLowerCase()) {
                    case "cod":
                        let reducedCards = reduceBasics(cards);
                        let codStr = `<?xml version="1.0" encoding="UTF-8"?>
                        <cockatrice_deck version="1">
                            <deckname></deckname>
                            <comments></comments>
                            <zone name="side">
                                <card number="1" name="${commander.name}"/>
                            </zone>
                            <zone name="main">`
                        for (let card of reducedCards) {
                            let count = card.count || 1;
                            codStr += `<card number="${count}" name="${card.name}"/>`
                        }
                        codStr += `
                        </zone>
                    </cockatrice_deck>`
                        return codStr;
                        break;
                    default: return JSON.stringify({commander,cards})
                }
            }
        } else {
            validSets.splice(validSets.indexOf(set));
            set = validSets[Math.floor(Math.random()*validSets.length)];
            console.log("no commander yet!")
            if (validSets.length < 1) return Error("Couldn't find a commander. Please lower your standards.")
        }
        await delay(50)
    } while (!commander)
}
async function callCommander (colors,set) {
    let commanderUrl =`https://api.scryfall.com/cards/search?q=c<=${colors} is:commander f:commander f:vintage set:${set}`
    let url = encode(commanderUrl) + `&order=${sortMethods[Math.floor(Math.random()*sortMethods.length)]}&dir=${dirs[Math.floor(Math.random()*3)]}`
    try {
        let json = await axios.get(url)
        //console.log(json.data)
        if (!json.data.data) console.log(url)
        return json.data.data;
    } catch(e){
        console.log(url)
        return false;
    }//console.log(url)
}
async function callCommanderCards(cid,sets) {
    let setString = sets? ` (${sets.join(' or ')})` : ''
    let queryUrl = `https://api.scryfall.com/cards/search?q=id<=${cid} f:vintage f:commander${setString}`
    try {
        let json = await axios.get(encode(queryUrl) + `&order=${sortMethods[Math.floor(Math.random()*sortMethods.length)]}&dir=${dirs[Math.floor(Math.random()*3)]}`)
        return json.data.data;
    } catch(e) {
        return false;
    }
}
async function callCommanderNonLands(cid,sets) {
    let setString = sets? ` (${sets.join(' or ')})` : ''
    let queryUrl = `https://api.scryfall.com/cards/search?q=id<=${cid} f:commander${setString} -t:land`
    try {
        let json = await axios.get(encode(queryUrl) + `&order=${sortMethods[Math.floor(Math.random()*sortMethods.length)]}&dir=${dirs[Math.floor(Math.random()*3)]}`)
        return json.data.data;
    } catch(e) {
        return false;
    }
}
async function callCommanderLands(cid,sets) {
    let setString = sets? ` (${sets.join(' or ')})` : ''
    let queryUrl = `https://api.scryfall.com/cards/search?q=id<=${cid} t:land`
    try {
        let json = await axios.get(encode(queryUrl) + `&order=${sortMethods[Math.floor(Math.random()*sortMethods.length)]}&dir=${dirs[Math.floor(Math.random()*3)]}`)
        return json.data.data;
    } catch(e) {
        return false;
    }
}
async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}
function makeCuts (length,array) {
    if (array.length <= length) return;
    if (array.length >= length + 10) {
        let index = Math.floor(Math.random()*(array.length - length))
        array = array.slice(index,index + length);
        return
    }
    do {
        let i = Math.floor(Math.random()*array.length);
        array.slice(i,1);
    } while (array.length > length);
}
function addBasics(length,array) {
    if (array.length >= length) return;
    do {
        let i = Math.floor(Math.random()*array.length);
        array.push(array[i]);
    } while (array.length < length);
}
function reduceBasics(array) {
    let basics = array.filter(x=>["Plains","Island","Swamp","Mountain","Forest"].includes(x.name))
    let includedNames = [];
    let returnBasics = [];
    basics.map(x=>{
        if (!includedNames.includes(x.name)) {
            returnBasics.push({...x,count:1});
            includedNames.push(x.name)
        }
        else returnBasics.map(y=>{
            if (y.name == x.name) x.count ++;
        })
    })
    return array.filter(x=>!["Plains","Island","Swamp","Mountain","Forest"].includes(x.name)).concat(returnBasics)
}
function simplify(cards) {
    if (Array.isArray(cards)) {
        let simple = [];
        for (let card of cards) simple.push({id: card.id,name: card.name})
        return simple;
    }
    return {id: cards.id,name: cards.name};
}
fs.appendFileSync('./indexes/indexLog.txt',Date.now().toString())
//keep this interval and code for future set releases (can comment them out)
//let indexInterval = setInterval(indexSet,250);
async function indexSet() {
    if (toIndex.length < 1) return //clearInterval(indexInterval);
    let set = toIndex[Math.floor(Math.random()*toIndex.length)];
    let cards = []
    let more = true;
    let page = 1;
    do {
        let url = `https://api.scryfall.com/cards/search?q=set:${set}`
        try {
            let data = await axios.get(`${encodeUrl(url)}&page=${page}`);
            let cardData = data.data.data; //lol, almost changed the "data" variable name but this was funny
            for (let card of cardData) {
                let type;
                if (card.type_line) type = card.type_line.toLowerCase();
                else {
                    if (card.layout && card.layout == 'reversible_card') {
                        type = card.card_faces[0].type_line + " / " + card.card_faces[1].type_line
                    }
                    continue;
                }
                let commander = (type.includes("legendary") && type.includes("creature")) || (card.oracle_text && card.oracle_text.includes("can be your commander"));
                let legalities = [];
                for (let format in card.legalities) if (card.legalities[format] == "legal") legalities.push(format);
                cards.push({name: card.name, id: card.id, ci: card.color_identity || card.colors, commander,legalities});
            }
            page ++;
            more = JSON.parse(data.data.has_more)
        } catch (e) {
            console.log(e)
        }
        delay(15)
    } while (more)
    fs.writeFile(`./indexes/${set}.json`,JSON.stringify(cards),()=>{
        console.log("indexed " + set)
        setIndex[set] = cards;
        indexed.push(set);
        toIndex.splice(toIndex.indexOf(set),1)
    })
    fs.appendFileSync('./indexes/indexLog.txt',`\n${set}`)   
}
function loadIndex() {
    for (let set of indexed) {
        if (!toIndex.includes(set)) setIndex[set] = JSON.parse(fs.readFileSync(`./indexes/${set}.json`).toString())
    }
}
