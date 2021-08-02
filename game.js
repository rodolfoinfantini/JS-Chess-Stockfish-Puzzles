const board = document.querySelector('.board')
const invertBTN = document.querySelector('.invertboard')
var showbestmove = false
var moveNumber = 0
var fullMoveCounter = 1
var halfMoveCounter = 0
var positions = []
var previousPositions = []
var possibleMoves = []
var enPassant = "-"
var attackedTiles = []
var positionHistory = []
var movesHistory = "position startpos moves "
var whiteMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
var blackMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
var stockfish = STOCKFISH()
// var analysis = STOCKFISH()
var isClicked = false
var clickedPiece
var selectedPiece
var canMove = false
var turn = "w"
var isai = true
var aixai = false
var puzzle = false
var delay = 0
var playercolor = "w"
var canselect = true
var canWOO = true
var canWOOO = true
var canBOO = true
var canBOOO = true
var inverted = false
var blackCaptures = []
var whiteCaptures = []
var isLoaded = false
var promoteTo = "q"
var isBestNone = false

//PUZZLE DATABASE
// var puzzlesDB = $.csv.toArrays(puzzlesCsv)
// var puzzlesArray = puzzlesDB
// var filteredPuzzlesArray = []

console.time('db')
let puzzlesDB = puzzlesCsv.split('\n')
for(let i = 0; i < puzzlesDB.length; i++) {
    puzzlesDB[i] = puzzlesDB[i].split(',')
}
let puzzlesArray = puzzlesDB
console.timeEnd('db')
let filteredPuzzlesArray = []
console.log(puzzlesArray)


//ANCHOR PUZZLE API
/*
var puzzleCorretMoves = []
var puzzleMoveControl = 0
var url = "https://api.chess.com/pub/puzzle/random"
var request = new XMLHttpRequest()*/
var puzzlePromoteTo = "q"
var puzzlePromoteToIndex = null
function selectpuzzle(){
    if(canselect){
        isai = false
        aixai = false
        puzzle = true
        puzzlePromoteToIndex = null
        puzzlePromoteTo = "q"
        document.querySelector(".gamemode .current").innerHTML = "Current: Puzzle"
        document.querySelector(".gamemode .playerselect").classList.remove("selected")
        document.querySelector(".gamemode .stockfishselect").classList.remove("selected")
        document.querySelector(".gamemode .stockfishxselect").classList.remove("selected")
        document.querySelector(".gamemode .puzzleselect").classList.add("selected")
        closecheck()
        generateNewPuzzle()
    }
}

function generateNewPuzzle(){
    /* request.open('GET', url, true)
    request.send()
    request.onload = function() {
        if (request.readyState == 4 && request.status == 200){
            var response = JSON.parse(request.responseText)
            positions = fenToArray(response.fen)
            isLoaded = true
            var string = generateFENString()
            stockfish.postMessage(`position fen ${string}`)
            stockfish.postMessage("go depth 10")
            playercolor = turn
            if(playercolor == "w"){
                inverted = false
                board.classList.remove('inverted')
            }else if(playercolor == "b"){
                inverted = true
                board.classList.add('inverted')
            }
            puzzleMoveControl = 0
            document.querySelector("a.ppuzzle").innerText = `"${response.title}" - Chess.com puzzle LINK`
            document.querySelector("a.ppuzzle").href = response.url
            renderPieces()
            canMove = true
            console.log(response)
        }else{
            window.alert("Erro de API!")
        }
    } */
    var randomIndex = Math.floor(Math.random() * puzzlesArray.length)
    positions = fenToArray(puzzlesArray[randomIndex][1])
    puzzleCorretMoves = puzzlesArray[randomIndex][2].split(" ")
    console.log(puzzleCorretMoves)
    puzzlePromoteToIndex = null
    puzzlePromoteTo = "q"
    for(let i = 0; i < puzzleCorretMoves.length; i++){
        if(puzzleCorretMoves[i].length == 5){
            puzzlePromoteToIndex = i
            puzzlePromoteTo == puzzleCorretMoves[i].split("")[4]
        }
        puzzleCorretMoves[i] = stringToTile(puzzleCorretMoves[i])
    }
    if(turn == "w"){
        playercolor = "b"
        inverted = true
        board.classList.add('inverted')
        document.querySelector(".game").classList.add('inverted')
    }else if(turn == "b"){
        playercolor = "w"
        inverted = false
        board.classList.remove('inverted')
        document.querySelector(".game").classList.remove('inverted')
    }
    isLoaded = true
    puzzleMoveControl = 0
    renderPieces()
    blackCaptures = []
    whiteCaptures = []
    renderCaptures()
    canMove = true
    console.log(puzzlesArray[randomIndex])
    document.querySelector("a.ppuzzle").innerText = puzzlesArray[randomIndex][8]
    document.querySelector("a.ppuzzle").href = puzzlesArray[randomIndex][8]
    document.querySelector("p.ppuzzletheme").innerHTML = `<b>Themes:</b> <u>${puzzlesArray[randomIndex][7]}</u><br><b>Rating:</b> <u>${puzzlesArray[randomIndex][3]}<u>`
    var firstMove = puzzleCorretMoves[0]
    move(firstMove.split("")[0] + firstMove.split("")[1], firstMove.split("")[2] + firstMove.split("")[3])
    puzzleMoveControl++
}

//PUZZLE FILTER
var puzzleFilter = "none"
var ratingFilter = "none"
function changeFilter(){
    puzzleFilter = document.querySelector("select.filter").value
    ratingFilter = document.querySelector("select.ratingfilter").value
    console.log(puzzleFilter, ratingFilter)
    filteredPuzzlesArray = []
    puzzlesArray = puzzlesDB
    if(puzzleFilter === "none" && ratingFilter === "none") return
    var ratingFrom = parseInt(ratingFilter.split("-")[0])
    var ratingTo = parseInt(ratingFilter.split("-")[1])
    for(let i = 0; i < puzzlesArray.length; i++){
        if(ratingFilter === "none"){
            if(String(puzzlesArray[i][7]).includes(puzzleFilter)){
                filteredPuzzlesArray.push(puzzlesArray[i])
            }
        }else if(puzzleFilter === "none"){
            if(parseInt(puzzlesArray[i][3]) > ratingFrom && parseInt(puzzlesArray[i][3]) < ratingTo){
                filteredPuzzlesArray.push(puzzlesArray[i])
            }
        }else{
            if(String(puzzlesArray[i][7]).includes(puzzleFilter) && parseInt(puzzlesArray[i][3]) > ratingFrom && parseInt(puzzlesArray[i][3]) < ratingTo){
                filteredPuzzlesArray.push(puzzlesArray[i])
            }
        }
    }
    puzzlesArray = filteredPuzzlesArray
    console.log(puzzlesArray.length)
}

//HTML ELEMENTS
const divScore = document.querySelector(".score")
const lvlinput = document.querySelector(".lvlinput")
const lvlp = document.querySelector(".pslider")
const playdiv = document.querySelector(".play")
const checkmatediv = document.querySelector(".checkmate")

const bpdiv = document.querySelector(".materialblack .pawn")
const brdiv = document.querySelector(".materialblack .rook")
const bndiv = document.querySelector(".materialblack .knight")
const bbdiv = document.querySelector(".materialblack .bishop")
const bqdiv = document.querySelector(".materialblack .queen")

const wpdiv = document.querySelector(".materialwhite .pawn")
const wrdiv = document.querySelector(".materialwhite .rook")
const wndiv = document.querySelector(".materialwhite .knight")
const wbdiv = document.querySelector(".materialwhite .bishop")
const wqdiv = document.querySelector(".materialwhite .queen")

const selectPromote = document.querySelector("select.promote")

const fenInput = document.querySelector(".play .loadgame .load .feninput")

//AUDIO VARIABLES
const startSound = new Audio('sounds/start.mp3')
const moveSound = new Audio('sounds/move.mp3')
const captureSound = new Audio('sounds/capture.mp3')
const checkSound = new Audio('sounds/check.mp3')
const castleSound = new Audio('sounds/castle.mp3')
const overSound = new Audio('sounds/gameover.mp3')
const stalemateSound = new Audio('sounds/stalemate.mp3')
const checkmateSound = new Audio('sounds/checkmate.mp3')

