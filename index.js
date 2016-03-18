'use strict' ;

function logGitHubAPIRequest ( event ) {

	var log = document.getElementById('log') ;
	log.classList.remove('status-pending');

	var status = event.target.status ;
	var statusText = event.target.statusText ;
	var reset = event.target.getResponseHeader('X-RateLimit-Reset') ;
	var limit = event.target.getResponseHeader('X-RateLimit-Limit') ;
	var remaining = event.target.getResponseHeader('X-RateLimit-Remaining') ;
	reset = new Date( parseInt(reset) * 1000 ).toLocaleFormat() ;
	limit = parseInt( limit ) ;
	remaining = parseInt( remaining ) ;

	document.getElementById('log-status').innerText = status ;
	document.getElementById('log-status-text').innerText = statusText ;
	document.getElementById('log-reset').innerText = reset ;
	document.getElementById('log-limit').innerText = limit;
	document.getElementById('log-remaining').innerText = remaining ;

	if ( status !== 200 ) {
		log.classList.add('status-error');
		console.error('There was a problem with the request.', event);
		console.error( status , statusText ) ;
		try{
			var message = JSON.parse(event.target.responseText).message ;
			document.getElementById('log-message').innerText = message ;
			console.error( 'response is', message);
		}
		catch (e){
			console.error( 'response is not in JSON format');
			console.error( 'responce is', event.target.responseText);
		}
	}
	else {
		log.classList.add('status-ok');
	}
}

function logGitHubRAWRequest ( event ) {
	var status = event.target.status ;
	var statusText = event.target.statusText ;

	if ( status !== 200 ) {
		console.error('There was a problem with the request.', event);
		console.error( status , statusText ) ;
		console.error( 'response is', event.target.responseText);
	}
	else {
		console.debug( status , statusText ) ;
	}
}

function Color ( red , green , blue ) {
	this.red = red ;
	this.green = green ;
	this.blue = blue ;
}

Color.prototype.blend = function ( other ) {
	return Color.blend(this,other);
} ;

Color.prototype.css = function ( ) {
	return 'rgb('+this.red+','+this.green+','+this.blue+')';
};

Color.WHITE = new Color( 255 , 255 , 255 ) ;

Color.random = function ( mix ) {
	var red = ( Math.random() * 256 ) | 0;
	var green = ( Math.random() * 256 ) | 0;
	var blue = ( Math.random() * 256 ) | 0;
	return new Color(red, green, blue);

} ;

Color.blend = function ( first , second ) {
	var red = (first.red + second.red) / 2 | 0;
	var green = (first.green + second.green) / 2 | 0;
	var blue = (first.blue + second.blue) / 2 | 0;
	return new Color( red , green , blue ) ;
} ;

Color.pastel = function ( ) {
	return Color.random().blend( Color.WHITE ) ;
} ;

Color.fromhex = function ( hex ) {
	if ( hex[0] === '#' ) hex = hex.substr(1);
	var red = parseInt(hex.substr(0,2),16);
	var green = parseInt(hex.substr(2,2),16);
	var blue = parseInt(hex.substr(4,2),16);
	return new Color( red , green , blue ) ;
} ;

var colorsheet = (function() {
	// Create the <style> tag
	var style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return style.sheet;
})();

var C = 0 ;

var GITHUB_API = 'https://api.github.com' ;
var OWNER = 'aureooms-research' ;
var REPO = 'pats-game-solutions' ;
var URL_TREE = GITHUB_API + '/repos/' + OWNER + '/' + REPO + '/git/trees/master?recursive=true' ;
var ROOT = 'https://github.com/aureooms-research/pats-game-solutions/blob/master/' ;
var RAW = 'https://raw.githubusercontent.com/aureooms-research/pats-game-solutions/master/' ;

function Solution ( M , N , R , score , sat , hash , metadata ) {
	this.M = M ;
	this.N = N ;
	this.R = R ;
	this.score = score ;
	this.sat = sat ;
	this.hash = hash ;
	this.metadata = metadata ;
	this.moves = null ;
	this.html = this.inithtml();
	if ( this.sat ) this.lazyload();
}

Solution.prototype.dimensions = function ( ) {
	return this.M + 'x' + this.N + 'x' + this.R ;
} ;

Solution.prototype.url = function ( ) {
	return RAW + this.dimensions() + '/' + ( this.sat ? 'sat' : 'unsat' ) + '/'+ this.score + '/' + this.hash ;
} ;

