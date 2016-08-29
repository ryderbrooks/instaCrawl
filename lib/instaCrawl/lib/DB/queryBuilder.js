var {nodeQueryProtocolCheck, relationQueryProtocolCheck} = require( "../utils/errors" )
const _ = require( "underscore" );

function nodeQuery() {
    Object.defineProperty( this, "query", {
            get: function () {
                nodeQueryProtocolCheck.call( this );
                let {query, params} = _nodeQuery( this );
                query = new String( query );
                query.constructor = nodeQuery;
                return { query, params };
            }
        }
    )
}
function _nodeQuery(context, v = "x", _params = {}, direction = false) {
    let {onCreate, params} = onCreateBuilder( context, v, _params ),
        query = ` MERGE(${v}:${context.type} {id: {_${v}_id}}) `;
    if (direction) {
        query = `MERGE (f)-[${v}:${context.relationType}]${direction}(t)`;
    } else {
        params[ `_${v}_id` ] = context.id;
    }
    if (onCreate) {
        query = `${query} ON CREATE SET ${onCreate} ON MATCH SET ${onCreate}`;
    }
    return { query, params };
}
function onCreateBuilder(items, v = "x", params = {}) {
    let onCreate = [];
    for ( let key in items ) {
        let value = items[ key ];
        onCreate.push( `${v}.${key} = {_${v}_${key}}` );
        onCreate.push( ", " );
        params[ `_${v}_${key}` ] = value;
    }
    onCreate.pop();
    if (!onCreate.length) {
        onCreate = null;
    } else {
        onCreate = onCreate.join( "" );
    }
    return { onCreate, params };
}
//
//
//function _nodeQuery(v="x", _params={}, direction=false) {// data protocol --> .id, .type
//    let {onCreate, params} = onCreateBuilder.call(this,
//            v,
//            _params
//        ),
//        query = ` MERGE(${v}:${this.type} {id: {_${v}_id}}) `;
//
//    if (direction) {
//        query = `MERGE (f)-[${v}:${this.relationType}]${direction}(t)`;
//    } else {
//        params[`_${v}_id`] = this.id;
//    }
//    if (onCreate) {
//        query = `${query} ON CREATE SET ${onCreate} ON MATCH SET ${onCreate}`;
//    }
//    return { query, params };
//}
//
//
//function onCreateBuilder(v="x", params={}) {
//    let onCreate = [];
//    for ( let {key, value} of this ) {
//        onCreate.push( `${v}.${key} = {_${v}_${key}}` );
//        onCreate.push( ", " );
//        params[ `_${v}_${key}` ] = value;
//    }
//    onCreate.pop();
//    if (!onCreate.length) {
//        onCreate = null;
//    } else {
//        onCreate = onCreate.join( "" );
//    }
//    return { onCreate, params };
//}
//
//
//
//function makeIterable(obj) {
//    "use strict";
//    obj[Symbol.iterator] = function() {
//        "use strict";
//        let index = 0,
//            keys = Object.keys( obj ),
//            len = keys.length;
//
//        return {
//            next: () => {
//                let value = {key: keys[index], value: this[ keys[ index ] ]};
//                let done = index >= len;
//                index++;
//                return { value, done };
//            }
//        };
//    }
//}
function relationQuery() {
    "use strict";
    Object.defineProperty(
        this, "query",
        {
            get: function () {
                relationQueryProtocolCheck.call( this );
                var onCreate = [],
                    direction = "->";
                if (this.unidirectional) {
                    direction = "-";
                }
                let that = this;
                let _from = Object.create(
                    null,
                    {
                        id  : { value: that.fromID },
                        type: { value: that.fromType }
                    }
                );
                let _to = Object.create(
                    null,
                    {
                        id  : { value: that.toID },
                        type: { value: that.toType }
                    }
                );
                let to = _nodeQuery( _to, "t" );
                let from = _nodeQuery( _from, "f", to.params ),
                    {query, params} = _nodeQuery( that, "r", from.params, direction );
                query = new String( `${to.query} ${from.query} ${query}` );
                query.constructor = relationQuery;
                return { query, params };
            }
        }
    );
}
module.exports.nodeQuery = nodeQuery;
module.exports.relationQuery = relationQuery;