function playSound(type){
    if(type == "start"){
        startSound.play()
    }else if(type == "move"){
        moveSound.play()
    }else if(type == "capture"){
        captureSound.play()
    }else if(type == "check"){
        checkSound.play()
    }else if(type == "over"){
        overSound.play()
    }else if(type == "stalemate"){
        stalemateSound.play()
    }else if(type == "checkmate"){
        checkmateSound.play()
    }else if(type == "castle"){
        castleSound.play()
    }
    return
}


var playerdepth = 2
var depth = 1
var movetime = 1000

var cursorX
var cursorY

function selectPromotion(){
    promoteTo = selectPromote.value.split("")[0] == "k" ? "n" : selectPromote.value.split("")[0]
    console.log(promoteTo)
}

function loadGame(){
    var newPos = fenToArray(fenInput.value)
    if(newPos != "invalid"){
        positions = newPos
        isLoaded = true
        canselect = true
        movesHistory = `position fen ${fenInput.value} moves `
        renderPieces()
    }
}

function fenToArray(fen){
    fen = String(fen)
    fenArray = fen.split(" ")
    fenPosition = fenArray[0]
    fenPositionArray = fenPosition.split("/")

    if(fenPositionArray.length != 8) return "invalid"

    turn = fenArray[1]
    canWOO = false
    canWOOO = false
    canBOO = false
    canBOOO = false
    if(fenArray[2] == "-"){

    }else if(fenArray[2].includes("K")){
        canWOO = true
    }else if(fenArray[2].includes("Q")){
        canWOOO = true
    }else if(fenArray[2].includes("k")){
        canBOO = true
    }else if(fenArray[2].includes("q")){
        canBOOO = true
    }

    enPassant = fenArray[3]

    halfMoveCounter = fenArray[4] == undefined ? 0 : parseInt(fenArray[4])
    fullMoveCounter = fenArray[5] == undefined ? 1 : parseInt(fenArray[5])

    var array = [[" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "],
                [" "," "," "," "," "," "," "," "]]
    
    var row = 0
    var column = 0
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < fenPositionArray[i].length; j++){
            var isNumber = false
            if(!isNaN(fenPositionArray[i][j])) {
                isNumber = true
                for(let k = 0; k < parseInt(fenPositionArray[i][j]); k++){
                    array[row][column] = " "
                    column++
                }
            }
            else if(fenPositionArray[i][j] == "P"){
                array[row][column] = "wp"
            }else if(fenPositionArray[i][j] == "R"){
                array[row][column] = "wr"
            }else if(fenPositionArray[i][j] == "N"){
                array[row][column] = "wn"
            }else if(fenPositionArray[i][j] == "B"){
                array[row][column] = "wb"
            }else if(fenPositionArray[i][j] == "Q"){
                array[row][column] = "wq"
            }else if(fenPositionArray[i][j] == "K"){
                array[row][column] = "wk"
            }
            else if(fenPositionArray[i][j] == "p"){
                array[row][column] = "bp"
            }else if(fenPositionArray[i][j] == "r"){
                array[row][column] = "br"
            }else if(fenPositionArray[i][j] == "n"){
                array[row][column] = "bn"
            }else if(fenPositionArray[i][j] == "b"){
                array[row][column] = "bb"
            }else if(fenPositionArray[i][j] == "q"){
                array[row][column] = "bq"
            }else if(fenPositionArray[i][j] == "k"){
                array[row][column] = "bk"
            }

            if(!isNumber){
                column++
            }
        }
        row++
        column = 0
    }
    return array
}

lvlinput.addEventListener('input',function(){
    movetime = lvlinput.value
    lvlp.innerText = movetime / 1000
})

function selectplayer(){
    if(canselect){
        isai = false
        aixai = false
        puzzle = false
        document.querySelector(".gamemode .current").innerHTML = "Current: Player Vs. Player"
        document.querySelector(".gamemode .playerselect").classList.add("selected")
        document.querySelector(".gamemode .stockfishselect").classList.remove("selected")
        document.querySelector(".gamemode .stockfishxselect").classList.remove("selected")
        document.querySelector(".gamemode .puzzleselect").classList.remove("selected")
    }
}

function selectai(){
    if(canselect){
        isai = true
        aixai = false
        puzzle = false
        document.querySelector(".gamemode .current").innerHTML = "Current: Player Vs. Stockfish"
        document.querySelector(".gamemode .stockfishselect").classList.add("selected")
        document.querySelector(".gamemode .playerselect").classList.remove("selected")
        document.querySelector(".gamemode .stockfishxselect").classList.remove("selected")
        document.querySelector(".gamemode .puzzleselect").classList.remove("selected")
    }
}

function selectstockfish(){
    if(canselect){
        isai = true
        aixai = true
        puzzle = false
        document.querySelector(".gamemode .current").innerHTML = "Current: Stockfish Vs. Stockfish"
        document.querySelector(".gamemode .stockfishselect").classList.remove("selected")
        document.querySelector(".gamemode .playerselect").classList.remove("selected")
        document.querySelector(".gamemode .stockfishxselect").classList.add("selected")
        document.querySelector(".gamemode .puzzleselect").classList.remove("selected")
    }
}

generateInitialPosition()

// NOTE STOCKFISH
stockfish.onmessage = function(event) {
    console.log(event)
    if(event.split(" ")[0] == "info"){
        if(event.split(" ")[7] == "score"){
            if(event.split(" ")[8] == "cp"){
                var score = parseFloat(event.split(" ")[9]) / 100
                if(turn == "b"){
                    score = -score
                }
                divScore.innerText = `White score ${score}`
            }else if(event.split(" ")[8] == "mate"){
                divScore.innerText = "White score M" + event.split(" ")[9].replace("-","")
            }
        }
    }
    var bestmove
    if(showbestmove && turn == playercolor){
        if(event.split(" ")[0] == "bestmove"){
            console.log(event.split(" ")[1] + " depth " + playerdepth)
        }
    }
    /*
    if(puzzle){
        var eventArray = event.split(" ")
        if(eventArray[0] == "info" && eventArray[1] == "depth" && eventArray[2] == "10"){
            puzzleCorretMoves = []
            for(let i = 17; i < eventArray.length; i++){
                if(eventArray[i] == "bmc"){
                    break
                } else{
                    puzzleCorretMoves.push(eventArray[i])
                }
            }
            console.log(puzzleCorretMoves)
        }
    }*/
    //if(turn != playercolor && isai && !aixai)
    if(!aixai){
        if(event.split(" ")[0] == "bestmove"){
            if(canMove){
                if(event.split(" ")[1] == "(none)"){
                    checkmatediv.style.background = ""
                    document.querySelector('.checkmate p').innerText = "Draw by Stalemate"
                    playSound("stalemate")
                    checkmatediv.style.display = "flex"
                    canMove = false
                    return
                }
                if(playercolor != turn && isai){
                    bestmove = event.split(" ")[1]
                    tilebestmove = stringToTile(bestmove)
                    var bestmoveFrom = String(stringToTile(bestmove).split("")[0]) + String(stringToTile(bestmove).split("")[1])
                    var bestmoveTo = String(stringToTile(bestmove).split("")[2]) + String(stringToTile(bestmove).split("")[3])
                    if(bestmove.split("").length == 5){
                        promoteTo = bestmove.split("")[4]
                    }
                    move(bestmoveFrom,bestmoveTo)
                }
            }
        }
    }else if(aixai){
        if(event.split(" ")[0] == "bestmove"){
            if(canMove){
                if(event.split(" ")[1] == "(none)"){
                    checkmatediv.style.background = ""
                    document.querySelector('.checkmate p').innerText = "Draw by Stalemate"
                    playSound("stalemate")
                    checkmatediv.style.display = "flex"
                    canMove = false
                    return
                }
                bestmove = event.split(" ")[1]
                tilebestmove = stringToTile(bestmove)
                var bestmoveFrom = String(stringToTile(bestmove).split("")[0]) + String(stringToTile(bestmove).split("")[1])
                var bestmoveTo = String(stringToTile(bestmove).split("")[2]) + String(stringToTile(bestmove).split("")[3])
                if(bestmove.split("").length == 5){
                    promoteTo = bestmove.split("")[4]
                }
                move(bestmoveFrom,bestmoveTo)
            }
        }
    }

    /* if(event.split(" ")[0] == "Legal"){
        checkmatediv.style.background = "rgb(51,51,51)"
        if(event.split(" ")[3] == null || event.split(" ")[3] == undefined || event.split(" ")[3] == ""){
            canMove = false
            generateAttackedTiles("b")
            if(isCheck("w")){
                document.querySelector('.checkmate p').innerText = "Black won by Checkmate!"
                checkmatediv.style.background = "rgb(160,70,70)"
                
            }else{
                generateAttackedTiles("w")
                if(isCheck("b")){
                    document.querySelector('.checkmate p').innerText = "White won by Checkmate!"
                    checkmatediv.style.background = "rgb(160,70,70)"
                }
                else{
                    document.querySelector('.checkmate p').innerText = "Draw by Stalemate"
                }
            }
            checkmatediv.style.display = "flex"
        }
    } */
    if(event.split(" ")[0] == "info"){
        if(event.split(" ")[4] == "mate"){
            if(event.split(" ")[5] == "0"){
                checkmatediv.style.background = "rgb(51,51,51)"
                canMove = false
                generateAttackedTiles("b")
                if(isCheck("w")){
                    document.querySelector('.checkmate p').innerText = "Black won by Checkmate!"
                    divScore.innerText = "White score 0-1"
                    checkmatediv.style.background = "rgb(160,70,70)"
                    playSound("checkmate")
                }else{
                    generateAttackedTiles("w")
                    if(isCheck("b")){
                        document.querySelector('.checkmate p').innerText = "White won by Checkmate!"
                        divScore.innerText = "White score 1-0"
                        checkmatediv.style.background = "rgb(160,70,70)"
                        playSound("checkmate")
                    }
                    else{
                        document.querySelector('.checkmate p').innerText = "Draw by Stalemate"
                        playSound("stalemate")
                    }
                }
            checkmatediv.style.display = "flex"
            }
        }
    }
}

