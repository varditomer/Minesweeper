'use strict'

//The Model
var gBoard = []

const gCell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: false
}

const gLevel = {
    SIZE: 4,
    MINES: 2,
    LEVEL: 'easy',
    // UNIQUE_ROW_IDXS: getArr(),
    // UNIQUE_COL_IDXS: getArr()
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
    lifes: 3,
}
var gTimerInterval

const MINE_IMG = '<img src="images/mine.png" alt="mine">'
const MARKED_IMG = '<img src="images/marked.png" alt="marked">'


//This is called when page loads
function initGame() {
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function buildBoard() {
    const board = createMat(gLevel.SIZE, gLevel.SIZE)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = { //each cell
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    insertMines(board)
    console.log(`board:`, board)
    return board
}

function insertMines(board) {
    var currPos = { i: 0, j: 0 }


    for (var i = 0; i < gLevel.MINES; i++) {
        currPos = getEmptyPos(board)
        console.log(`curPos:`, currPos)
        board[currPos.i][currPos.j].isMine = true
    }
}

// Builds the board 
// Set mines at random locations
// Call setMinesNegsCount()
// Return the created board

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegs(i, j, board)
        }
    }
}

//Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var currCellClass = getClassName({ i: i, j: j }) //cell-0-0
            currCellClass += (currCell.isMine) ? ' mine"' : ` number ${currCell.minesAroundCount}"`

            strHTML += '\t<td class="cell cell-' + gLevel.LEVEL + ' ' + currCellClass + ' onclick="cellClicked(' + 'this' + ',' + i + ',' + j + ')" oncontextmenu="cellMarked(' + 'event,' + 'this' + ',' + i + ',' + j + ')">\n'

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    console.log(`strHTML:`, strHTML)
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function renderCell(elCell, cellContentImg = "") {
    elCell.innerHTML = `<span>${cellContentImg}</span>`
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    //start timer with 1st click
    if (gGame.isFirstClick) hendleGameStart()
    if (!gGame.isOn) return

    const currCell = gBoard[i][j]
    if (currCell.isMarked) return null
    if (currCell.isShown) return null

    //  update model
    currCell.isShown = true

    //  update DOM
    var cellContentImg
    if (currCell.isMine) {
        elCell.classList.add('mine-clicked')
        cellContentImg = MINE_IMG
        revealAllMines()
        gameOver()
    } else {
        elCell.style.backgroundColor = 'blue'
        elCell.style.boxShadow = 'inset 0px 0px 25px 0px rgba(0,0,0,0.25)'
        if (currCell.minesAroundCount) cellContentImg = currCell.minesAroundCount
    }
    renderCell(elCell, cellContentImg)
    isVictory()
}

//Called on right click to mark a cell
function cellMarked(ev, elCell, i, j) {
    if (gGame.isFirstClick) hendleGameStart()
    ev.preventDefault()
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (currCell.isShown) return

    // update model: mark <=> unmark cell
    currCell.isMarked = !currCell.isMarked

    // update DOM
    if (currCell.isMarked) {
        elCell.classList.add('marked')
        renderCell(elCell, MARKED_IMG)
    } else {
        elCell.classList.remove('marked')
        renderCell(elCell, "")
    }
    isVictory()
}

function revealAllMines() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        var elCurrMineCell = mines[i]
        renderCell(elCurrMineCell, MINE_IMG)
    }
}

function hendleGameStart() {
    if (!gGame.isFirstClick) return
    gGame.isFirstClick = false
    gGame.isOn = true
    setTimer()
}


function gameOver() {
    clearInterval(gTimerInterval)
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = '🤯'
}

function restartGame() {
    gGame.isFirstClick = true
    gGame.isOn = true
    document.querySelector('.btn-start').innerText = '😀'
    clearInterval(gTimerInterval)
    document.querySelector(".timer").innerHTML = '🧭'
    initGame()
}

function onClickLvlSelect(lvlId) {
    switch (lvlId) {
        case 'Easy':
            gLevel.SIZE = 16 ** 0.5
            gLevel.LEVEL = 'easy'
            break;
        case 'Hard':
            gLevel.SIZE = 25 ** 0.5
            gLevel.LEVEL = 'hard'
            break;
        case 'Extreme':
            gLevel.SIZE = 36 ** 0.5
            gLevel.LEVEL = 'extreme'
            break;

        default:
            break;
    }
    initGame()
}





// function expandShown(board, elCell, i, j) {
// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors 
// BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)

// }

//check negs
function countNegs(cellIdxI, cellIdxJ, board) {
    var negsCount = 0
    for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function isVictory() {
    var numOfShown = 0
    var numOfMarked = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown) numOfShown++
            else if (currCell.isMarked) numOfMarked++

            if (numOfMarked > gLevel.MINES) return
        }
    }
    console.log(`numOfShown:`, numOfShown)
    console.log(`numOfMarked:`, numOfMarked)
    if ((numOfShown + numOfMarked) === gLevel.SIZE ** 2 && numOfMarked === gLevel.MINES) setVictory()
}

function setVictory() {
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = '😎'
    clearInterval(gTimerInterval)
}

function setTimer() {
    gGame.isFirstClick = false
    gGame.secsPassed = 0
    gTimerInterval = setInterval(startTimer, 1000)
}

function startTimer() {
    gGame.secsPassed++
    document.querySelector(".timer").innerHTML = gGame.secsPassed;
}

//get empty pos by trying rand poses
function getEmptyPos(board) {
    var emptyPos = { i: 0, j: 0 }
    emptyPos.i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    emptyPos.j = +getRandomIntInclusive(0, gLevel.SIZE - 1)

    while (board[emptyPos.i][emptyPos.j].isMine) {
        console.log(board[emptyPos.i][emptyPos.j].type)
        console.log(board[emptyPos.i][emptyPos.j].gameElement)
        emptyPos.i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        emptyPos.j = getRandomIntInclusive(0, gLevel.SIZE - 1)
    }
    return emptyPos
}

document.body.oncontextmenu = function (e) {
    return false
}