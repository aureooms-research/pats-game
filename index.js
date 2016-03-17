'use strict' ;

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

function Solution ( M , N , R , score , hash , metadata ) {
	this.M = M ;
	this.N = N ;
	this.R = R ;
	this.score = score ;
	this.hash = hash ;
	this.metadata = metadata ;
	this.moves = null ;
	this.html = this.inithtml();
	this.lazyload();
}

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
		rows :{ root: document.createElement('span') } ,
		columns :{ root: document.createElement('span') } ,
		rounds :{ root: document.createElement('span') } ,
		score :{ root: document.createElement('span') } ,
		bestknown :{ root: document.createElement('span') } ,
		optimal :{ root: document.createElement('span') } ,
		hash :{ root: document.createElement('a') }
	};

	head.root.classList.add('head');

	head.rows.root.innerText = this.M ;
	head.rows.root.classList.add('rows');
	head.columns.root.innerText = this.N ;
	head.columns.root.classList.add('columns');
	head.rounds.root.innerText = this.R ;
	head.rounds.root.classList.add('rounds');
	head.score.root.innerText = this.score ;
	head.score.root.classList.add('score');
	head.bestknown.root.innerText = 'best' ;
	head.bestknown.root.classList.add('bestknown');
	head.optimal.root.innerText = 'opt' ;
	head.optimal.root.classList.add('optimal');
	head.hash.root.innerText = this.hash ;
	head.hash.root.href = ROOT + this.metadata.path ;
	head.hash.root.classList.add('hash');

	head.root.appendChild(head.rows.root);
	head.root.appendChild(head.columns.root);
	head.root.appendChild(head.rounds.root);
	head.root.appendChild(head.score.root);
	head.root.appendChild(head.bestknown.root);
	head.root.appendChild(head.optimal.root);
	head.root.appendChild(head.hash.root);

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
	var _moves = lines.slice(2);
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
	if ( parts.length < 3 ) return null ;

	// this is a path to a solution
	var dimensions = parts[0].split('x') ;
	var rows = parseInt(dimensions[0]);
	var columns = parseInt(dimensions[1]);
	var rounds = parseInt(dimensions[2]);
	var score = parseInt(parts[1]);
	var hash = parts[2];

	return new Solution( rows , columns , rounds , score , hash , metadata ) ;

} ;

Solution.prototype.lazyload = function ( ) {

	var solution = this ;

	var onreadystatechange = function ( event ) {
		 if (event.target.readyState === XMLHttpRequest.DONE) {
			if (event.target.status === 200) {
				var response = event.target.responseText ;
				var object = JSON.parse(response);
				if (object.encoding !== 'base64'){
					console.error('wrong encoding');
					console.debug('event',event);
					console.debug('object',object);
					return ;
				}
				var len = object.content.length ;
				var raw = atob(object.content.substr(0,len-1));
				var moves = Solution.parse_moves( raw ) ;
				solution.moves = moves ;
				var grid = solution._html_grid( ) ;
				solution.html.body.root.replaceChild(grid.root, solution.html.body.grid.root);
				solution.html.body.grid = grid ;
			} else {
				console.error('There was a problem with the request.');
				console.debug( 'event', event);
			}
		}
	}

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	var url = solution.metadata.url ;
	request.open('GET', url);
	request.send();

} ;


var Loader = function ( ) {
	this.solutions = [ ] ;
} ;

Loader.prototype.update = function ( ) {

	var loader = this ;
	loader.solutions.splice(0) ;

	var onreadystatechange = function ( event ) {
		 if (event.target.readyState === XMLHttpRequest.DONE) {
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
					var solution = Solution.from( tree[i] ) ;
					if ( solution !== null ) {
						loader.solutions.push(solution) ;
						document.getElementById('solutions').appendChild(solution.html.root);
					}
				}

				var best = 3/2;
				var n = loader.solutions.length ;
				console.debug( n , 'solutions loaded');
				for (var k = 0 ; k < n ; ++k ) {
					var solution = loader.solutions[k];
					if ( solution.M === solution.N && solution.N === solution.R ) {
						var a = Math.log(solution.score) / Math.log(solution.M) ;
						if ( a > best ) best = a ;
					}
				}
				document.getElementById('exponent').innerText = best ;
			} else {
				console.error('There was a problem with the request.');
				console.debug('event' , event);
			}
		}

	} ;

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	request.open('GET', URL_TREE);
	request.send();

} ;

var loader = new Loader();
loader.update();
