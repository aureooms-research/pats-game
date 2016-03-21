'use strict' ;

var colorsheet = StyleSheet( ) ;

function Solution ( M , N , R , score , sat , hash , metadata ) {
	this.M = M ;
	this.N = N ;
	this.R = R ;
	this.score = score ;
	this.sat = sat ;
	this.hash = hash ;
	this.metadata = metadata ;
	this.moves = null ;
	this._html = null ;
	this.opt = false ;
	this.best = false ;
}

Solution.prototype.html = function ( ) {

	if ( this._html === null ) {
		this._html = this.inithtml();
		if ( this.sat ) this.lazyload( ) ;
	}

	return this._html ;

} ;

Solution.prototype.dimensions = function ( ) {
	return this.M + 'x' + this.N + 'x' + this.R ;
} ;

Solution.prototype.url = function ( ) {
	return RAW + this.dimensions() + '/' + ( this.sat ? 'sat' : 'unsat' ) + '/'+ this.score + '/' + this.hash ;
} ;

Solution.prototype.grid = function ( ) {

	if ( this.moves === null ) {
		console.error( 'cannot build grid: moves not loaded' );
		return null ;
	}

	var i,j,k;
	var score = this.score ;
	var moves = this.moves ;
	var M = this.M ;
	var N = this.N ;

	var grid = [ ] ;
	for ( i = 0 ; i < M ; ++i ) {
		var row = [ ] ;
		for ( j = 0 ; j < N ; ++j ) {
			row.push( 0 ) ;
		}
		grid.push(row);
	}
	for ( var m = 0 ; m < score ; ++m ) {
		var move = moves[m];
		k = move[0];
		i = move[1];
		j = move[2];
		grid[M-i][j-1] = k ;
	}

	return grid ;

} ;

Solution.prototype._html_head = function ( ) {

	var head = {
		root : document.createElement('div') ,
		dimensions : {
			root : document.createElement('div') ,
			rows :{ root: document.createElement('span') } ,
			columns :{ root: document.createElement('span') } ,
			rounds :{ root: document.createElement('span') }
		} ,
		tags : {
			root : document.createElement('div') ,
			score :{ root: document.createElement('span') } ,
			best :{ root: document.createElement('span') } ,
			optimal :{ root: document.createElement('span') } ,
			unsat :{ root: document.createElement('span') } ,
		} ,
		hash :{ root: document.createElement('a') }
	};

	head.root.classList.add('head');

	head.dimensions.root.classList.add('dimensions');

	head.dimensions.rows.root.innerText = this.M ;
	head.dimensions.rows.root.classList.add('dim');
	head.dimensions.rows.root.classList.add('dim-rows');
	head.dimensions.columns.root.innerText = this.N ;
	head.dimensions.columns.root.classList.add('dim');
	head.dimensions.columns.root.classList.add('dim-columns');
	head.dimensions.rounds.root.innerText = this.R ;
	head.dimensions.rounds.root.classList.add('dim');
	head.dimensions.rounds.root.classList.add('dim-rounds');

	head.tags.root.classList.add('tags');

	head.tags.score.root.innerText = this.score ;
	head.tags.score.root.classList.add('tag');
	head.tags.score.root.classList.add('tag-score');
	head.tags.best.root.innerText = 'best' ;
	head.tags.best.root.classList.add('tag');
	head.tags.best.root.classList.add('tag-best');
	head.tags.optimal.root.innerText = 'opt' ;
	head.tags.optimal.root.classList.add('tag');
	head.tags.optimal.root.classList.add('tag-opt');
	head.tags.unsat.root.innerText = 'unsat' ;
	head.tags.unsat.root.classList.add('tag');
	head.tags.unsat.root.classList.add('tag-unsat');

	head.hash.root.innerText = this.hash ;
	head.hash.root.href = ROOT + this.metadata.path ;
	head.hash.root.target = '_BLANK' ;
	head.hash.root.classList.add('hash');

	head.dimensions.root.appendChild(head.dimensions.rows.root);
	head.dimensions.root.appendChild(head.dimensions.columns.root);
	head.dimensions.root.appendChild(head.dimensions.rounds.root);

	head.tags.root.appendChild(head.tags.score.root);
	head.tags.root.appendChild(head.tags.best.root);
	head.tags.root.appendChild(head.tags.optimal.root);
	head.tags.root.appendChild(head.tags.unsat.root);

	head.root.appendChild(head.dimensions.root);
	head.root.appendChild(head.tags.root);
	head.root.appendChild(head.hash.root);

	head.root.style.backgroundColor = Color.fromhex( this.hash.substr( -6 ) ).blend( Color.WHITE ).css();

	return head;

} ;

