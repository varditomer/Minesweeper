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
    MINES: 2
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
}
var gTimerInterval

const MINE_IMG = '<img src="images/mine2.png" alt="mine">'
const MARKED_IMG = '<img src="images/marked.png" alt="marked">'


//This is called when page loads
function initGame() {
    gGame.isOn = true
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
    board[0][0].isMine = true
    board[2][2].isMine = true //Place 2 mines manually
    console.log(`board:`, board)
    return board
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

            strHTML += '\t<td class="cell ' + currCellClass + ' onclick="cellClicked(' + 'this' + ',' + i + ',' + j + ')" oncontextmenu="cellMarked(' + 'event,' + 'this' + ',' + i + ',' + j + ')">\n'

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
    if (gGame.isFirstClick) setTimer()

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
}

function revealAllMines() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        var elCurrMineCell = mines[i]
        renderCell(elCurrMineCell, MINE_IMG)
    }

}


//Called on right click to mark a cell
function cellMarked(ev, elCell, i, j) {
    var currCell = gBoard[i][j]
    ev.preventDefault()
    if (currCell.isShown) return
    console.log(`currCell.isShown:`, currCell.isShown)
    console.log(`elCell:`, elCell)

    // update model: mark <=> unmark cell
    currCell.isMarked = !currCell.isMarked

    // update DOM
    if (currCell.isMarked) {
        elCell.classList.add('marked')
        renderCell(elCell, MARKED_IMG)
    }
    else {
        elCell.classList.remove('marked')
        renderCell(elCell, "")
    }

}
function gameOver() {
    gGame.isOn = false
    //todo
}

function restartGame() {
    gGame.isFirstClick = true
    gGame.isOn = true
    clearInterval(gGame.timerInterval)

    initGame()


}

function setTimer() {
    gGame.isFirstClick = false
    gTimerInterval = setInterval(startTimer, 1000)
    return
    //todo
}
function startTimer() {

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

document.body.oncontextmenu = function (e) {
    return false
}