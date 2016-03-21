'use strict' ;

window.addEventListener( 'load' , function ( ) {

	var DELAY_QUERY = 500 ;
	var DELAY_UPDATE = 60 * 1000 ;

	var loader = new SolutionsLoader();
	var index = new SolutionsIndex();

	var update = function ( ) {
		loader.update( function ( solutions ) {
			var query = document.getElementById( 'search' ).value ;
			index.update( query , solutions ) ;
		} ) ;
	} ;

	update();
	window.setInterval( update , DELAY_UPDATE ) ;

	var query = function ( ) {
		var q = document.getElementById( 'search' ).value ;
		index.query( q ) ;
	} ;

	document.getElementById( 'search' ).addEventListener( 'input' , debounce( query , DELAY_QUERY ) ) ;

} ) ;
