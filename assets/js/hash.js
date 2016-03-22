'use strict';

function hashget ( ) {

	var hash = decodeURIComponent( window.location.hash.substr(1) ) ;
	var args = { q : 'b' } ;

	try {
		Object.assign( args , JSON.parse( hash ) ) ;
	}

	catch ( e ) {
		console.debug( 'could not parse hash' , hash ) ;
		console.debug( 'outputing default args object' , args ) ;
	}

	return args ;
}

function hashset ( object ) {
	window.location.hash = hashpart( object ) ;
}

function hashpart ( object ) {
	return '#' + encodeURIComponent( JSON.stringify( object ) ) ;
}
