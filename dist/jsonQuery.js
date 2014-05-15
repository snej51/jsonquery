'use strict';
(function (global, factory) {

    // CommonJS (node) module
    if (typeof module === 'object' && module.exports) {
        module.exports = factory( global );
    }

    // AMD module
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(global);
        });
    }

    // browser
    global.jsonQuery = factory(global);

}( this, function (global, undefined) {
    /**
     *
     * @param data {JSON}
     * @constructor
     */
    var JsonQuery = function( data ) {
        this.data = data || {};
        this.properties = null;
        this.root = data || {};
    };
    /**
     *
     * @param operation
     * @param message
     * @constructor
     */
    var ShowError = function( operation, message ) {
        if (arguments.length === 1) {
            message = operation;
            operation = '';
        }
        Error.call(this, message);
        this.name = 'ShowError';
        this.operation = operation;
    };
    ShowError.prototype = new Error();
    ShowError.prototype.constructor = ShowError;

    JsonQuery.prototype = {
        /**
         *
         * @param path {String}
         */
        from: function ( path ) {
            var i,
                len,
                tmp = [];
            this.properties = path.split( '.' );
            this.index = -1;
            this.lastIndex = this.properties.length - 1;
            while ( ++ this.index <= this.lastIndex ) {
                if( this.is( this.data, 'array') ) {
                    len = this.data.length;
                    for ( i = 0; i < len; i += 1 ) {
                        if ( this.data[i].hasOwnProperty( this.properties[this.index] ) ) {
                            this.data[i] = this.data[i][this.properties[this.index]];
                            tmp.push( this.data[i] );
                        } else {
                            this.data = null;
                        }
                    }
                    this.data = tmp;
                } else {
                    if ( this.data.hasOwnProperty( this.properties[this.index] ) ) {
                        this.data = this.data[this.properties[this.index]];
                    } else {
                        this.data = null;
                    }
                }
            }
            return this;
        },
        /**
         * removes an key from the actual data set
         * @param key {string} the key which should be removed from the actual data set
         */
        remove: function ( key ) {
            var i,
                len;
            if( key ) {
                if ( this.is( this.data, 'array') ) {
                    len = this.data.length;
                    for ( i = 0; i < len; i += 1 ) {
                        if( this.data[i].hasOwnProperty( key ) ) {
                            delete this.data[i][key];
                        }
                    }
                } else {
                    if( this.data.hasOwnProperty( key ) ) {
                        delete this.data[key];
                    }
                }
            }
            return this;
        },
        /**
         * inserts keys and values to the actual data set
         * @param data {object} object literal with the key value pairs for inserting the keys and values
         * @returns {JsonQuery}
         */
        insert: function ( data ) {
            var key,
                i,
                len;
            if( data ) {
                for ( key in data ) {
                    if ( data.hasOwnProperty( key ) ) {
                        if( this.is( this.data, 'array' ) ){
                            len = this.data.length;
                            for ( i = 0; i < len; i += 1 ) {
                                if( !this.data[i].hasOwnProperty( key ) ) {
                                    this.data[i][key] = data[key];
                                }
                            }
                        } else {
                            if( !this.data.hasOwnProperty( key ) ) {
                                this.data[key] = data[key];
                            }
                        }
                    }
                }
            }
            return this;
        },
        /**
         * queries the actual data set with an provided filter object
         * @param query {object} object literal with key value pairs which describe the filter
         * @returns {JsonQuery}
         */
        where: function ( query ) {
            var found = [],
                result = [],
                qLen = Object.keys( query ).length,
                key,
                op,
                left,
                right,
                i,
                dLen;
            if( query ) {
                if( this.is( this.data, 'array' ) ) {
                    if( this.is( query, 'object' ) ) {
                        dLen = this.data.length;
                        for ( i = 0; i < dLen; i += 1 ) {
                            found.length = 0;
                            for ( key in query ) {
                                if( query.hasOwnProperty( key ) ) {
                                    op = query[key] ? ( typeof ( query[key] ) === 'string' ? ( query[key].search(/(&&)/) > -1 ? 'and': ( query[key].search(/([||])/) > -1 ? 'or' : null ) ): null ): null;
                                    if( op ) {
                                        if ( op === 'and' ) {
                                            left = query[key].split( ' && ' )[0];
                                            right = query[key].split( ' && ' )[1];
                                            if( query[i][key] === left && query[i][key] === right ) {
                                                found.push( 'found' );
                                            }
                                        } else if ( op === 'or' ) {
                                            left = query[key].split( ' || ' )[0];
                                            right = query[key].split( ' || ' )[1];
                                            if( query[i][key] === left || query[i][key] === right ) {
                                                found.push( 'found' );
                                            }
                                        }
                                    } else {
                                        if ( this.data[i][key] === query[key] ){
                                            found.push( 'found' );
                                        }
                                    }
                                }
                            }
                            if( found.length === qLen ) {
                                result.push( this.data[i] );
                            }
                        }
                    }
                }
            }
            this.data = result.length < 2 ? result[0] : result;
            return this;
        },
        /**
         * sets the values in the actual data sets from the provided data object
         * @param data {object} object literal with the key value pairs for setting the values
         * @returns {JsonQuery}
         */
        set: function ( data ) {
            var key,
                i,
                len;
            if( data ) {
                for ( key in data ) {
                    if ( data.hasOwnProperty( key ) ) {
                        if( this.is( this.data, 'array' ) ){
                            len = this.data.length;
                            for ( i = 0; i < len; i += 1 ) {
                                if( this.data[i].hasOwnProperty( key ) ) {
                                    this.data[i][key] = data[key];
                                }
                            }
                        } else {
                            if( this.data.hasOwnProperty( key ) ) {
                                this.data[key] = data[key];
                            }
                        }
                    }
                }
            }
            return this;
        },
        /**
         * sorts an array / collection
         * @param key {string} an key for sorting
         * @param type {string} the type of the key for switching to case incentive mode
         * @param dir {string} asc -> ascending, desc -> descending
         * @returns {JsonQuery}
         */
        sort : function ( key, type, dir ) {
            if( arguments.length === 3 ) {
                if( this.is( this.data, 'array' ) ) {
                    this.data.sort( function () {
                        var result;
                        if( dir === 'asc' ) {
                            result = function ( a, b ) {
                                var pos;
                                if( type === 'string' ) {
                                    if ( a[key].toLowerCase() < b[key].toLowerCase() ) {
                                        pos = -1;
                                    } else if ( a[key].toLowerCase() > b[key].toLowerCase() ) {
                                        pos = 1;
                                    } else {
                                        pos = 0;
                                    }
                                } else {
                                    if (a[key] < b[key]) {
                                        pos = -1;
                                    } else if ( a[key] > b[key] ) {
                                        pos = 1;
                                    } else {
                                        pos = 0;
                                    }
                                }
                                return pos;
                            };
                        } else {
                            result = function ( b, a ) {
                                var pos;
                                if( type === 'string' ) {
                                    if ( a[key].toLowerCase() < b[key].toLowerCase() ) {
                                        pos = -1;
                                    } else if ( a[key].toLowerCase() > b[key].toLowerCase() ) {
                                        pos = 1;
                                    } else {
                                        pos = 0;
                                    }
                                } else {
                                    if (a[key] < b[key]) {
                                        pos = -1;
                                    } else if ( a[key] > b[key] ) {
                                        pos = 1;
                                    } else {
                                        pos = 0;
                                    }
                                }
                                return pos;
                            };
                        }
                        return result;
                    });
                }
            }
            return this;
        },
        /**
         *
         * @param root {boolean} if true the root element is returned back
         * @param resultKey {string} if provided the method looks for the key and returns it value
         * @returns {*}
         */
        select : function ( root, resultKey ) {
            var result,
                data = root ? this.root : this.data,
                i,
                len;
            if( resultKey ) {
                if( this.is( data, 'array') ) {
                    len = data.length;
                    result = [];
                    for ( i = 0; i < len; i += 1 ) {
                        if( data[i].hasOwnProperty( resultKey ) ) {
                            result.push( data[i][resultKey] );
                        } else {
                            result = null;
                        }
                    }
                } else {
                    if( data.hasOwnProperty( resultKey ) ) {
                        result = data[resultKey];
                    } else {
                        result = null;
                    }
                }
            } else {
                result = data;
            }
            return result ? ( this.is( result, 'array') ? ( result.length < 2 ? result[0] : result ) : result ) : result;
        },
        /**
         * checks the type of an value against an provided type
         * @param val {*} the value to be checked
         * @param type {String} the type to check against
         * @returns {boolean}
         */
        is: function ( val, type ) {
            return Object.prototype.toString.call( val ) === '[object ' + ( type.charAt(0).toUpperCase() + type.slice(1) )+ ']';
        },
        /**
         * extends the target data object by copying all key value pairs from the provided source object to the target object
         * works only with objects
         * @param target {object} the target object
         * @param source {object} the source object
         */
        extend: function ( target, source ) {
            var key;
            if (source) {
                if( this.is( this.data, 'object' ) ) {
                    for( key in source ) {
                        if( source.hasOwnProperty( key ) ) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        },
        /**
         * create a (shallow-cloned) duplicate of an object.
         * @returns {JsonQuery}
         */
        clone: function () {
            if( this.is( this.data, 'object') ) {
                this.data  = this.extend({}, this.data );
            } else if( this.is( this.data, 'array') ) {
                this.data = this.data.slice(0);
            }
            return this;
        },
        /**
         * Traverses an object literal along `path` and returns true
         * or false if the path exists.
         * @param {String} path in the form of `foo.bar.baz`
         * @return {Boolean}
         */
        resolve: function ( path ) {
            var properties = path.split('.'),
                value = this.data,
                index = -1,
                lastIndex = properties.length - 1;
            while ( ++index <= lastIndex ) {
                if ( !value.hasOwnProperty( properties[index] ) ) {
                    return false;
                }
                value = value[properties[index]];
            }
            return true;
        },
        /**
         * Plants a value at a path, creating the graph if it does not exist. All
         * segments in the path are treated as object properties.
         * @param {String} path
         * @param {*} value
         * @return
         */
        plant: function ( path, value ) {
            if (!path) {
                return;
            }

            var current = this.data,
                segments = path.split( '.' ),
                position = 0,
                length = segments.length,
                segment;

            function isMore() {
                return position < length;
            }

            function isLast() {
                return position === (length - 1);
            }

            while ( isMore() ) {
                segment = segments[position];
                if ( !current.hasOwnProperty( segment ) ) {
                    current[segment] = {};
                }
                if ( isLast() ) {
                    current[segment] = value;
                }
                current = current[segment];
                position += 1;
            }
        }
    };
    return function (data) {
        return new JsonQuery(data);
    };
}));