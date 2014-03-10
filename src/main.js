/**
 *
 * @param JSON
 * @constructor
 */
var JsonQuery = function ( JSON ) {
  this.JSON = JSON
};
JsonQuery.prototype = {
  /**
   *
   * @param path
   */
  select: function ( path ) {
    return this;
  },
  /**
   *
   * @param path
   */
  remove: function ( path ) {
    return this;
  },
  /**
   *
   * @param path
   */
  update: function ( path ) {
    return this;
  },
  /**
   *
   * @param path
   */
  insert: function ( path ) {
    return this;
  },
  /**
   *
   * @param query
   */
  where: function ( query ) {
    return this;
  },
  /**
   *
   * @param data
   */
  set: function ( data ) {
    return this;
  },
  /**
   *
   * @param expr
   */
  sortBy : function ( expr ) {
    return this;
  },
  /**
   *
   * @param arr
   */
  isArray: function ( arr ) {
    return this;
  },
  /**
   *
   * @param obj
   */
  isObject: function ( obj ) {
    return this;
  }
};


