/**
 * Created by ryderbrooks on 8/17/16.
 */
var redis = require( "./redisClient" );
var iEmitter = require( "./lib/utils/Dispatch.js" );
redis.connect( { iEmitter } );
