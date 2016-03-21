'use strict' ;

function SolutionsLoader ( ) {

	this.solutions = { all : [ ] } ;
	this.lb = { } ;
	this.ub = { } ;

}

SolutionsLoader.prototype.update_exponent = function ( ){
	var best = 3/2 ;
	var html = '3/2 = 1.5' ;
	var n = this.solutions.all.length ;
	for (var k = 0 ; k < n ; ++k ) {
		var solution = this.solutions.all[k];
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

SolutionsLoader.prototype.update_ub = function ( ) {
	var ub = this.ub ;
	var n = this.solutions.all.length ;

	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.all[k];

		if ( solution.sat ) continue ;

		var id = solution.dimensions() ;

		if ( ub[id] === undefined || solution.score <= ub[id] ) {
			ub[id] = solution.score - 1 ;
		}

	}

} ;

SolutionsLoader.prototype.update_lb = function ( ) {
	var lb = this.lb ;
	var n = this.solutions.all.length ;

	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.all[k];

		if ( !solution.sat ) continue ;

		var id = solution.dimensions() ;

		if ( lb[id] === undefined || solution.score > lb[id] ) {
			lb[id] = solution.score ;
		}

	}

} ;

SolutionsLoader.prototype.update_tags = function ( ) {

	var n = this.solutions.all.length ;
	for (var k = 0 ; k < n ; ++k ) {

		var solution = this.solutions.all[k];

		if ( !solution.sat ) {
			solution.html().root.classList.add( 'unsat' ) ;
		}

		else if ( solution.score === this.ub[solution.dimensions()] ) {
			solution.opt = true ;
			solution.best = true ;
			solution.html().root.classList.add( 'opt' ) ;
		}

		else if ( solution.score === this.lb[solution.dimensions()] ) {
			solution.best = true ;
			solution.html().root.classList.add( 'best' ) ;
		}

	}

} ;

SolutionsLoader.prototype.update = function ( callback ) {

	var log = document.getElementById('log') ;
	log.classList.remove('status-error');
	log.classList.remove('status-ok');
	log.classList.add('status-pending');

	var loader = this ;
	loader.solutions.all.splice(0) ;

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
						loader.solutions.all.push(solution) ;
					}
				}

				console.debug( loader.solutions.all.length , 'solutions loaded');
				loader.update_exponent( );
				loader.update_lb( );
				loader.update_ub( );
				loader.update_tags( );

				callback( loader.solutions.all ) ;

			}
		}

	} ;

	var request = new XMLHttpRequest();
	request.onreadystatechange = onreadystatechange ;
	request.open('GET', URL_TREE);
	request.send();

} ;
