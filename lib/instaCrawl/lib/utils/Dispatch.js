const EventEmitter = require( "events" ),
    amqp = require( "../messeging/amqpConn" ),
    {DBwrite} = require( "../DB/write" ),
    {cache} = require( "./cache" ),
    {app_events, init_events, queues} = require( "./constants" ),
    app = require("../../../../app" ),
    config = require("../../.config.json")[app.get('env')];


let publish,
    distribute = require( "../messeging/distributer" ),
    phRequest = require( "../requests/phantom_request" ),
    parseObjects = require( "./parseObjects" ),
    redisClient,
    cacheCheck;



class Dispatch extends EventEmitter {}
const dispatch = new Dispatch();



phRequest = phRequest.bindEmitter( dispatch );
parseObjects = parseObjects( dispatch );
distribute = distribute( parseObjects );

let consumerMap = {
    [queues.PHANTOM]: {queue: queues.PHANTOM, work: phRequest},
    [queues.PARSE]: {queue:queues.PARSE, work: distribute},
    [queues.WRITE]: {queue:queues.WRITE, work: DBwrite},
};

let runningConsumerMap = {
    [queues.PHANTOM]: null,
    [queues.PARSE]: null,
    [queues.WRITE]: null,
}


function initConsumers() {
    for (let i in config.consume) {
        if (config.consume[i]) {
            let {work, queue} = consumerMap[i];
            runningConsumerMap[i] = amqp.consumer({queue, work});
        }
    }
}

// init events
dispatch.on( init_events.REDIS_CONNECTED, function (client) {
                 "use strict";
                 console.log( "REDIS CONNECTED" );
                 redisClient = client;
                 cacheCheck = cache( client );
                 amqp.amqpConnect( dispatch, client );
             }
);
dispatch.on( init_events.AMQP_CONNECTED, function () {
                 "use strict";
             }
);
dispatch.on( init_events.AMQP_PUBLISHER_RUNNING, function (publisher) {
                 "use strict";
                 publish = publisher;
                 initConsumers();
             }
);
dispatch.on( init_events.AMQP_CONSUMER_BOUND, function () {
                 "use strict";
             }
);
// app events
dispatch.on( app_events.SUMBIT_REQUEST, function (url) {
                 "use strict";
                 // publish to amqp network request queue
                 //console.log("SUBMITTING REQUEST TO ---> ", url);
                 function c() {
                     publish( url, queues.PHANTOM );
                 }

                 cacheCheck.check( url, c );
             }
);
dispatch.on( app_events.SUBMIT_WRITE, function (query) {
                 "use strict";
                 // publish to amqp DB write queue
                 publish( JSON.stringify( query ), queues.WRITE );
             }
);
dispatch.on( app_events.REQUEST_COMPLETE, function (data, url) {
                 "use strict";
                 // publish to amqp parse queue
                 function p() {
                     publish( JSON.stringify( data ), queues.PARSE );
                 }

                 cacheCheck.add( url, p );
             }
);
dispatch.on( app_events.TEST, function (data) {
                 "use strict";
                 // publish to amqp parse queue
                 let url = `http://www.instagram.com/explore/tags/${data}`;
                 publish( queues.PHANTOM, url );
             }
);
module.exports = dispatch;