Solution.prototype.grid = function ( ) {

	if ( this.moves === null ) {
		console.warn( 'cannot build grid: moves not loaded' );
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
				solution.html.body.root.replaceChild(grid.root, solution.html.body.grid.root);
				solution.html.body.grid = grid ;
			}
		}
	} ;

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	var url = solution.url() ;
	request.open('GET', url);
	request.send();

} ;


var Loader = function ( ) {
	this.solutions = { root : document.createElement( 'div' ) , list : [ ] } ;
	this.lb = { } ;
	this.ub = { } ;

	this.solutions.root.classList.add( 'solutions' );
	document.getElementById('solutions-container').appendChild(this.solutions.root);
} ;

Loader.prototype.update_exponent = function ( ){
	var best = 3/2 ;
	var html = '3/2 = 1.5' ;
	var n = this.solutions.list.length ;
	for (var k = 0 ; k < n ; ++k ) {
		var solution = this.solutions.list[k];
		var d = solution.M ;
		if ( d > 1 && solution.sat && solution.N === d && solution.R === d ) {
			var s = solution.score;
			var a = Math.log(s) / Math.log(d) ;
			if ( a >= best ) {
				best = a ;
				html = 'log<sub>'+d+'</sub> '+s+' = ' + a;
			}
		}
	}
	document.getElementById('exponent').innerHTML = html ;
} ;

Loader.prototype.update_ub = function ( ) {
	var ub = this.ub ;
	var n = this.solutions.list.length ;

	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.list[k];

		if ( solution.sat ) continue ;

		var id = solution.dimensions() ;

		if ( ub[id] === undefined || solution.score <= ub[id] ) {
			ub[id] = solution.score - 1 ;
		}

	}

} ;

Loader.prototype.update_lb = function ( ) {
	var lb = this.lb ;
	var n = this.solutions.list.length ;

	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.list[k];

		if ( !solution.sat ) continue ;

		var id = solution.dimensions() ;

		if ( lb[id] === undefined || solution.score > lb[id] ) {
			lb[id] = solution.score ;
		}

	}

} ;

Loader.prototype.update_tags = function ( ) {

	var n = this.solutions.list.length ;
	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.list[k];

		if ( !solution.sat ) {
			solution.html.root.classList.add( 'unsat' ) ;
		}

		else if ( solution.score === this.ub[solution.dimensions()] ) {
			solution.html.root.classList.add( 'opt' ) ;
		}

		else if ( solution.score === this.lb[solution.dimensions()] ) {
			solution.html.root.classList.add( 'best' ) ;
		}

	}

} ;

Loader.prototype.update_dom = function ( ) {
	var solutions = document.createElement('div');
	solutions.classList.add( 'solutions' );

	var n = this.solutions.list.length ;
	for (var k = 0 ; k < n ; ++k ) {
		var solution = this.solutions.list[k];
		solutions.appendChild( solution.html.root ) ;
	}

	document.getElementById('solutions-container').replaceChild(solutions,this.solutions.root);
	this.solutions.root = solutions;

} ;

Loader.prototype.update = function ( ) {

	var log = document.getElementById('log') ;
	log.classList.remove('status-error');
	log.classList.remove('status-ok');
	log.classList.add('status-pending');

	var loader = this ;
	loader.solutions.list.splice(0) ;

	var onreadystatechange = function ( event ) {
		var solution;
		if (event.target.readyState === XMLHttpRequest.DONE) {
			logGitHubAPIRequest( event ) ;
			if (event.target.status === 200) {
				var raw = event.target.responseText ;
				var object = JSON.parse(raw);
				if ( object.truncated ) {
					console.warning( 'output truncated') ;
					console.debug( 'event' , event ) ;
					console.debug( 'object' , object ) ;
				}
				var tree = object.tree ;
				var len = tree.length ;
				console.debug( len , 'objects in tree');
				for ( var i = 0 ; i < len ; ++i ) {
					console.debug( 'loading' , i + 1 , '/' , len ) ;
					solution = Solution.from( tree[i] ) ;
					if ( solution !== null ) {
						loader.solutions.list.push(solution) ;
					}
				}

				console.debug( loader.solutions.list.length , 'solutions loaded');
				loader.update_exponent( );
				loader.update_lb( );
				loader.update_ub( );
				loader.update_tags( );
				loader.update_dom( );

			}
		}

	} ;

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	request.open('GET', URL_TREE);
	request.send();

} ;

window.addEventListener( 'load' , function ( ) {
	var loader = new Loader();
	loader.update();
} ) ;