function generateInitialPosition(){
    stockfish.postMessage("ucinewgame")
    stockfish.postMessage("position startpos")
    movesHistory = "position startpos moves "
    /* analysis.postMessage("ucinewgame")
    analysis.postMessage("position startpos")
    analysis.postMessage("go infinite") */
    positions = 
    [["br","bn","bb","bq","bk","bb","bn","br"],
    ["bp","bp","bp","bp","bp","bp","bp","bp"],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    ["wp","wp","wp","wp","wp","wp","wp","wp"],
    ["wr","wn","wb","wq","wk","wb","wn","wr"]]
    previousPositions = 
    [[" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "]]
    setPrevious()
    possibleMoves = []
    attackedTiles = []
    blackPieces = []
    whitePieces = []
    blackCaptures = []
    whiteCaptures = []
    positionHistory = []
    whiteMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
    blackMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
    fullMoveCounter = 1
    halfMoveCounter = 0
    isClicked = false
    canMove = false
    canselect = true
    turn = "w"
    canWOO = true
    canWOOO = true
    canBOO = true
    canBOOO = true
    isLoaded = false
    checkmatediv.style = ""
    divScore.innerText = "White score 0"
    renderCaptures()
    renderPieces()
}

function play(){
    playSound("start")
    closecheck()
    if(!isLoaded){
        document.querySelector("a.ppuzzle").innerText = ""
        document.querySelector("a.ppuzzle").href = ""
        generateInitialPosition()
    }else{
        isLoaded = false
        stockfish.postMessage("ucinewgame")
        stockfish.postMessage(`position fen ${generateFENString()}`)
        setPrevious()
        possibleMoves = []
        attackedTiles = []
        blackPieces = []
        whitePieces = []
        blackCaptures = []
        whiteCaptures = []
        positionHistory = []
        whiteMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
        blackMaterialCounter = {pawn:8,rook:2,knight:2,bishop:2,queen:1}
        isClicked = false
        checkmatediv.style = ""
        renderCaptures()
        renderPieces()
    }
    canMove = true
    canselect = false
    if(aixai){
        aiMove()
        return
    }
    if(playercolor == "b"){
        aiMove()
        return
    }
    stockfish.postMessage(`go depth ${playerdepth}`)
}

function closecheck(){
    checkmatediv.style.display = "none"
    document.querySelector(".info.puzzle").style.display = "none"
    canselect = true
}

function selectwhite(){
    if(canselect){
        playercolor = "w"
        document.querySelector(".startgame .current").innerText = "Current: " + playercolor + "hite"
        document.querySelector(".startgame .whiteselect").classList.add("selected")
        document.querySelector(".startgame .blackselect").classList.remove("selected")
        inverted = false
        board.classList.remove('inverted')
        document.querySelector(".game").classList.remove('inverted')
    } 
}

function selectblack(){
    if(canselect){
        playercolor = "b"
        document.querySelector(".startgame .current").innerText = "Current: " + playercolor + "lack"
        document.querySelector(".startgame .blackselect").classList.add("selected")
        document.querySelector(".startgame .whiteselect").classList.remove("selected")
        inverted = true
        board.classList.add('inverted')
        document.querySelector(".game").classList.add('inverted')
    } 
}

function generateFENString(){
    var string = ""
    var emptySpaces = 0
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            if(positions[i][j] == " "){
                emptySpaces++
            }else{
                if(emptySpaces != 0){
                    string += String(emptySpaces)
                    emptySpaces = 0
                }
                if(positions[i][j] == "br") string += "r"
                else if(positions[i][j] == "bn") string += "n"
                else if(positions[i][j] == "bb") string += "b"
                else if(positions[i][j] == "bq") string += "q"
                else if(positions[i][j] == "bk") string += "k"
                else if(positions[i][j] == "bp") string += "p"

                else if(positions[i][j] == "wr") string += "R"
                else if(positions[i][j] == "wn") string += "N"
                else if(positions[i][j] == "wb") string += "B"
                else if(positions[i][j] == "wq") string += "Q"
                else if(positions[i][j] == "wk") string += "K"
                else if(positions[i][j] == "wp") string += "P"
            }
        }
        if(emptySpaces != 0){
            string += String(emptySpaces)
            emptySpaces = 0
        }
        if(i < 7){
            string += "/"
        }
    }
    var enPassantString
    string += " "
    string += turn
    string += " "
    if(canWOO == false && canWOOO == false && canBOO == false && canBOOO == false){
        string += "-"
    }else{
        if(canWOO) string += "K"
        if(canWOOO) string += "Q"
        if(canBOO) string += "k"
        if(canBOOO) string += "q"
    }
    string += " "
    if(enPassant == "-"){
        string += enPassant
    }else{
        var enPassantTileToString = tileToString(enPassant, "11")
        enPassantString = String(enPassantTileToString).split("")[0] + String(enPassantTileToString).split("")[1]
        string += enPassantString
    }
    string += " "
    string += String(halfMoveCounter) + " "
    string += String(fullMoveCounter)
    console.log("fen: " + string)
    return string
}

function generatePositionFENString(){
    var string = ""
    var emptySpaces = 0
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            if(positions[i][j] == " "){
                emptySpaces++
            }else{
                if(emptySpaces != 0){
                    string += String(emptySpaces)
                    emptySpaces = 0
                }
                if(positions[i][j] == "br") string += "r"
                else if(positions[i][j] == "bn") string += "n"
                else if(positions[i][j] == "bb") string += "b"
                else if(positions[i][j] == "bq") string += "q"
                else if(positions[i][j] == "bk") string += "k"
                else if(positions[i][j] == "bp") string += "p"

                else if(positions[i][j] == "wr") string += "R"
                else if(positions[i][j] == "wn") string += "N"
                else if(positions[i][j] == "wb") string += "B"
                else if(positions[i][j] == "wq") string += "Q"
                else if(positions[i][j] == "wk") string += "K"
                else if(positions[i][j] == "wp") string += "P"
            }
        }
        if(emptySpaces != 0){
            string += String(emptySpaces)
            emptySpaces = 0
        }
        if(i < 7){
            string += "/"
        }
    }
    return string
}

