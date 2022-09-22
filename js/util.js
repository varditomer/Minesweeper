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

