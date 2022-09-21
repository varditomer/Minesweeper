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
    secsPassed: 0 
}


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
    const currCell = {}

    for (var i = 0; i < board.length; i++) {  
        for (var j = 0; j < board[0].length; j++) { 
            board[i][j] = { //each cell:
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }

         }
    }
    board[0][0].isMine = board[2][2].isMine = true //Place 2 mines manually
    // board[0][1].isMine = true //negsCount check
    board[1][1].isMarked = true


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
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegs(i,j,board)
                // console.log(getClassName({i:i, j:j})) //negsCount Check
                // console.log(`numOfNegs:`, numOfNegs) //negsCount Check
                 //negsCount Check
                // console.log(`board[i][j].minesAroundCount:`, board[i][j].minesAroundCount) //negsCount Check
                // console.log(`\n:`, '\n') //negsCount Check
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
            var currCellClass = getClassName({i:i, j:j}) //cell-0-0
            currCellClass += (currCell.isMine)? ' mine"': ` number ${currCell.minesAroundCount}"`

            strHTML += '\t<td class="cell ' + currCellClass + ' onclick="cellClicked(' + 'this' + ',' + i + ',' + j + ')" oncontextmenu="cellMarked(' + 'event,' + ' '+ 'this' + ',' + i + ',' + j + ')">\n'

            //cell content
            var strCellContent = `<span ` + `class="hide">`
            var cellContentImg = ''

            if (currCell.isMarked) cellContentImg += `${MARKED_IMG}`
            else {
                cellContentImg += (currCell.isMine)? `${MINE_IMG}`: `${currCell.minesAroundCount}`
            }
            strCellContent += cellContentImg + `</span>`
            strHTML += strCellContent + '\t</td>\n'

        }
        strHTML += '</tr>\n'
     }
     
     console.log(`strHTML:`, strHTML)

     const elBoard = document.querySelector('.board')
     elBoard.innerHTML = strHTML
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    //update model
    gBoard[i][j].isShown = true
    //update DOM
    if(elCell.classList.contains('mine')) elCell.classList.add('mine-clicked')
    showElemet(elCell.querySelector('span'))
}


//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    const currCell = gBoard[i][j]
    //update model
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    if(gBoard[i][j].isMarked) elCell.classList.add('marked')
    else elCell.classList.remove('marked')

    
    console.log(`success!:`)

}

// function expandShown(board, elCell, i, j) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
    // NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors 
    // BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)

// }