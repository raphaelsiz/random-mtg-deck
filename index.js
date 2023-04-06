import axios from 'axios';
import encode from 'encodeurl';
import fs from 'node:fs'
const allSets = ["10E","M13","M15","ORI","M19","M20","M21","LEG","ICE","HML","ALL","MIR","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG",
"MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP",
"TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON",
"ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR",
"RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ",
"OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM",
"GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR",
"MID","VOW","NEO","SNC","DMU","BRO","ONE","MOM","MH1","MH2",
"P3K","CHR","ATH","DPA","MD1","MB1","TSR","DMR","EVG","DDC",
"DDE","DDL","DDN","DDQ","DDS","DDT","DDU","DRB","V10","V11",
"V13","V14","V15","V16","V17","H09","PD2","PD3","MMA","MM2",
"EMA","MM3","IMA","A25","UMA","2XM","2X2","ORI","MP2","BRR",
"JMP","J22","SLD","SLX","BOT","HOP","PC2","PCA","ARC","E01",
"CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18",
"C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC",
"NCC","CLB","40K","BRC","CNS","CN2","BBD","UGL","UNH","UST",
"UND","UNF"]
const sortMethods = ["name","rarity","color","usd","tix","eur","cmc","power","toughness","edhrec","penny","artist","review"];
const dirs = ["auto","asc","desc"];


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