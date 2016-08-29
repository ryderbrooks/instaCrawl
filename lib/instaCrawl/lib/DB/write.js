/**
 * Created by ryderbrooks on 8/13/16.
 */

    const _ = require("underscore");

var app = require("../../../../app");
var config = require("../../.config.json")[app.get('env')];

var neo4j = require( "neo4j-driver" ).v1,
    driver = neo4j
        .driver( `bolt://${config.neo.host}`,
                           neo4j
                               .auth
                               .basic( config.neo.user, config.neo.password ) );


var session = driver.session();

function read(query) {
    "use strict";
    session
        .run( query.query, query.params )
        .subscribe( {
            onNext     : function (record) {
                console.log( record._fields[ 0 ].properties.count );
            },
            onCompleted: function () {
                // Completed!
                console.log( "OK" );
                session.close();
            },
            onError    : function (error) {
                console.log( error );
            }
        }
    );
}


module.exports.read = read;



function write(queryObj, ack) {
    var session = driver.session();
    var success = false;
    if (_.isString( queryObj )) {
        queryObj = JSON.parse( queryObj );
    }


    function _onNext(record) {
        "use strict";
    }

    function _onComplete() {
        "use strict";
        //tx.commit();
        session.close();
        ack( true );
    }

    function _onError(error) {
        "use strict"
        console.log( error );
        session.close();
        console.log( queryObj );
        throw(
            error
        );
        ack( true );
    }

    session.run( queryObj.query, queryObj.params )
        .subscribe(
        {
            onNext     : _onNext,
            onCompleted: _onComplete,
            onError    : _onError
        }
    );
}

module.exports.DBwrite = write;