function setPrevious(){
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            previousPositions[i][j] = positions[i][j]
        }
    }
}

function setPositions(){
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            positions[i][j] = previousPositions[i][j]
        }
    }
}

function renderPieces(){
    board.innerHTML = `<div class="moves"></div>`
    for(let i = 0; i < positions.length; i++){
        for(let j = 0; j < positions[i].length; j++){
            if(positions[i][j] != " "){
                board.innerHTML += `<div class="piece ${positions[i][j]} square-${i}${j}"></div>`
            }
        }
    }
    board.innerHTML += `<div class="pointers"></div>`
}

function renderCaptures(){
    wpdiv.innerHTML = ""
    wrdiv.innerHTML = ""
    wndiv.innerHTML = ""
    wbdiv.innerHTML = ""
    wqdiv.innerHTML = ""

    bpdiv.innerHTML = ""
    brdiv.innerHTML = ""
    bndiv.innerHTML = ""
    bbdiv.innerHTML = ""
    bqdiv.innerHTML = ""
    for(let i = 0; i < whiteCaptures.length; i++){
        if(whiteCaptures[i] == "") break
        if(whiteCaptures[i] == "bp"){
            wpdiv.innerHTML += `<div class="m ${whiteCaptures[i]}"></div>`
        }else if(whiteCaptures[i] == "br"){
            wrdiv.innerHTML += `<div class="m ${whiteCaptures[i]}"></div>`
        }
        else if(whiteCaptures[i] == "bn"){
            wndiv.innerHTML += `<div class="m ${whiteCaptures[i]}"></div>`
        }
        else if(whiteCaptures[i] == "bb"){
            wbdiv.innerHTML += `<div class="m ${whiteCaptures[i]}"></div>`
        }else if(whiteCaptures[i] == "bq"){
            wqdiv.innerHTML += `<div class="m ${whiteCaptures[i]}"></div>`
        }
    }
    for(let i = 0; i < blackCaptures.length; i++){
        if(blackCaptures[i] == "") break
        if(blackCaptures[i] == "wp"){
            bpdiv.innerHTML += `<div class="m ${blackCaptures[i]}"></div>`
        }else if(blackCaptures[i] == "wr"){
            brdiv.innerHTML += `<div class="m ${blackCaptures[i]}"></div>`
        }
        else if(blackCaptures[i] == "wn"){
            bndiv.innerHTML += `<div class="m ${blackCaptures[i]}"></div>`
        }
        else if(blackCaptures[i] == "wb"){
            bbdiv.innerHTML += `<div class="m ${blackCaptures[i]}"></div>`
        }else if(blackCaptures[i] == "wq"){
            bqdiv.innerHTML += `<div class="m ${blackCaptures[i]}"></div>`
        }
    }
}

invertBTN.addEventListener('click',function(e){
    if(inverted){
        inverted = false
        board.classList.remove('inverted')
        document.querySelector(".game").classList.remove('inverted')
    }else{
        inverted = true
        board.classList.add('inverted')
        document.querySelector(".game").classList.add('inverted')
    }
})

board.addEventListener('mousedown', e =>{
    if(aixai) return
    if(!e.target.classList.contains('piece')) return
    if(!canMove) return
    
    if(selectedPiece != undefined && selectedPiece != null && e.target.classList[1].split("")[0] != selectedPiece.classList[1].split("")[0]){
        if(turn == playercolor) clickMove()
        selectedPiece = undefined
    }else{
        selectedPiece = e.target
        e.target.style += "z-index: 1000;"
        isClicked = true
        clickedPiece = e.target
        if(inverted){
            clickedPiece.style.transform = 'translateY('+(-(mouseY) + board.offsetHeight - clickedPiece.offsetHeight / 2)+'px)'
            clickedPiece.style.transform += 'translateX('+(-(mouseX) + board.offsetWidth - clickedPiece.offsetWidth / 2)+'px)'
        }else{
            clickedPiece.style.transform = 'translateY('+(mouseY - (clickedPiece.offsetHeight / 2))+'px)'
            clickedPiece.style.transform += 'translateX('+(mouseX - (clickedPiece.offsetWidth / 2))+'px)'  
        }
        e.target.style.cursor += 'grabbing'
        document.querySelector(".pointers").innerHTML = ""
        if(selectedPiece.classList[1].split("")[0] == turn){
            if(puzzle){
                if(turn == playercolor){
                    getMoves()
                }
            }
            else if(isai){
                if(turn == playercolor){
                    getMoves()
                }
            }else{
                getMoves()
            }
        }
            
        else
            selectedPiece = undefined
    }
})


board.addEventListener('mouseup', e =>{
    if(aixai) return
    if(!isClicked) return
    if(!e.target.classList.contains('piece')) return
    let bounds = board.getBoundingClientRect()
    let x = e.clientX - bounds.left
    let y = e.clientY - bounds.top
    isClicked = false
    clickedPiece.style = ""
    if(isai){
        if(turn == playercolor){
            move(e.target.classList[2].replace("square-",""),mouseToTile(x,y))
        }
    }else{
        move(e.target.classList[2].replace("square-",""),mouseToTile(x,y))
    }
    
})

document.addEventListener('mousemove',e =>{
    if(aixai) return
    let bounds = board.getBoundingClientRect()
    let x = e.clientX - bounds.left
    let y = e.clientY - bounds.top
    mouseX = x
    mouseY = y
    if(!isClicked) return
    if(x < 0 || x > board.offsetWidth || y < 0 || y > board.offsetHeight) return
    if(inverted){
        clickedPiece.style.transform = 'translateY('+(-(y) + board.offsetHeight - clickedPiece.offsetHeight / 2)+'px)'
        clickedPiece.style.transform += 'translateX('+(-(x) + board.offsetWidth - clickedPiece.offsetWidth / 2)+'px)'
    }else{
        clickedPiece.style.transform = 'translateY('+(y - (clickedPiece.offsetHeight / 2))+'px)'
        clickedPiece.style.transform += 'translateX('+(x - (clickedPiece.offsetWidth / 2))+'px)'
    }
})

function clickMove(){
    if(aixai || !canMove) return
    move(selectedPiece.classList[2].replace("square-",""),mouseToTile(mouseX,mouseY))
}

