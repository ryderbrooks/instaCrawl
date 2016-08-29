/**
 * Created by ryderbrooks on 8/11/16.
 */
var app = require("../../app");
var config = require("./.config.json")[app.get('env')];

const _port = config.redis.port;
const _host = config.redis.host;


var client;
var redis = require( "redis" );
var {init_events} = require( "./lib/utils/constants" );
function createConnection({iEmitter, port=_port, host=_host}) {
    if (client === undefined) {
        client = redis.createClient( port, host );
        client.on( "ready", function () {
            "use strict";
            iEmitter.emit( init_events.REDIS_CONNECTED, client );
        }
        )
    }
}
module.exports.connect = createConnection;
module.exports.client = client;
/**
 * Created by ryderbrooks on 8/25/16.
 */

