'use strict' ;

function SolutionsIndex ( ) {
	this.solutions = { all : [ ] } ;
	this.output = { container : { root : document.createElement( 'div' ) } } ;
	this.output.container.root.classList.add( 'container' );
	document.getElementById('search-output').appendChild(this.output.container.root);
}

SolutionsIndex.Query = function ( index , query , predicate , solutions ) {
	this.index = index ;
	this.query = query ;
	this.predicate = predicate ;
	this.solutions = solutions ;
} ;

SolutionsIndex.Query.prototype.update_dom = function ( ) {
	console.debug( 'update_dom') ;

	var solutions = this.solutions ;
	var index = this.index;

	var container = document.createElement('div');
	container.classList.add( 'container');
	var output = document.createElement('div');
	output.classList.add( 'output');
	var header = document.createElement('div');
	header.classList.add( 'header');
	var _solutions = document.createElement('div');
	_solutions.classList.add( 'solutions' );

	var n = solutions.length ;
	var x = 0 ;
	for (var k = 0 ; k < n ; ++k ) {
		var solution = solutions[k];
		if ( this.predicate.query( solution ) ) {
			_solutions.appendChild( solution.html().root ) ;
			++x;
		}
	}

	header.innerText = this.query + ' ' + this.predicate.description( ) + ' [' + x +']';

	output.appendChild( header ) ;
	output.appendChild( _solutions ) ;
	container.appendChild( output ) ;

	console.debug( 'update_dom') ;
	document.getElementById('search-output').replaceChild(container,index.output.container.root);
	index.output.container.root = container;
	console.debug( 'update_dom') ;

} ;

SolutionsIndex.Help = function ( index , query ) {
	this.index = index ;
	this.query = query ;
} ;

SolutionsIndex.Help.prototype.update_dom = function ( ) {
	var index = this.index;

	var container = document.createElement('div');
	container.classList.add( 'container');
	var output = document.createElement('div');
	output.classList.add( 'output');
	var header = document.createElement('div');
	header.classList.add( 'header');
	var _solutions = document.createElement('div');
	_solutions.classList.add( 'solutions' );

	header.innerText = this.query + ' (HELP) [0]';

	output.appendChild( header ) ;
	output.appendChild( _solutions ) ;
	container.appendChild( output ) ;

	document.getElementById('search-output').replaceChild(container,index.output.container.root);
	index.output.container.root = container;

} ;


SolutionsIndex.prototype.update = function ( solutions ) {
	this.solutions.all = solutions ;
	var query = this.query( document.getElementById( 'search' ).value ) ;
	this.query( query ) ;
} ;

SolutionsIndex.prototype.query = function ( query ) {
	this._query( query , this.solutions.all ).update_dom( ) ;
} ;


SolutionsIndex.prototype._query = function ( query , solutions ) {

	console.debug( '_query') ;
	var predicate;
	var formula = new Truth( ) ;
	console.debug( '_query') ;

	var parts = query.split(' ');
	var len = parts.length ;
	for ( var k = 0 ; k < len ; ++k ) {

		var part = parts[k] ;

		if ( part === '' ) {
			continue ;
		}

		else if ( part === 'h' ) {
			return new SolutionsIndex.Help( this , query ) ;
		}

		else if ( part === 'o' ) {
			predicate = new Predicate(function ( s ) { return s.opt ; } , 'OPT' ) ;
			formula = formula.and( predicate ) ;
		}

		else if ( part === 'b' ) {
			predicate = new Predicate( function ( s ) { return s.best ; } , 'BEST' ) ;
			formula = formula.and( predicate ) ;
		}

		else if ( part === 'u' ) {
			predicate = new Predicate( function ( s ) { return !s.sat ; } , 'UNSAT' ) ;
			formula = formula.and( predicate ) ;
		}

		else {
			predicate = new Predicate(
				( function ( sub ) {
					return function ( s ) {
						return s.dimensions().indexOf(sub) >= 0 ;
					} ;
				} ) ( part ) , '( DIM CONTAINS ' + part + ' )'
			) ;
			formula = formula.and( predicate ) ;
		}
	}

	return new SolutionsIndex.Query( this , query , formula , solutions ) ;

} ;
