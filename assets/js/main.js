'use strict' ;

window.addEventListener( 'load' , function ( ) {

	var DELAY_QUERY = 500 ;
	var DELAY_UPDATE = 60 * 1000 ;

	var loader = new SolutionsLoader();
	var index = new SolutionsIndex();

	var onupdate = function ( ) {
		console.debug('event update') ;
		loader.update( function ( solutions ) {
			var query = hashget().q ;
			index.update( query , solutions ) ;
		} ) ;
	} ;

	var oninput = function ( ) {
		console.debug('event input') ;
		var args = hashget() ;
		var q = document.getElementById( 'search' ).value ;
		hashset( Object.assign( args , { q : q } ) ) ;
		//index.query( q ) ; // NOT NEEDED SINCE WE TRIGGER A HASHCHANGE EVENT
	} ;

	var onhashchange = function ( ) {
		console.debug('event hashchange') ;
		var q = hashget().q ;
		document.getElementById( 'search' ).value = q ;
		index.query( q );
	} ;

	document.getElementById( 'search' ).value = hashget().q ;

	onupdate();

	window.setInterval( onupdate , DELAY_UPDATE ) ;

	window.addEventListener( 'hashchange' , onhashchange ) ;

	document.getElementById( 'search' ).addEventListener( 'input' , debounce( oninput , DELAY_QUERY ) ) ;

} ) ;