Solution.prototype.inithtml = function ( ) {

	var html = {
		root : document.createElement('div') ,
		head : this._html_head( ) ,
		body : {
			root : document.createElement('div') ,
			grid : this._html_grid_preview()
		}
	} ;

	html.root.classList.add('solution');

	html.root.appendChild(html.head.root);
	html.root.appendChild(html.body.root);
	html.body.root.appendChild(html.body.grid.root);
	html.body.root.classList.add('body');

	if ( !this.sat ) html.root.classList.add( 'unsat' ) ;
	else if ( this.opt ) html.root.classList.add( 'opt' ) ;
	else if ( this.best ) html.root.classList.add( 'best' ) ;

	return html ;

};

Solution.prototype._html_grid_preview = function ( ) {

	var grid =  {
		root : document.createElement('table'),
		tbody : { root: document.createElement('tbody') }
	} ;

	grid.root.appendChild(grid.tbody.root);

	if ( !this.sat ) {

		var row = document.createElement('tr');
		grid.tbody.root.appendChild(row);

		var cell = document.createElement('td');
		row.appendChild(cell);

		cell.innerText = 'unsatisfiable';
		return grid ;

	}

	var M = this.M ;
	var N = this.N ;

	for ( var i = 0 ; i < M ; ++i ) {
		var row = document.createElement('tr');
		grid.tbody.root.appendChild(row);
		for ( var j = 0 ; j < N ; ++j ) {
			var cell = document.createElement('td');
			row.appendChild(cell);

			cell.innerText = '?' ;
			cell.style.color = Color.pastel().css();
		}
	}

	return grid ;

} ;

Solution.prototype._html_grid = function ( ) {

	var grid = {
		root: document.createElement('table'),
		tbody: { root : document.createElement('tbody') }
	} ;

	grid.root.appendChild(grid.tbody.root);

	var _grid = this.grid();
	var M = this.M ;
	var N = this.N ;

	for ( var i = 0 ; i < M ; ++i ) {
		var row = document.createElement('tr');
		grid.tbody.root.appendChild(row);
		for ( var j = 0 ; j < N ; ++j ) {
			var cell = document.createElement('td');
			row.appendChild(cell);

			var x = _grid[i][j] ;
			if ( x > 0 ) cell.innerText = x ;
			var colorclass = '_'+x ;
			cell.classList.add( colorclass ) ;
			while ( x > C ) {
				++C ;
				colorsheet.insertRule('._'+C+'{color:'+Color.pastel().css()+' !important;}',C-1);
			}
		}
	}

	return grid ;

} ;

Solution.parse_moves = function ( raw ) {

	var i, j, k;
	var lines = raw.split('\n') ;
	var header = lines[0].split(' ');
	var M = parseInt(header[0]) ;
	var N = parseInt(header[1]) ;
	var R = parseInt(header[2]) ;
	var score = parseInt(lines[1]) ;
	var sat = !!parseInt(lines[2]) ;
	if ( !sat ) {
		console.error('cannot parse moves if unsatisfiable') ;
		return null ;
	}
	var _moves = lines.slice(3);
	var moves = [ ] ;
	for ( var m = 0 ; m < score ; ++m ) {
		var _move = _moves[m].split(' ');
		k = parseInt(_move[0]);
		i = parseInt(_move[1]);
		j = parseInt(_move[2]);
		var move = [ k , i , j ] ;
		moves.push( move ) ;
	}

	return moves ;

} ;

Solution.from = function ( metadata ) {

	var parts = metadata.path.split('/') ;
	if ( parts.length < 4 ) return null ;

	// this is a path to a solution
	var dimensions = parts[0].split('x') ;
	var rows = parseInt(dimensions[0]);
	var columns = parseInt(dimensions[1]);
	var rounds = parseInt(dimensions[2]);
	var sat = parts[1] === 'sat';
	var score = parseInt(parts[2]);
	var hash = parts[3];

	return new Solution( rows , columns , rounds , score , sat , hash , metadata ) ;

} ;

Solution.prototype.lazyload = function ( ) {

	var solution = this ;

	var onreadystatechange = function ( event ) {
		 if (event.target.readyState === XMLHttpRequest.DONE) {
			logGitHubRAWRequest( event ) ;
			if (event.target.status === 200) {
				var raw = event.target.responseText ;
				var moves = Solution.parse_moves( raw ) ;
				solution.moves = moves ;
				var grid = solution._html_grid( ) ;
				solution.html().body.root.replaceChild(grid.root, solution.html().body.grid.root);
				solution.html().body.grid = grid ;
			}
		}
	} ;

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	var url = solution.url() ;
	request.open('GET', url);
	request.send();

} ;
