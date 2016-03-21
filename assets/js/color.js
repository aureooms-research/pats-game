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

Color.fromhex = function ( hex ) {
	if ( hex[0] === '#' ) hex = hex.substr(1);
	var red = parseInt(hex.substr(0,2),16);
	var green = parseInt(hex.substr(2,2),16);
	var blue = parseInt(hex.substr(4,2),16);
	return new Color( red , green , blue ) ;
} ;

