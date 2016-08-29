/**
 * Created by ryderbrooks on 8/25/16.
 */


const expireAfter = 3;
function cache(client) {
    "use strict";
    function add(url, cb) {
        client.set( url, true, function (err, ok) {
                        if (err) {
                            throw(
                                err
                            );
                        }
                        cb();
                    }
        );
        client.expireat( url, parseInt( (
                                            +new Date
                                        ) / 1000
                         ) + (
                                  86400 * expireAfter
                              )
        );
    }

    function check(url, cb) {
        client.exists( url, function (err, ok) {
                           if (err) {
                               throw(
                                   err
                               );
                           }
                           if (ok === 0) {
                               add( url, cb );
                           }
                       }
        );
    }

    return { add, check };
}
module.exports.cache = cache;
