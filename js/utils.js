//show || hide element
function showElemet(el) {
	el.classList.remove('hide')
	el.classList.add('show')
}

function hideElemet(el) {
	el.classList.remove('show')
	el.classList.add('hide')
}

//create mat
function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

//get cell className
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}

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
