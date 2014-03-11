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
  global.JsonQuery = factory(global);

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
      this.properties = path.split( '.' );
      this.index = -1;
      this.lastIndex = this.properties.length - 1;
      while ( ++ this.index <= this.lastIndex ) {
        if ( this.data.hasOwnProperty( this.properties[this.index] ) ) {
          this.data = this.data[this.properties[this.index]];
        } else {
          this.e = new ShowError( 'from' , 'traverse failed because property ' + this.properties[this.index] + ' not found' );
          this.e.failedAt = this.properties.slice( 0, this.index + 1).join( '.' );
          throw this.e;
        }
      }
      return this;
    },
    /**
     *
     * @param key {string}
     */
    remove: function ( key ) {
      if( key ) {
        if( this.data.hasOwnProperty( key ) ) {
          delete this.data[key];
        } else {
          this.e = new ShowError( 'remove' , 'remove failed because key does not exist');
          this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
          throw this.e;
        }
      } else {
        this.e = new ShowError( 'remove' , 'remove failed because key not defined');
        this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
        throw this.e;
      }
      return this;
    },
    /**
     *
     * @param key
     * @returns {JsonQuery}
     */
    insert: function ( key ) {
      if( key ) {
        if( !this.data.hasOwnProperty( key ) ) {
          this.data[key] = '';
        } else {
          this.e = new ShowError( 'insert' , 'insert failed because key already exist');
          this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
          throw this.e;
        }
      } else {
        this.e = new ShowError( 'insert' , 'insert failed because key not defined');
        this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
        throw this.e;
      }
      return this;
    },
    /**
     *
     * @param query
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
                  op = query[key].search(/(&&)/) > -1 ? 'and': ( query[key].search(/([||])/) > -1 ? 'or' : null );
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
          } else {
            this.e = new ShowError( 'where' , 'where failed because query is malformed' );
            this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
            throw this.e;
          }
        } else {
          this.e = new ShowError( 'where' , 'where failed because data is object' );
          this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
          throw this.e;
        }
      } else {
        this.e = new ShowError( 'where' , 'where failed because query is not defined' );
        this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
        throw this.e;
      }
      this.data = result.length < 2 ? result[0] : result;
      return this;
    },
    /**
     *
     * @param data
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
                } else {
                  this.e = new ShowError( 'set' , 'set failed because key ' + key + ' was not found' );
                  this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
                  throw this.e;
                }
              }
            } else {
              if( this.data.hasOwnProperty( key ) ) {
                this.data[key] = data[key];
              } else {
                this.e = new ShowError( 'set' , 'set failed because key ' + key + ' was not found' );
                this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
                throw this.e;
              }
            }
          }
        }
      } else {
        this.e = new ShowError( 'set' , 'set failed because no data was provided' );
        this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
        throw this.e;
      }
      return this;
    },
    /**
     *
     * @param key {string}
     * @param type {string}
     * @param dir {string} asc -> ascending, desc -> descending
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
        } else {
          this.e = new ShowError( 'sort' , 'sort failed because data is not an array' );
          this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
          throw this.e;
        }
      } else {
        this.e = new ShowError( 'sort' , 'sort failed because too few arguments defined' );
        this.e.failedAt = this.properties.slice(0, this.index + 1).join('.');
        throw this.e;
      }
      return this;
    },
    /**
     *
     * @param root
     * @param resultKey
     * @returns {*}
     */
    select : function ( root, resultKey ) {
      var result;
      if( root ) {
        result = resultKey ? this.root[resultKey] : this.root;
      } else {
        result = resultKey ? this.data[resultKey] : this.data;
      }
      return result;
    },
    /**
     *
     * @returns {boolean}
     */
    is: function ( obj, type ) {
      return Object.prototype.toString.call( obj ) === '[object ' + ( type.charAt(0).toUpperCase() + type.slice(1) )+ ']';
    }
  };
  return function (data) {
    return new JsonQuery(data);
  };
}));