// NOTE MOVE
function move(from,to){
    //VARIABLES
    var posString = tileToString(from,to)
    setPrevious()
    clickedPiece = undefined
    if(from == to) return
    var fromX = from.split("")[0]
    var fromY = from.split("")[1]
    var toX = to.split("")[0]
    var toY = to.split("")[1]
    if(positions[fromX][fromY].split("")[0] != turn && !aixai && !puzzle) return
    if(isai && !aixai && !puzzle){
        if(!possibleMoves.includes(to) && turn == playercolor){
            renderPieces()
            return
        }
    }else if(!aixai && !puzzle){
        if(!possibleMoves.includes(to)){
            renderPieces()
            return
        }
    }
    //PUZZLE MOVES
    if(puzzle && turn == playercolor){
        if(String(from) + String(to) == puzzleCorretMoves[puzzleMoveControl]){
            if(puzzlePromoteToIndex != null){
                if(puzzleMoveControl == puzzlePromoteToIndex){
                    if(puzzlePromoteTo != promoteTo){
                        try{
                            clickedPiece.style = ""
                            selectedPiece.style = ""
                        }catch(e){

                        }
                        return
                    }
                }
            }
            puzzleMoveControl++
        }else{
            try{
                clickedPiece.style = ""
                selectedPiece.style = ""
            }catch(e){

            }
            return
        }
    }

    //CAPTURE
    var blackcaptured = false
    var whitecaptured = false
        if(positions[toX][toY] != " "){
            if(positions[fromX][fromY].split("")[0] == positions[toX][toY].split("")[0]) return
            else{
                captured = positions[toX][toY]
                if(positions[toX][toY].split("")[1] == "r"){
                    if(to == 77){
                        canWOO = false
                    }else if(to == 70){
                        canWOOO = false
                    }else if(to == 07){
                        canBOO = false
                    }else if(to == 00){
                        canBOOO = false
                    }
                }
                if(positions[toX][toY].split("")[0] == "w"){
                    blackCaptures.push(positions[toX][toY])
                    blackcaptured = true
                }else if(positions[toX][toY].split("")[0] == "b"){
                    whiteCaptures.push(positions[toX][toY])
                    whitecaptured = true
                }
                renderCaptures()
                positions[toX][toY] = " "
            }
        }
        
        //CASTLE
        var hadWOO = false
        var hadWOOO = false
        var hadBOO = false
        var hadBOOO = false
        if(canWOO){
            if(positions[fromX][fromY] == "wk"){
                if(to == "76"){
                    generateAttackedTiles("b")
                    if(attackedTiles.includes("74") || attackedTiles.includes("75") || attackedTiles.includes("76")) return
                    var temp = positions[7][7]
                    positions[7][7] = positions[7][5]
                    positions[7][5] = temp
                    hadWOO = true
                }
            }
        }
        if(canWOOO){
            if(positions[fromX][fromY] == "wk"){
                if(to == 72){
                    generateAttackedTiles("b")
                    if(attackedTiles.includes("74") || attackedTiles.includes("73") || attackedTiles.includes("72")) return
                    var temp = positions[7][0]
                    positions[7][0] = positions[7][3]
                    positions[7][3] = temp
                    hadWOOO = true
                }
            }
        }
        if(canBOO){
            if(positions[fromX][fromY] == "bk"){
                if(to == 06){
                    generateAttackedTiles("w")
                    if(attackedTiles.includes("04") || attackedTiles.includes("05") || attackedTiles.includes("06")) return
                    var temp = positions[0][7]
                    positions[0][7] = positions[0][5]
                    positions[0][5] = temp
                    hadBOO = true
                }
            }
        }
        if(canBOOO){
            if(positions[fromX][fromY] == "bk"){
                if(to == 02){
                    generateAttackedTiles("w")
                    if(attackedTiles.includes("04") || attackedTiles.includes("03") || attackedTiles.includes("02")) return
                    var temp = positions[0][0]
                    positions[0][0] = positions[0][3]
                    positions[0][3] = temp
                    hadBOOO = true
                }
            }
        }

        // EN PASSANT
        if(positions[fromX][fromY] == "wp"){
            if(fromX == 3 && to == enPassant){
                positions[3][parseInt(toY)] = " "
                whiteCaptures.push("bp")
                whitecaptured = true
                renderCaptures()
            }
        }else if(positions[fromX][fromY] == "bp"){
            if(fromX == 4 && to == enPassant){
                positions[4][parseInt(toY)] = " "
                blackCaptures.push("wp")
                blackcaptured = true
                renderCaptures()
            }
        }
        enPassant = "-"
        if(positions[fromX][fromY] == "wp"){
            if(fromX == 6 && toX == 4){
                enPassant = 5 + String(fromY)
            }else{
                enPassant = "-"
            }
        }else if(positions[fromX][fromY] == "bp"){
            if(fromX == 1 && toX == 3){
                enPassant = 2 + String(fromY)
            }else{
                enPassant = "-"
            }
        }



        //DISABLE CASTLE
        if(positions[fromX][fromY] == "wk"){
            canWOO = false
            canWOOO = false
        }else if(positions[fromX][fromY] == "bk"){
            canBOO = false
            canBOOO = false
        }
        if(positions[fromX][fromY] == "wr"){
            if(from == 70) canWOOO = false
            else if(from == 77) canWOO = false
        }else if(positions[fromX][fromY] == "br"){
            if(from == 00) canBOOO = false
            else if(from == 07) canBOO = false
        }
        
        
        //POSITION SWITCHING
        var temp = positions[fromX][fromY]
        positions[fromX][fromY] = positions[toX][toY]
        positions[toX][toY] = temp
        
        //PROMOTION
        for(let i = 0; i < 8; i++){
            if(positions[7][i] == "bp"){
                positions[7][i] = `b${promoteTo}`
            }
        }
        for(let i = 0; i < 8; i++){
            if(positions[0][i] == "wp"){
                positions[0][i] = `w${promoteTo}`
            }
        }
        promoteTo = selectPromote.value.split("")[0] == "k" ? "n" : selectPromote.value.split("")[0]
        
        

        //TURN CHANGE
        if(turn == "w"){
            if(!aixai){
                //CHECK IF MOVE IS LEGAL
                generateAttackedTiles("b")
                if(isCheck("w")){
                    setPositions()
                    renderPieces()
                    clickedPiece = undefined
                    selectedPiece = undefined
                    document.querySelector(".wk").classList.remove("check")
                    generateAttackedTiles("b")
                    if(isCheck("w")) document.querySelector(".wk").classList.add("check")
                    if(whitecaptured){
                        whiteCaptures[whiteCaptures.length - 1] = ""
                    }
                    renderCaptures()
                    if(hadWOO) canWOO = true
                    else if(hadWOOO) canWOOO = true
                    return
                }
            }
            turn = "b"
        } 
        else if(turn == "b"){
            if(!aixai){
                //CHECK IF MOVE IS LEGAL
                generateAttackedTiles("w")
                if(isCheck("b")){
                    setPositions()
                    renderPieces()
                    clickedPiece = undefined
                    selectedPiece = undefined
                    document.querySelector(".bk").classList.remove("check")
                    generateAttackedTiles("w")
                    if(isCheck("b")) document.querySelector(".bk").classList.add("check")
                    if(blackcaptured){
                        blackCaptures[blackCaptures.length - 1] = ""
                    }
                    renderCaptures()
                    if(hadBOO) canBOO = true
                    else if(hadBOOO) canBOOO = true
                    return
                }
            }
            turn = "w"
            fullMoveCounter++
        } 
        
        //VARIABLES CHANGING
        positionHistory.push(generatePositionFENString())
        moveNumber++
        halfMoveCounter++
        if(blackcaptured || whitecaptured || positions[to.split("")[0]][to.split("")[1]].split("")[1] == "p"){
            halfMoveCounter = 0
        }
        
        //RENDER
        renderPieces()

        // SET KING COLOR IF IN CHECK
        var isInCheck = false
        generateAttackedTiles("b")
            if(isCheck("w")){
                document.querySelector(".wk").classList.add("check")
                isInCheck = true
            }else{
                document.querySelector(".wk").classList.remove("check")
            }
            generateAttackedTiles("w")
            if(isCheck("b")){
                document.querySelector(".bk").classList.add("check")
                isInCheck = true
            }else{
                document.querySelector(".bk").classList.remove("check")
            }

        //LAST MOVE INDICATOR
        createLastMove(from.split("")[0],from.split("")[1])
        createLastMove(to.split("")[0],to.split("")[1])
        
        //RESETS
        clickedPiece = undefined
        selectedPiece = undefined
        countMaterials()

        //DRAW CHECK
        var draw = checkIfDraw()
        var isDraw = false
        if(draw != "false"){
            canMove = false
            document.querySelector('.checkmate p').innerText = `Draw by ${draw}`
            checkmatediv.style.display = "flex"
            isDraw = true
        }

        //PLAY SOUNDS
        if(whitecaptured || blackcaptured){
            playSound("capture")
        }else if(hadWOO || hadWOOO || hadBOO || hadBOOO){
            playSound("castle")
        }else if(isInCheck){
            playSound("check")
        }else if(isDraw){
            playSound("over")
        }else{
            playSound("move")
        }

        //AI
        /*
        var fenString
        fenString = generateFENString()
        stockfish.postMessage(`position fen ${fenString} moves ${tileToString(from,to)}`)*/
        movesHistory += `${tileToString(from,to)} `
        stockfish.postMessage(`${movesHistory}`)
        if(!puzzle){
            if(aixai && !puzzle){
                aiMove()
                return
            }
            else if(turn != playercolor && isai && !puzzle){
                aiMove()
                return
            } 
            else{
                stockfish.postMessage(`go depth ${playerdepth}`)
            }
        }
        
        
        //PUZZLE
        if(puzzle && turn != playercolor){
            if(puzzleMoveControl >= puzzleCorretMoves.length){
                document.querySelector(".info.puzzle").style.display = "flex"
                canmove = false
                return
            }
            
            movFrom = String(puzzleCorretMoves[puzzleMoveControl].split("")[0]) + String(puzzleCorretMoves[puzzleMoveControl].split("")[1])
            movTo = String(puzzleCorretMoves[puzzleMoveControl].split("")[2]) + String(puzzleCorretMoves[puzzleMoveControl].split("")[3])
            puzzleMoveControl++
            move(movFrom, movTo)
            if(puzzleMoveControl >= puzzleCorretMoves.length){
                document.querySelector(".info.puzzle").style.display = "flex"
                canmove = false
                return
            }
            return
        }
}

