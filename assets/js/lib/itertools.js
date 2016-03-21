function* filter ( predicate ,  iterable ) {
	for ( let element of iterable ) {
		if ( predicate( element ) ) {
			yield element ;
		}
	}
}
