function AbstractPredicate ( ) { }

AbstractPredicate.prototype.and = function ( other ) {
	return new Conjunction( this , other ) ;
} ;

AbstractPredicate.prototype.or = function ( other ) {
	return new Disjunction( this , other ) ;
} ;

AbstractPredicate.prototype.not = function ( ) {
	return new Negation( this ) ;
} ;

function Truth ( ) { }

Truth.prototype = new AbstractPredicate( ) ;

Truth.prototype.and = function ( other ) {
	return other ;
} ;

Truth.prototype.or = function ( other ) {
	return this ;
} ;

Truth.prototype.not = function ( ) {
	return new Untruth( ) ;
} ;

Truth.prototype.description = function ( ) {
	return 'TRUTH' ;
} ;

Truth.prototype.query = function ( subject ) {
	return true ;
} ;

function Untruth ( ) { }

Untruth.prototype = new AbstractPredicate( ) ;

Untruth.prototype.and = function ( other ) {
	return this ;
} ;

Untruth.prototype.or = function ( other ) {
	return other ;
} ;

Untruth.prototype.not = function ( ) {
	return new Truth( ) ;
} ;

Untruth.prototype.description = function ( ) {
	return 'UNTRUTH' ;
} ;

Untruth.prototype.query = function ( subject ) {
	return false ;
} ;



function Predicate ( callable , description ) {
	this._callable = callable ;
	this._description = description ;
}

Predicate.prototype = new AbstractPredicate( ) ;

Predicate.prototype.description = function ( ) {
	return this._description ;
} ;

Predicate.prototype.query = function ( subject ) {
	return this._callable( subject ) ;
} ;


function Conjunction ( left , right ) {
	this.left = left ;
	this.right = right ;
}

Conjunction.prototype = new AbstractPredicate( ) ;

Conjunction.prototype.description = function ( ) {
	return '( ' + this.left.description() + ' AND ' + this.right.description() + ' )' ;
} ;

Conjunction.prototype.query = function ( subject ) {
	return this.left.query( subject ) && this.right.query( subject ) ;
} ;


function Disjunction ( left , right ) {
	this.left = left ;
	this.right = right ;
}

Disjunction.prototype = new AbstractPredicate( ) ;

Disjunction.prototype.description = function ( ) {
	return '( ' + this.left.description() + ' OR ' + this.right.description() + ' )' ;
} ;

Disjunction.prototype.query = function ( subject ) {
	return this.left.query( subject ) || this.right.query( subject ) ;
} ;


function Negation ( predicate ) {
	this.predicate = predicate ;
}

Negation.prototype = new AbstractPredicate( ) ;

Negation.prototype.description = function ( ) {
	return '( NOT ' + this.predicate.description() + ' )' ;
} ;

Negation.prototype.query = function ( subject ) {
	return !this.predicate.query( subject ) ;
} ;
