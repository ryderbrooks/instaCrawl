///**
// * Created by ryderbrooks on 7/30/15.
// */
//
//"use strict";
//var assert = require( "chai" ).assert;
//var sinon = require( "sinon" );
//var iEmitter = require( "../utils/instanceEmitter" ),
//    iEvents = require( "../utils/instanceEvents" );
//var amqp = require( "../messeging/amqpConn" );
//describe(
//    "AMQP",
//    function () {
//        function done(err) {
//            return err;
//        }
//
//        describe(
//            "Routing",
//            function () {
//                it( "calls", function (done) {
//                        var r = require( "redisClient" );
//                        var a0 = [],
//                            a1 = [],
//                            a2 = []
//
//                        function assertIT(L = 7) {
//                            if (a0.length + a1.length + a2.length >= L) {
//                                var _a0 = [ "0", "0", "0", "0", "0" ],
//                                    _a1 = [ "1" ],
//                                    _a2 = [ "2" ];
//                                assert.deepEqual(
//                                    _a0,
//                                    a0
//                                );
//                                assert.deepEqual(
//                                    _a1,
//                                    a1
//                                );
//                                assert.deepEqual(
//                                    _a2,
//                                    a2
//                                );
//                                done();
//                            }
//                        }
//
//                        function stubWork0(content, ack) {
//                            a0.push( content );
//                            assertIT();
//                            ack( true );
//                        }
//
//                        function stubWork1(content, ack) {
//                            a1.push( content );
//                            assertIT();
//                            ack( true );
//                        }
//
//                        function stubWork2(content, ack) {
//                            a2.push( content );
//                            assertIT();
//                            ack( true );
//                        }
//
//                        var spy0 = sinon.spy( stubWork0 );
//                        var spy1 = sinon.spy( stubWork1 );
//                        var spy2 = sinon.spy( stubWork2 );
//                        const ie = new iEmitter();
//                        var publish;
//                        var cnt = 0,
//                            pubCount = 0;
//                        var header0 = {
//                                queue   : { name: "a0", routingKey: "1.2.3" },
//                                exchange: { name: "A", type: "topic" }
//                            },
//                            header1 = {
//                                queue   : { name: "a1", routingKey: "a.2.3" },
//                                exchange: { name: "A", type: "topic" }
//                            },
//                            header2 = {
//                                queue   : { name: "a2", routingKey: "c.2.3" },
//                                exchange: { name: "A", type: "topic" }
//                            },
//                            content = null;
//                        ie.on(
//                            iEvents.REDIS_CONNECTED,
//                            function (redis_client) {
//                                amqp.amqpConnect(
//                                    ie,
//                                    redis_client
//                                );
//                            }
//                        )
//                        ie.on(
//                            iEvents.AMQP_CONNECTED,
//                            function () {
//                            }
//                        )
//                        ie.on(
//                            iEvents.AMQP_PUBLISHER_RUNNING,
//                            function ({unbound, bindable}) {
//                                publish = unbound;
//                                amqp.consumer(
//                                    {
//                                        header: header0,
//                                        work  : stubWork0
//                                    }
//                                );
//                                amqp.consumer( {
//                                        header: header1,
//                                        work  : stubWork1
//                                    }
//                                );
//                                amqp.consumer( {
//                                        header: header2,
//                                        work  : stubWork2
//                                    }
//                                );
//                            }
//                        )
//                        ie.on(
//                            iEvents.AMQP_CONSUMER_BOUND,
//                            function (header) {
//                                cnt += 1;
//                                if (cnt === 3) {
//                                    publish(
//                                        "0",
//                                        header0, false
//                                    );
//                                    publish(
//                                        "0",
//                                        header0, false
//                                    );
//                                    publish(
//                                        "0",
//                                        header0, false
//                                    );
//                                    publish(
//                                        "0",
//                                        header0, false
//                                    );
//                                    publish(
//                                        "1",
//                                        header1, false
//                                    );
//                                    publish(
//                                        "0",
//                                        header0, false
//                                    );
//                                    publish(
//                                        "2",
//                                        header2, false
//                                    );
//                                }
//                            }
//                        )
//                        r.connect( { iEmitter: ie } );
//                    }
//                );
//                describe( "topix", function () {
//                          }
//                )
//                it(
//                    "sends ",
//                    function () {
//                    }
//                );
//            }
//        );
//    }
//);