function checkIfDraw(){
    if(fullMoveCounter <= 3) return "false"
    if(halfMoveCounter >= 100) return "50 moves rule"
    for(let i = 0; i < positionHistory.length; i++){
        var current = positionHistory[i]
        for(let j = 0; j < positionHistory.length; j++){
            if(j != i){
                if(current == positionHistory[j]){
                    var current2 = positionHistory[j]
                    for(let k = 0; k < positionHistory.length; k++){
                        if(i != j && i != k && j != k){
                            if(current2 == positionHistory[k]) {
                                return "Repetition"
                            }
                        }
                    }
                }
            }
        }
    }
    if(whiteMaterialCounter.pawn == 0 && blackMaterialCounter.pawn == 0){
        if(whiteMaterialCounter.rook == 0 && whiteMaterialCounter.knight == 0 && whiteMaterialCounter.bishop == 0 && whiteMaterialCounter.queen == 0){
            if(blackMaterialCounter.rook == 0 && blackMaterialCounter.knight == 0 && blackMaterialCounter.bishop == 0 && blackMaterialCounter.queen == 0){
                return "Insufficient Material"
            }
        }
    }
    return "false"
}

function countMaterials(){
    whiteMaterialCounter = {pawn:0,rook:0,knight:0,bishop:0,queen:0}
    blackMaterialCounter = {pawn:0,rook:0,knight:0,bishop:0,queen:0}
    wpCount = 0
    wrCount = 0
    wnCount = 0
    wbCount = 0
    wqCount = 0
    bpCount = 0
    brCount = 0
    bnCount = 0
    bbCount = 0
    bqCount = 0
    for(let i = 0; i < positions.length; i++){
        for(let j = 0; j < positions[i].length; j++){
            if(positions[i] == " "){

            }else if(positions[i][j] == "wp"){
                wpCount++
            }else if(positions[i][j] == "wr"){
                wrCount++
            }else if(positions[i][j] == "wn"){
                wnCount++
            }else if(positions[i][j] == "wb"){
                wbCount++
            }else if(positions[i][j] == "wq"){
                wqCount++
            }else if(positions[i][j] == "bp"){
                bpCount++
            }else if(positions[i][j] == "br"){
                brCount++
            }else if(positions[i][j] == "bn"){
                bnCount++
            }else if(positions[i][j] == "bb"){
                bbCount++
            }else if(positions[i][j] == "bq"){
                bqCount++
            }
        }
    }
    whiteMaterialCounter = {pawn:wpCount,rook:wrCount,knight:wnCount,bishop:wbCount,queen:wqCount}
    blackMaterialCounter = {pawn:bpCount,rook:brCount,knight:bnCount,bishop:bbCount,queen:bqCount}
}

function isCheck(color){
    if(color == "w"){
        for(let i = 0; i < attackedTiles.length; i++){
            if(positions[attackedTiles[i].split("")[0]][attackedTiles[i].split("")[1]] == "wk")
            return true
        }
        return false
    }else if(color == "b"){
        for(let i = 0; i < attackedTiles.length; i++){
            if(positions[attackedTiles[i].split("")[0]][attackedTiles[i].split("")[1]] == "bk")
            return true
        }
        return false
    }
}

function tileToString(from, to){
    var fromString
    var toString
    var string

    if(from.split("")[1] == "0") fromString = "a"
    else if(from.split("")[1] == "1") fromString = "b"
    else if(from.split("")[1] == "2") fromString = "c"
    else if(from.split("")[1] == "3") fromString = "d"
    else if(from.split("")[1] == "4") fromString = "e"
    else if(from.split("")[1] == "5") fromString = "f"
    else if(from.split("")[1] == "6") fromString = "g"
    else if(from.split("")[1] == "7") fromString = "h"

    if(from.split("")[0] == "0") fromString += "8"
    else if(from.split("")[0] == "1") fromString += "7"
    else if(from.split("")[0] == "2") fromString += "6"
    else if(from.split("")[0] == "3") fromString += "5"
    else if(from.split("")[0] == "4") fromString += "4"
    else if(from.split("")[0] == "5") fromString += "3"
    else if(from.split("")[0] == "6") fromString += "2"
    else if(from.split("")[0] == "7") fromString += "1"

    if(to.split("")[1] == "0") toString = "a"
    else if(to.split("")[1] == "1") toString = "b"
    else if(to.split("")[1] == "2") toString = "c"
    else if(to.split("")[1] == "3") toString = "d"
    else if(to.split("")[1] == "4") toString = "e"
    else if(to.split("")[1] == "5") toString = "f"
    else if(to.split("")[1] == "6") toString = "g"
    else if(to.split("")[1] == "7") toString = "h"

    if(to.split("")[0] == "0") toString += "8"
    else if(to.split("")[0] == "1") toString += "7"
    else if(to.split("")[0] == "2") toString += "6"
    else if(to.split("")[0] == "3") toString += "5"
    else if(to.split("")[0] == "4") toString += "4"
    else if(to.split("")[0] == "5") toString += "3"
    else if(to.split("")[0] == "6") toString += "2"
    else if(to.split("")[0] == "7") toString += "1"

    string = fromString + toString
    return string
}

function stringToTile(string){
    var from = string.split("")[0] + string.split("")[1]
    var to = string.split("")[2] + string.split("")[3]
    var fromTile
    var toTile

    if(from.split("")[1] == "8") fromTile = "0"
    else if(from.split("")[1] == "7") fromTile = "1"
    else if(from.split("")[1] == "6") fromTile = "2"
    else if(from.split("")[1] == "5") fromTile = "3"
    else if(from.split("")[1] == "4") fromTile = "4"
    else if(from.split("")[1] == "3") fromTile = "5"
    else if(from.split("")[1] == "2") fromTile = "6"
    else if(from.split("")[1] == "1") fromTile = "7"

    if(from.split("")[0] == "a") fromTile += "0"
    else if(from.split("")[0] == "b") fromTile += "1"
    else if(from.split("")[0] == "c") fromTile += "2"
    else if(from.split("")[0] == "d") fromTile += "3"
    else if(from.split("")[0] == "e") fromTile += "4"
    else if(from.split("")[0] == "f") fromTile += "5"
    else if(from.split("")[0] == "g") fromTile += "6"
    else if(from.split("")[0] == "h") fromTile += "7"

    if(to.split("")[1] == "8") toTile = "0"
    else if(to.split("")[1] == "7") toTile = "1"
    else if(to.split("")[1] == "6") toTile = "2"
    else if(to.split("")[1] == "5") toTile = "3"
    else if(to.split("")[1] == "4") toTile = "4"
    else if(to.split("")[1] == "3") toTile = "5"
    else if(to.split("")[1] == "2") toTile = "6"
    else if(to.split("")[1] == "1") toTile = "7"

    if(to.split("")[0] == "a") toTile += "0"
    else if(to.split("")[0] == "b") toTile += "1"
    else if(to.split("")[0] == "c") toTile += "2"
    else if(to.split("")[0] == "d") toTile += "3"
    else if(to.split("")[0] == "e") toTile += "4"
    else if(to.split("")[0] == "f") toTile += "5"
    else if(to.split("")[0] == "g") toTile += "6"
    else if(to.split("")[0] == "h") toTile += "7"

    return fromTile + toTile
}

function aiMove(){
    stockfish.postMessage(`go movetime ${movetime}`)
}

function createPointer(x,y,type){
    if(type == 1)
        document.querySelector(".pointers").innerHTML += `<div class="pointer tile square-${x}${y}" onclick="clickMove()"></div>`

    else if(type == 2)
        document.querySelector(".pointers").innerHTML += `<div class="pointer capture square-${x}${y}" onclick="clickMove()"></div>`
}

