"use strict";
var phantom = require( 'phantom' ),
    {app_events} = require( "../utils/constants" );
function wrap(emitter) {
    return function phRequest(url, ackCB) {
        console.log( url );
        var sitepage = null;
        var phInstance = null;

        function createPage(instance) {
            phInstance = instance;
            return instance.createPage();
        }

        function openUrl(page) {
            sitepage = page;
            return page.open( url );
        }

        function pageStatus(status) {
            sitepage.evaluate( evaluate ).then( result );
        }

        function evaluate() {
            return window._sharedData;
        }

        function result(data) {
            emitter.emit( app_events.REQUEST_COMPLETE, data, url );
            ackCB( true );
            sitepage.close();
            phInstance.exit();
        }

        phantom.create( [ '--ignore-ssl-errors=yes', '--load-images=no', "--web-security=false" ] )
            .then( createPage )
            .then( openUrl )
            .then( pageStatus )
    }
}
module.exports.bindEmitter = wrap;
