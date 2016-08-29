var amqp = require( 'amqplib/callback_api' );
var _amqpConn = null;
const {init_events} = require( "../utils/constants" );

var app = require("../../../../app");
var config = require("../../.config.json")[app.get('env')];

const host = `amqp://${config.amqp.user}:${config.amqp.password}@${config.amqp.host}:${config.amqp.port}`;

var redisClient,
    iEmitter;

function AMQPconnect(_iEmitter, _redisClient) {
    iEmitter = _iEmitter;
    if (!redisClient) {
        redisClient = _redisClient;
    }
    function onError(err) {
        "use strict";
        if (err.message !== "Connection closing") {
            console.error(
                "[AMQP] conn error",
                err
            );
        }
    }

    function onClose() {
        "use strict";
        console.error( "[AMQP] reconnecting" );
        return setTimeout(
            start,
            1000
        );
    }

    if (_amqpConn === null) {
        amqp.connect(
            host,
            function (err, conn) {
                if (err) {
                    console.error(
                        "[AMQP]",
                        err
                    );
                    //return setTimeout(
                    //    start,
                    //    1000
                    //);
                }
                conn.on( "error", onError );
                conn.on( "close", onClose );
                console.log( "[AMQP] connected" );
                _amqpConn = conn;
                iEmitter.emit( init_events.AMQP_CONNECTED );
                Publisher();
            }
        )
    }
}

module.exports.amqpConnect = AMQPconnect;



function Publisher() {
    "use strict";
    var pubChannel,
        offlineQueue = new Set();
    // create a persist offline queue event?
    function persistOfflineQueue() {
        redisClient.set( "offlinePubQueue", [ ...offlineQueue ] );
    }

    function pushToOfflineQueue(header, content) {
        var key = JSON.stringify( { header: header, content: content } );
        offlineQueue.add( key );
    }

    function pullFromOfflineQueue() {
        var n = [ ...offlineQueue ][ 0 ];
        if (n) {
            offlineQueue.delete( n );
            return JSON.parse( n );
        }
    }

    function closeOnErr(err) {
        if (!err) {
            return false;
        }
        console.error(
            "[AMQP] error: publisher",
            err
        );
        amqpConn.close();
        bound = null;
        return true;
    }


    function publish(content, queue) {
        pubChannel.assertQueue( queue, { durable: true } );
        pubChannel.sendToQueue(
            queue,
            new Buffer( content ),
            { persistent: true },
            function (err, ok) {
                if (err) {
                    console.error(
                        "[AMQP] publish",
                        err,
                        content,
                        queue
                    );
                    pushToOfflineQueue(
                        queue,
                        content
                    );
                    pubChannel.connection.close();
                }
            }
        );
    }

    function startPublisher() {
        _amqpConn.createConfirmChannel(
            function (err, ch) {
                if (closeOnErr( err )) {
                    return;
                }
                ch.on(
                    "error",
                    function (err) {
                        console.error(
                            "[AMQP] publish channel error",
                            err
                        );
                    }
                );
                ch.on(
                    "close",
                    function () {
                        console.log( "[AMQP] publisher channel closed" );
                        bound = null;
                    }
                );
                pubChannel = ch;
                iEmitter.emit( init_events.AMQP_PUBLISHER_RUNNING, publish );
                while ( true ) {
                    var m = pullFromOfflineQueue();
                    if (!m) {
                        break;
                    }
                    publish(
                        m.content,
                        m.queue
                    );
                }
            }
        );
    }

    startPublisher()
}




function consumer({queue, work}) {
    let channel;

    function closeOnErr(err) {
        if (!err) {
            return false;
        }
        console.error(
            `[AMQP] error: consumer ${queue} causing amqp Connection to close`,
            err
        );
        _amqpConn.close();
        return true;
    }

    function onChannelErr(err) {
        console.error(
            `[AMQP] channel error: consumer ${queue}`,
            err
        );
    }

    function onChannelClose() {
        console.log( `[AMQP] channel closed: initiated by consumer ${queue} ` );
    }

    function ack(ok, ch) {
        try {
            if (ok) {
                ch.ack( msg );
            } else {
                ch.reject(
                    msg,
                    true
                );
            }
        } catch ( e ) {
            closeOnErr( e );
        }
    }

    function createChannel(err, ch) {
        if (closeOnErr( err )) {
            return;
        }
        channel = ch;
        ch.on(
            "error",
            onChannelErr
        );
        ch.on(
            "close",
            onChannelClose
        );
        var _ack = function (ch) {
            return function (ok) {
                return ack(
                    ok,
                    ch
                );
            }
        }( ch );

        function processMsg(msg) {
            function ack(ok) {
                try {
                    if (ok) {
                        ch.ack( msg );
                    } else {
                        ch.reject(
                            msg,
                            true
                        );
                    }
                } catch ( e ) {
                    closeOnErr( e );
                }
            }

            if (msg.content.toString() === "CACHE_FAIL") {
                ack( true );
            } else {
                try {
                    work(
                        msg.content.toString(), ack
                    );
                } catch ( err ) {
                    console.log( err );
                    console.log( msg.content.toString() )
                    console.log( work );
                    throw (
                        err
                    );
                }
            }
        }

        ch.prefetch( 1 );
        ch.assertQueue(
            queue,
            { durable: true },
            function (err, _ok) {
                if (closeOnErr( err )) {
                    return;
                }
            }
        );
        ch.consume(
            queue,
            processMsg,
            { noAck: false }
        );
        console.log( "Worker is started" );
        iEmitter.emit( init_events.AMQP_CONSUMER_BOUND, queue );
    }

    _amqpConn.createChannel( createChannel );
    return {
        close: function close() {
            channel.close();
        }
    }
}
module.exports.consumer = consumer;