function createLastMove(x,y){
    document.querySelector(".moves").innerHTML += `<div class="pointer move square-${x}${y}"></div>`
}

function mouseToTile(x, y){
    var tile
    var width = board.offsetWidth / 8

    if(y < width * 1) tile = inverted ? 7 : 0
    else if(y < width * 2) tile = inverted ? 6 : 1
    else if(y < width * 3) tile = inverted ? 5 : 2
    else if(y < width * 4) tile = inverted ? 4 : 3
    else if(y < width * 5) tile = inverted ? 3 : 4
    else if(y < width * 6) tile = inverted ? 2 : 5
    else if(y < width * 7) tile = inverted ? 1 : 6
    else if(y < width * 8) tile = inverted ? 0 : 7

    if(x < width * 1) tile += inverted ? "7" : "0"
    else if(x < width * 2) tile += inverted ? "6" : "1"
    else if(x < width * 3) tile += inverted ? "5" : "2"
    else if(x < width * 4) tile += inverted ? "4" : "3"
    else if(x < width * 5) tile += inverted ? "3" : "4"
    else if(x < width * 6) tile += inverted ? "2" : "5"
    else if(x < width * 7) tile += inverted ? "1" : "6"
    else if(x < width * 8) tile += inverted ? "0" : "7"

    return tile
}

function isSameColor(x,y,color){
    x = parseInt(x)
    y = parseInt(y)
    if(positions[x][y] == null || positions[x][y] == undefined || positions[x][y] == " ") return
    if(positions[x][y].split("")[0] == color){
        return true
    }else{
        return false
    }
}

function getMoves(){
    if(clickedPiece == null || clickedPiece == undefined) return
    possibleMoves = []
    var tile = clickedPiece.classList[2].replace("square-","")
    var x = parseInt(tile.split("")[0])
    var y = parseInt(tile.split("")[1])

    if(positions[x][y].split("")[1] == "p") pawn(x,y)
    else if(positions[x][y].split("")[1] == "r") rook(x,y)
    else if(positions[x][y].split("")[1] == "n") knight(x,y)
    else if(positions[x][y].split("")[1] == "b") bishop(x,y)
    else if(positions[x][y].split("")[1] == "q") queen(x,y)
    else if(positions[x][y].split("")[1] == "k") king(x,y)
}


function pawn(x,y){
    var canContinue = false
    if(positions[x][y].split("")[0] == "w"){
        if(positions[parseInt(x) - 1][y] == " "){
            createPointer(parseInt(x) - 1,y,1)
            possibleMoves.push((parseInt(x) - 1) + String(y))
            canContinue = true
        }
        if(x == 6){
            if(canContinue){
                if(positions[x - 2][y] == " "){
                    createPointer(x - 2,y,1)
                    possibleMoves.push(String(x - 2) + String(y))
                }
            }
        }
        if(y > 0){
            if(positions[x - 1][y - 1] != " "){
                if(!isSameColor(x - 1, y - 1,"w")){
                    createPointer(x - 1,y - 1,2)
                    possibleMoves.push(String(x - 1) + String(y - 1))
                }
            }
        }
        if(y < 7){
            if(positions[x - 1][y + 1] != " "){
                if(!isSameColor(x - 1, y + 1,"w")){
                    createPointer(x - 1,y + 1,2)
                    possibleMoves.push(String(x - 1) + String(y + 1))
                }
            }
        }
        //EN PASSANT
        if(x == 3){
            if(String(x - 1) + String(y - 1) == enPassant){
                createPointer(x - 1,y - 1,2)
                possibleMoves.push(String(x - 1) + String(y - 1))
            }
            if(String(x - 1) + String(y + 1) == enPassant){
                createPointer(x - 1,y + 1,2)
                possibleMoves.push(String(x - 1) + String(y + 1))
            }
        }
        /* console.log(x, y) */
    }
    else{
        if(positions[x + 1][y] == " "){
            createPointer(x + 1,y,1)
            possibleMoves.push((x + 1) + String(y))
            canContinue = true
        }
        if(x == 1){
            if(canContinue){
                if(positions[x + 2][y] == " "){
                    createPointer(x + 2,y,1)
                    possibleMoves.push((x + 2) + String(y))
                }
            }
        }
        if(y > 0){
            if(positions[x + 1][y - 1] != " "){
                if(!isSameColor(x + 1, y - 1,"b")){
                    createPointer(x + 1,y - 1,2)
                    possibleMoves.push(String(x + 1) + String(y - 1))
                }
            }
        }
        
        if(y < 7){
            if(positions[x + 1][y + 1] != " "){
                if(!isSameColor(x + 1, y + 1,"b")){
                    createPointer(x + 1,y + 1,2)
                    possibleMoves.push(String(x + 1) + String(y + 1))
                }
            }
        }
        //EN PASSANT
        if(x == 4){
            if(String(x + 1) + String(y - 1) == enPassant){
                createPointer(x + 1,y - 1,2)
                possibleMoves.push(String(x + 1) + String(y - 1))
            }
            if(String(x + 1) + String(y + 1) == enPassant){
                createPointer(x + 1,y + 1,2)
                possibleMoves.push(String(x + 1) + String(y + 1))
            }
        }
    }
}

function rook(x,y){
    //UP
    for(let i = x - 1; i >= 0; i--){
        if(positions[i][y] == " "){
            createPointer(i,y,1)
            possibleMoves.push(String(i) + String(y))
        }else{
            if(!isSameColor(i,y,positions[x][y].split("")[0])){
                createPointer(i,y,2)
                possibleMoves.push(String(i) + String(y))
            }
            break;
        }
    }

    //DOWN
    for(let i = x + 1; i < 8; i++){
        if(positions[i][y] == " "){
            createPointer(i,y,1)
            possibleMoves.push(String(i) + String(y))
        }else{
            if(!isSameColor(i,y,positions[x][y].split("")[0])){
                createPointer(i,y,2)
                possibleMoves.push(String(i) + String(y))
            }
            break;
        }
    }

    //RIGHT
    for(let i = y + 1; i < 8; i++){
        if(positions[x][i] == " "){
            createPointer(x,i,1)
            possibleMoves.push(String(x) + String(i))
        }else{
            if(!isSameColor(x,i,positions[x][y].split("")[0])){
                createPointer(x,i,2)
                possibleMoves.push(String(x) + String(i))
            }
            break;
        }
    }

    //LEFT
    for(let i = y - 1; i >= 0; i--){
        if(positions[x][i] == " "){
            createPointer(x,i,1)
            possibleMoves.push(String(x) + String(i))
        }else{
            if(!isSameColor(x,i,positions[x][y].split("")[0])){
                createPointer(x,i,2)
                possibleMoves.push(String(x) + String(i))
            }
            break;
        }
    }
}

function bishop(x,y){
    //UP LEFT
    for(let i = 1; i < 8; i++){
        if(x - i < 0 || y - i < 0) break
        if(positions[x - i][y - i] == " "){
            createPointer(x - i,y - i,1)
            possibleMoves.push(String(x - i) + String(y - i))
            if(x - i <= 0 || y - i <= 0) break
        }else{
            if(!isSameColor(x - i,y - i,positions[x][y].split("")[0])){
                createPointer(x - i,y - i,2)
                possibleMoves.push(String(x - i) + String(y - i))
            }
            break
        }
    }
    
    //UP RIGHT
    for(let i = 1; i < 8; i++){
        if(x - i < 0 || y + i > 7) break
        if(positions[x - i][y + i] == " "){
            createPointer(x - i,y + i,1)
            possibleMoves.push(String(x - i) + String(y + i))
            if(x - i <= 0 || y + i >= 7) break
        }else{
            if(!isSameColor(x - i,y + i,positions[x][y].split("")[0])){
                createPointer(x - i,y + i,2)
                possibleMoves.push(String(x - i) + String(y + i))
            }
            break
        }
    }

    //DOWN LEFT
    for(let i = 1; i < 8; i++){
        if(x + i > 7 || y - i < 0) break
        if(positions[x + i][y - i] == " "){
            createPointer(x + i,y - i,1)
            possibleMoves.push(String(x + i) + String(y - i))
            if(x + i >= 7 || y - i <= 0) break
        }else{
            if(!isSameColor(x + i,y - i,positions[x][y].split("")[0])){
                createPointer(x + i,y - i,2)
                possibleMoves.push(String(x + i) + String(y - i))
            }
            break
        }
    }

    //DOWN RIGHT
    for(let i = 1; i < 8; i++){
        if(x + i > 7 || y + i > 7) break
        if(positions[x + i][y + i] == " "){
            createPointer(x + i,y + i,1)
            possibleMoves.push(String(x + i) + String(y + i))
            if(x + i >= 7 || y + i >= 7) break
        }else{
            if(!isSameColor(x + i,y + i,positions[x][y].split("")[0])){
                createPointer(x + i,y + i,2)
                possibleMoves.push(String(x + i) + String(y + i))
            }
            break
        }
    }
}

