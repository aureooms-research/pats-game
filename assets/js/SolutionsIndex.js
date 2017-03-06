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

	document.getElementById('main').classList.remove( 'help' );

	var solutions = this.solutions ;
	var index = this.index;

	var container = document.createElement('div');
	container.classList.add( 'container');


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

	if ( x > 0 ) {

		var output = document.createElement('div');
		output.classList.add( 'output');
		var header = document.createElement('div');
		header.classList.add( 'header' );
		var hcount = document.createElement('span');
		var hquery = document.createElement('span');
		var hinterpretation = document.createElement('span');
		hcount.classList.add('header-count');
		hquery.classList.add('header-query');
		hinterpretation.classList.add('header-interpretation');
		hcount.innerText = x ;
		hquery.innerText = this.query ;
		hinterpretation.innerText = this.predicate.description( ) ;
		header.appendChild(hcount);
		header.appendChild(hquery);
		header.appendChild(hinterpretation);
		output.appendChild( header ) ;
		output.appendChild( _solutions ) ;
		container.appendChild( output ) ;

	}

	else {

		var query = document.createElement('div');
		query.classList.add( 'query');
		query.innerText = this.query ;

		var interpretation = document.createElement('div');
		interpretation.classList.add( 'interpretation');
		interpretation.innerText = this.predicate.description( ) ;

		var help = document.createElement('a');
		help.classList.add( 'no-results-help' ) ;
		help.href = '#' + encodeURIComponent( JSON.stringify( { q : 'help' } ) ) ;
		help.innerHTML = '<b>Need help?</b> Click here or type <b class="emph">help</b> in the top left input field.' ;

		var noresults = document.createElement('div');
		noresults.classList.add( 'no-results');
		noresults.appendChild( query ) ;
		noresults.appendChild( interpretation ) ;

		container.appendChild( noresults ) ;
		container.appendChild( help ) ;

	}


	document.getElementById('search-output').replaceChild(container,index.output.container.root);
	index.output.container.root = container;

} ;

SolutionsIndex.Help = function ( index , query ) {
	this.index = index ;
	this.query = query ;
} ;

SolutionsIndex.Help.prototype.update_dom = function ( ) {

	var index = this.index;

	var container = document.createElement('div');
	container.classList.add( 'container' );
	document.getElementById('search-output').replaceChild(container,index.output.container.root);
	index.output.container.root = container;

	document.getElementById('main').classList.add( 'help' );

} ;


SolutionsIndex.prototype.update = function ( query , solutions ) {

	this.solutions.all = solutions ;

	solutions.sort( function ( a , b ) {
		if ( a.M !== b.M ) return a.M - b.M ;
		if ( a.N !== b.N ) return a.N - b.N ;
		if ( a.R !== b.R ) return a.R - b.R ;
		if ( a.score !== b.score ) return a.score - b.score ;
		if ( a.hash !== b.hash ) return a.hash < b.hash ? -1 : 1 ;
		return 0;
	} ) ;

	this.query( query ) ;

} ;

SolutionsIndex.prototype.query = function ( query ) {
	this._query( query , this.solutions.all ).update_dom( ) ;
} ;


SolutionsIndex.prototype._query = function ( query , solutions ) {

	var predicate;
	var formula = new Truth( ) ;

	var parts = query.split(' ');
	var len = parts.length ;
	for ( var k = 0 ; k < len ; ++k ) {

		var part = parts[k].toLowerCase() ;
		var neg = false ;

		while ( part.length > 0 && part[0] === '!' ) {
			neg = !neg ;
			part = part.substr(1);
		}

		if ( part === '' ) {
			continue ;
		}

		else if ( 'help'.indexOf( part ) === 0 ) {
			return new SolutionsIndex.Help( this , query ) ;
		}

		else if ( 'optimal'.indexOf( part ) === 0 ) {
			predicate = new Predicate(function ( s ) { return s.opt ; } , 'OPT' ) ;
		}

		else if ( 'best'.indexOf( part ) === 0 ) {
			predicate = new Predicate( function ( s ) { return s.best ; } , 'BEST' ) ;
		}

		else if ( 'square'.indexOf( part ) === 0 ) {
			predicate = new Predicate( function ( s ) { return s.M === s.N ; } , 'SQUARE' ) ;
		}

		else if ( 'cube'.indexOf( part ) === 0 ) {
			predicate = new Predicate( function ( s ) { return s.M === s.N && s.N === s.R ; } , 'CUBE' ) ;
		}

		else if ( 'unsat'.indexOf( part ) === 0 ) {
			predicate = new Predicate( function ( s ) { return !s.sat ; } , 'UNSAT' ) ;
		}

		else if ( part.indexOf( 'x' ) >= 0 ){
			predicate = new Predicate(
				( function ( sub ) {
					return function ( s ) {
						return s.dimensions().indexOf(sub) >= 0 ;
					} ;
				} ) ( part ) , '( DIM CONTAINS ' + part + ' )'
			) ;
		}

		else {
			predicate = new Predicate(
				( function ( sub ) {
					return function ( s ) {
						return s.hash.indexOf(sub) >= 0 ;
					} ;
				} ) ( part ) , '( HASH CONTAINS ' + part + ' )'
			) ;
		}

		if ( neg ) predicate = predicate.not( ) ;

		formula = formula.and( predicate ) ;

	}

	return new SolutionsIndex.Query( this , query , formula , solutions ) ;

} ;
