import axios from 'axios';
import encodeUrl from 'encodeurl';
import encode from 'encodeurl';
import fs from 'node:fs'
const allPaperSets = ["LEA","LEB","2ED","3ED","4ED","5ED","6ED","7ED","8ED","9ED","10E","M10","M11","M12","M13","M14","M15","ORI","M19","M20","M21","ARN","ATQ","LEG","DRK","FEM","ICE","HML","ALL","MIR","VIS","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG","MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP","TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON","ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR","RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ","OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM","GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR","MID","VOW","NEO","SNC","DMU","BRO","ONE","MOM","MH1","MH2","POR","P02","P3K","S99","S00","GS1","CHR","ATH","BRB","BTD","DKM","DPA","MD1","MB1","TSR","DMR","EVG","DD2","DDC","DDD","DDE","DDF","DDG","DDH","DDI","DDJ","DDK","DDL","DDM","DDN","DDO","DDP","DDQ","DDR","DDS","DDT","DDU","DRB","V09","V10","V11","V12","V13","V14","V15","V16","V17","SS1","SS2","SS3","H09","PD2","PD3","MMA","MM2","EMA","MM3","IMA","A25","UMA","2XM","2X2","ORI","w16","w17","EXP","MPS","MP2","MED","STA","BRR","MUL","JMP","J22","SLD","SLX","BOT","HOP","PC2","PCA","ARC","E01","CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18","C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC","NCC","CLB","40K","BRC","CNS","CN2","E02","BBD","CED","UGL","UNH","UST","UND","UNF"];
const validCommanderSets = ["10E","M13","M15","ORI","M19","M20","M21","LEG","ICE","HML","ALL","MIR","WTH","TMP","STH","EXO","USG","ULG","UDS","MMQ","NEM","PCY","INV","PLS","APC","ODY","TOR","JUD","ONS","LGN","SCG","MRD","DST","5DN","CHK","BOK","SOK","RAV","GPT","DIS","CSP","TSP","TSB","PLC","FUT","LRW","MOR","SHM","EVE","ALA","CON","ARB","ZEN","WWK","ROE","SOM","MBS","NPH","ISD","DKA","AVR","RTR","GTC","DGM","THS","BNG","JOU","KTK","FRF","DTK","BFZ","OGW","SOI","EMN","KLD","AER","AKH","HOU","XLN","RIX","DOM","GRN","RNA","WAR","ELD","THB","IKO","ZNR","KHM","STX","AFR","MID","VOW","NEO","SNC","DMU","BRO","ONE","MOM","MH1","MH2","P3K","CHR","ATH","DPA","MD1","MB1","TSR","DMR","EVG","DDC","DDE","DDL","DDN","DDQ","DDS","DDT","DDU","DRB","V10","V11","V13","V14","V15","V16","V17","H09","PD2","PD3","MMA","MM2","EMA","MM3","IMA","A25","UMA","2XM","2X2","ORI","MP2","BRR","JMP","J22","SLD","SLX","BOT","HOP","PC2","PCA","ARC","E01","CMD","CM1","C13","C14","C15","C16","CMA","C17","CM2","C18","C19","C20","ZNC","CMR","KHC","C21","AFC","MIC","VOC","NEC","NCC","CLB","40K","BRC","CNS","CN2","BBD","UGL","UNH","UST","UND","UNF"]
const sortMethods = ["name","rarity","color","usd","tix","eur","cmc","power","toughness","edhrec","penny","artist","review"];
const dirs = ["auto","asc","desc"];
const indexed = ["2XM","NEM","XLN","WWK","AER","HML","DTK","V11","BRO","P3K","C15","2X2","JOU","ZNC",
"DGM","CMD","DDS","MH1","RNA","DRB","DPA","M15","SHM","SHM","ALA","ARC","CNS","MH2","EVG","H09","PCA",
"ODY","GPT","BNG","SOI","EXO","BFZ","ARB","IMA","TOR","STH","EVE","CMA","DIS","NPH","M13","DDL","C20",
"BOT","TMP","AFC","UDS","40K","ATH","ZNR","CSP","C17","DST","USG","C16","APC","THS","KHC","CHR","IKO",
"V15","UNH","KHM","UMA","LEG","V13","C18","FUT","NCC","ONE","RIX","CON","V10","WTH","V16","STX","PC2",
"ORI","DDT","MMQ","INV","J22","GRN","A25","JMP","CN2","10E","AFR","ORI","ICE","FRF","C14","BRC","PLS",
"SLD","AKH","RAV","RTR","SOM","V14","SNC","GTC","PCY","DDE","MB1","SLX","NEC","VOW","DKA","SOK","ROE",
"DDC","HOP","M19","CHK","5DN","JUD","EMN","EMA","TSR","BOK","HOU","LGN","MD1","TSR","TSP","NEO","MOR",
"MMA","DDN","KLD","ELD","PD2","PLC","M21","CM2","TSB","WAR","MM3","ULG","ONS","DOM","MP2","PD3","C13",
"AVR","DMR","C21","ZEN","MM2","DDU","BRR","MM2","MRD","ALL","ISD","MRD","E01","THB","V17","DMU","M20",
"CM1","C19","OGW","LRW","OGW","KTK","SCG","MBS","MID","MIR","UND","BBD","UGL","VOC","UST","DDQ","CMR",
"UNF","MIC","CLB","2ED","3ED","4ED","5ED","6ED","7ED","8ED","9ED","ARN","ATQ","BRB","BTD","DD2","DDD",
"DDF","DDG","DDH","DDI","DDJ","DDK","DDM","DDO","DDP","DDR","DKM","DRK","E02","EXP","FEM","GS1","LEA",
"LEB","M10","M11","M12","M14","MED","MPS","MUL","P02","POR","S00","S99","SS1","SS2","SS3","STA","V09",
"V12","VIS","w16","w17","CED"];
const toIndex = allPaperSets.filter(x=> !indexed.includes(x) && x != "MOM");
const setIndex = {}
//loadIndex()
export const Commander = async function({colors="wubrg",illegal=false,sets,random=true}) {
    let validSets = (sets && Array.isArray(sets) && sets.length) ? sets : [...validCommanderSets];
    let set = validSets[Math.floor(Math.random()*validSets.length)];
    let commanderData;
    do {
        let data = await getCommander(colors,set);
        if (data) {
            commanderData = data[Math.floor(Math.random()*data.length)]
            console.log(commanderData.colors)
            let cid = commanderData.colors.join('');
            let commander = simplify(commanderData);
            let cards;
            if (random) {
                let cardsData = await getCommanderCards(cid,sets);
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
                let cardsData = await getCommanderNonLands(cid,sets || allPaperSets);
                let landsData = await getCommanderLands(cid,sets || allPaperSets);
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
export const Standard = async function({colors="wubrg",illegal=false,sets,random=true}) {}
export const Modern = async function({colors="wubrg",illegal=false,sets,random=true}) {}
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
async function getCommander (colors,set) {
    if (!validCommanderSets.includes(set)) return false;
    if (!setIndex[set]) return await callCommander(colors,set);
    let validCommanders = setIndex[set].filter(x=>x.commander);
    validCommanders.map(c=>{
        c.colors = c.ci
    })
    return validCommanders;
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
async function getCommanderCards(cid,sets) {
    if (sets.filter(x=>setIndex[x]).length < sets.length) return await callCommanderCards(cid,sets);
    let validCards = []
    for (let set of sets) validCards.push(...setIndex[set]);
    return validCards.filter(x=>colorIdentity(x,cid)).sort((a, b) => 0.5 - Math.random());
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
async function getCommanderNonLands(cid,sets) {
    if (sets.filter(x=>setIndex[x]).length < sets.length) return await callCommanderNonLands(cid,sets);
    let validCards = []
    for (let set of sets) validCards.push(...setIndex[set]);
    return validCards.filter(x=>colorIdentity(x,cid)&&!isLand(x)).sort((a, b) => 0.5 - Math.random());
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
async function getCommanderLands(cid,sets) {
    if (sets.filter(x=>setIndex[x]).length < sets.length) return await callCommanderLands(cid,sets);
    let validCards = []
    for (let set of sets) validCards.push(...setIndex[set]);
    return validCards.filter(x=>colorIdentity(x,cid)&&isLand(x)).sort((a, b) => 0.5 - Math.random());
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
function colorIdentity(card,cid) {
    let colors = cid.toUpperCase().split('')
    for (let color of card.ci) if (!colors.includes(color)) return false;
    return true;
}
function isLand(card) {
    let type = card.type_line;
    return (type.toUpperCase().includes("LAND"))
}
fs.appendFileSync('./indexes/indexLog.txt',`\n${Date.now().toString()}`)
//keep this interval and code for future set releases (can comment them out)
/*let indexInterval = setInterval(indexSet,250);
async function indexSet() {
    if (toIndex.length < 1) return clearInterval(indexInterval);
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
                cards.push({name: card.name, id: card.id, type: card.type_line, ci: card.color_identity || card.colors, commander,legalities});
            }
            page ++;
            more = JSON.parse(data.data.has_more)
        } catch (e) {
            console.log(set + " returned an error")
        }
        delay(15)
    } while (more)
    let filename = (set == "CON") ? "CON-set" : set;
    fs.writeFile(`./indexes/${filename}.json`,JSON.stringify(cards),()=>{
        console.log("indexed " + set)
        setIndex[set] = cards;
        indexed.push(set);
        toIndex.splice(toIndex.indexOf(set),1)
    })
    fs.appendFileSync('./indexes/indexLog.txt',`\n${set}`)   
}*/
function loadIndex() {
    for (let set of indexed) {
        if (!toIndex.includes(set) && set != "CON") setIndex[set] = JSON.parse(fs.readFileSync(`./indexes/${set}.json`).toString())
    }
    setIndex.CON = JSON.parse(fs.readFileSync(`./indexes/CON-set.json`).toString())
}
