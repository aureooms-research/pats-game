'use strict' ;

function debounce ( fn , delay ) {

	// only works with 0 args functions

	var timeoutId = null ;

	return function ( ) {

		if ( timeoutId !== null ) {
			window.clearTimeout( timeoutId ) ;
		}

		timeoutId = window.setTimeout( fn , delay ) ;

	} ;

}
