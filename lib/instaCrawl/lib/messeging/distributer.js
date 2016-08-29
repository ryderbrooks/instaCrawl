/**
 * Created by ryderbrooks on 8/25/16.
 */

const parse = require( "../utils/nParse" ).parse,
    _ = require( "underscore" );
function wrap(parseObjects) {
    return function distribute(data, ack) {
        "use strict";
        data = JSON.parse( data );
        let d = data.entry_data;

        function _emitt(pObj) {
            "use strict";
            let z = parse( pObj, data );
            if (_.isArray( z )) {
                z.forEach( function (v) {
                               v.emit_result();
                           }
                )
            } else if (_.isFunction( z.emit_result )) {
                z.emit_result();
            }
        }

        function run(I) {
            let p = parseObjects[ I ];
            let keys = Object.keys( p );
            keys.forEach( function (v) {
                              _emitt( p[ v ] );
                          }
            )
        }

        switch ( true ) {
            case (
                _.isObject( d.PostPage )
            ):
                // check for is_add, comments_disabled
                run( "PostPage" );
                break;
            case (
                _.isObject( d.ProfilePage )
            ):
                run( "ProfilePage" );
                break;
            case (
                _.isObject( d.TagPage )
            ):
                run( "TagPage" );
                break;
            default:
                console.log( "No request hits ", parseObjects, d );
        }
        ack( true );
    }
}
module.exports = wrap;