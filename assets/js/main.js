'use strict' ;

window.addEventListener( 'load' , function ( ) {
	var loader = new SolutionsLoader();
	var index = new SolutionsIndex();

	var update = function ( ) {
		loader.update( function ( solutions ) {
			index.update( solutions ) ;
		} ) ;
	} ;

	update();
	window.setInterval( update , 60 * 1000 ) ;

} ) ;
