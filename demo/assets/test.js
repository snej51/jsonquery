/* begin demo script */
var o = {
    "test123": {
      "test1234": [{
          "test12345": "test12345",
          "keyuz72782": "mklnweuheuhf"
        }, {
          "test145": "test12",
          "keyuz72782": "mklnwf"
        }, {
          "testAbejdj": "7euifbkr3z088",
          "keyuz72782": "zsebhqio238"
        }]
      }
    },
    n = new JsonQuery( o ),
    result = n
      .from( 'test123.test1234' )
      .where( { 'test12345': 'test12345'} )
      .set( {'keyuz72782': 'changed!'} )
      .select();

console.log( n );
console.log( result );
console.log( o );
/* end demo script */