function queen(x,y){
    rook(x,y)
    bishop(x,y)
}

function king(x,y){
    var values = [[-1,0],[0,1],[1,0],[0,-1],[-1,1],[1,1],[1,-1],[-1,-1]]
    var stop = false
    for(let i = 0; i < 8; i++){
        let numx = x + values[i][0]
        let numy = y + values[i][1]
        stop = false
        if (numx > 7 || numx < 0 || numy > 7 || numy < 0) stop = true
        if(!stop){
            /* if(!attackedTiles.includes(String(numx) + String(numy))){ */
                if(positions[numx][numy] == " "){
                    createPointer(numx,numy,1)
                    possibleMoves.push(String(numx) + String(numy))
                }else{
                    if(!isSameColor(numx,numy,positions[x][y].split("")[0])){
                        createPointer(numx,numy,2)
                        possibleMoves.push(String(numx) + String(numy))
                    }
                }
            /* } */
        }
    }
    if(positions[x][y].split("")[0] == "w"){
        if(canWOO){
            if(positions[7][5] == " " && positions[7][6] == " "){
                createPointer(7,6,1)
                possibleMoves.push("76")
            }
        }
        if(canWOOO){
            if(positions[7][1] == " " && positions[7][2] == " " && positions[7][3]){
                createPointer(7,2,1)
                possibleMoves.push("72")
            }
        }
    }else{
        if(canBOO){
            if(positions[0][5] == " " && positions[0][6] == " "){
                createPointer(0,6,1)
                possibleMoves.push("06")
            }
        }
        if(canBOOO){
            if(positions[0][1] == " " && positions[0][2] == " " && positions[0][3]){
                createPointer(0,2,1)
                possibleMoves.push("02")
            }
        }
    }
}

function knight(x,y){
    var values = [[-2,1],[-1,2],[2,1],[1,2],[2,-1],[1,-2],[-1,-2],[-2,-1]]
    var stop = false
    for(let i = 0; i < 8; i++){
        let numx = x + values[i][0]
        let numy = y + values[i][1]
        stop = false
        if (numx > 7 || numx < 0 || numy > 7 || numy < 0) stop = true
        if(!stop){
            if(positions[numx][numy] == " "){
                createPointer(numx,numy,1)
                possibleMoves.push(String(numx) + String(numy))
            }else{
                if(!isSameColor(numx,numy,positions[x][y].split("")[0])){
                    createPointer(numx,numy,2)
                    possibleMoves.push(String(numx) + String(numy))
                }
            }
        }
    }
}

function generateAttackedTiles(color){
    attackedTiles = []
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            if(positions[i][j].split("")[0] == color){
                if(positions[i][j].split("")[1] == "p"){
                    attackedPawn(i,j)
                }
                else if(positions[i][j].split("")[1] == "r"){
                    attackedRook(i,j)
                }
                else if(positions[i][j].split("")[1] == "b"){
                    attackedBishop(i,j)
                }
                else if(positions[i][j].split("")[1] == "q"){
                    attackedQueen(i,j)
                }
                else if(positions[i][j].split("")[1] == "n"){
                    attackedKnight(i,j)
                }
                else if(positions[i][j].split("")[1] == "k"){
                    attackedKing(i,j)
                } 
            }
        }
    }
}

function attackedPawn(x,y){
    if(positions[x][y].split("")[0] == "w"){
        if(y > 0){
            attackedTiles.push(String(x - 1) + String(y - 1))
        }
        if(y < 7){
            attackedTiles.push(String(x - 1) + String(y + 1))
        }
    }else if(positions[x][y].split("")[0] == "b"){
        if(y > 0){
            attackedTiles.push(String(x + 1) + String(y - 1))
        }
        if(y < 7){
            attackedTiles.push(String(x + 1) + String(y + 1))
        }
    }
}

function attackedRook(x,y){
    //UP
    for(let i = x - 1; i >= 0; i--){
        if(positions[i][y] == " "){
            attackedTiles.push(String(i) + String(y))
        }else{
            attackedTiles.push(String(i) + String(y))
            break;
        }
    }

    //DOWN
    for(let i = x + 1; i < 8; i++){
        if(positions[i][y] == " "){
            attackedTiles.push(String(i) + String(y))
        }else{
            attackedTiles.push(String(i) + String(y))
            break;
        }
    }

    //RIGHT
    for(let i = y + 1; i < 8; i++){
        if(positions[x][i] == " "){
            attackedTiles.push(String(x) + String(i))
        }else{
            attackedTiles.push(String(x) + String(i))
            break;
        }
    }

    //LEFT
    for(let i = y - 1; i >= 0; i--){
        if(positions[x][i] == " "){
            attackedTiles.push(String(x) + String(i))
        }else{
            attackedTiles.push(String(x) + String(i))
            break;
        }
    }
}

function attackedBishop(x,y){
    //UP LEFT
    for(let i = 1; i < 8; i++){
        if(x - i < 0 || y - i < 0) break
        if(positions[x - i][y - i] == " "){
            attackedTiles.push(String(x - i) + String(y - i))
            if(x - i <= 0 || y - i <= 0) break
        }else{
            attackedTiles.push(String(x - i) + String(y - i))
            break
        }
    }
    
    //UP RIGHT
    for(let i = 1; i < 8; i++){
        if(x - i < 0 || y + i > 7) break
        if(positions[x - i][y + i] == " "){
            attackedTiles.push(String(x - i) + String(y + i))
            if(x - i <= 0 || y + i >= 7) break
        }else{
            attackedTiles.push(String(x - i) + String(y + i))
            break
        }
    }

    //DOWN LEFT
    for(let i = 1; i < 8; i++){
        if(x + i > 7 || y - i < 0) break
        if(positions[x + i][y - i] == " "){
            attackedTiles.push(String(x + i) + String(y - i))
            if(x + i >= 7 || y - i <= 0) break
        }else{
            attackedTiles.push(String(x + i) + String(y - i))
            break
        }
    }

    //DOWN RIGHT
    for(let i = 1; i < 8; i++){
        if(x + i > 7 || y + i > 7) break
        if(positions[x + i][y + i] == " "){
            attackedTiles.push(String(x + i) + String(y + i))
            if(x + i >= 7 || y + i >= 7) break
        }else{
            attackedTiles.push(String(x + i) + String(y + i))
            break
        }
    }
}

function attackedQueen(x,y){
    attackedRook(x,y)
    attackedBishop(x,y)
}

function attackedKnight(x,y){
    var values = [[-2,1],[-1,2],[2,1],[1,2],[2,-1],[1,-2],[-1,-2],[-2,-1]]
    var stop = false
    for(let i = 0; i < 8; i++){
        let numx = x + values[i][0]
        let numy = y + values[i][1]
        stop = false
        if (numx > 7 || numx < 0 || numy > 7 || numy < 0) stop = true
        if(!stop){
            attackedTiles.push(String(numx) + String(numy))
        }
    }
}

function attackedKing(x,y){
    var values = [[-1,0],[0,1],[1,0],[0,-1],[-1,1],[1,1],[1,-1],[-1,-1]]
    var stop = false
    for(let i = 0; i < 8; i++){
        let numx = x + values[i][0]
        let numy = y + values[i][1]
        stop = false
        if (numx > 7 || numx < 0 || numy > 7 || numy < 0) stop = true
        if(!stop){
            attackedTiles.push(String(numx) + String(numy))
        }
    }
}



if(window.location.href.includes('autoStart=true')){
    play()
}