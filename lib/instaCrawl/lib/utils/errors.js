/**
 * Created by ryderbrooks on 8/24/16.
 */
const {errorMsgs, nodeTypes, relationTypes} = require( "./constants" ),
    {nodeQuery, relationQuery} = require( "../DB/queryBuilder" ),
    _ = require( "underscore" );
class QueryProtocolError extends TypeError {
    constructor(message) {
        super( message );
        this.message = message;
        this.name = "QueryProtocolError";
    }
}
class UrlProtocolError extends TypeError {
    constructor(message) {
        super( message );
        this.message = message;
        this.name = "UrlProtocolError";
    }
}
class NodeQueryProtocolError extends TypeError {
    constructor(message) {
        super( message );
        this.message = message;
        this.name = "NodeQueryProtocolError";
    }
}
class RelationQueryProtocolError extends TypeError {
    constructor(message) {
        super( message );
        this.message = message;
        this.name = "RelationQueryProtocolError";
    }
}
function queryProtocolCheck() {
    "use strict";
    if (_.isFunction( this.query.query.constructor === true )) {
        if (this.query.query.constructor === nodeQuery || this.query.query.constructor === relationQuery) {
            return true;
        }
    }
    throwIt( QueryProtocolError, errorMsgs.QUERY_PROTOCOL_ERROR, [ ...arguments ] );
}
function urlProtocolCheck() {
    "use strict";
    if (_.isString( this.uri )) {
        return true;
    }
    throwIt( UrlProtocolError, errorMsgs.URL_PROTOCOL, [ ...arguments ] );
}
module.exports.urlProtocolCheck = urlProtocolCheck;
function constCheck(constGroup, value) {
    "use strict";
    if (constGroup[ value ] === undefined) {
        for ( let i in constGroup ) {
            if (constGroup[ i ] === value) {
                return true;
            }
        }
        return false;
    }
    return true;
}
function throwIt(errType, msg, args) {
    "use strict";
    let cb = args.pop();
    if (_.isFunction( cb )) {
        cb( new errType( msg ) )
    } else {
        return new errType( msg );
    }
}
function nodeQueryProtocolCheck() {
    "use strict";
    let args = [ ...arguments ];
    if (!_.isString( this.id ) || !_.isNumber( this.id )) {
        throwIt( NodeQueryProtocolError, errorMsgs.NODE_QUERY_PROTOCOL_ID, args );
    }
    if (!_.isString( this.type )) {
        throwIt( NodeQueryProtocolError, errorMsgs.NODE_QUERY_PROTOCOL_TYPE_NOT_STRING, args );
    }
    if (!constCheck( nodeTypes, this.type ) && !constCheck( relationTypes, this.type )) {
        throwIt( NodeQueryProtocolError, errorMsgs.NODE_QUERY_PROTOCOL_TYPE_NOT_CONSTANT, args );
    }
}
module.exports.nodeQueryProtocolCheck = nodeQueryProtocolCheck;
function relationQueryProtocolCheck() {
    "use strict";
    let args = [ ...arguments ];
    if (!_.isString( this.toID ) || !_.isNumber( this.toID )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_TOID, args );
    }
    if (!_.isString( this.fromID ) || !_.isNumber( this.fromID )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_FROMID, args );
    }
    if (!_.isString( this.toType )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_TOTYPE_NOT_STRING, args );
    }
    if (!_.isString( this.fromType )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_FROMTYPE_NOT_STRING, args );
    }
    if (constCheck( nodeTypes, this.toType ) && constCheck( relationTypes, this.toType )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_TOTYPE_NOT_CONSTANT, args );
    }
    if (constCheck( nodeTypes, this.fromType ) && constCheck( relationTypes, this.fromType )) {
        throwIt( RelationQueryProtocolError, errorMsgs.RELATION_QUERY_PROTOCOL_FROMTYPE_NOT_CONSTANT, args );
    }
}
module.exports.relationQueryProtocolCheck = relationQueryProtocolCheck;