// recieve data
// --> check that data can be parsed
const _ = require( "underscore" );
function retrieve(path, data, cb) {
    "use strict";
    if (!_.isString( path ) || path.length === 0) {
        throw new TypeError( "path must be supplied and of type string" );
    }
    let value = path.split( "." ).reduce( function (prev, cur) {
                                         if (_.isUndefined( prev )) {
                                             return prev;
                                         } else if (prev === null) {
                                             return undefined;
                                         }
                                         return prev[ cur ];
                                     }, data
    );
    if (_.isFunction( cb )) {
        value = cb( value );
    }
    return value;
}
module.exports.retrieve = retrieve;




function guidParser(pathObj, dataRoot, resultObj) {
    "use strict";
    let r = [];

    function flatten(result) {
        if (_.isArray( result )) {
            result.forEach( function (v) {
                                if (_.isObject( v )) {
                                    r.push( v );
                                }
                            }
            )
        } else if (_.isObject( result )) {
            r.push( result );
            //throw new TypeError("parse must return Array");
        }
    }

    function protocolCheck() {
        if (_.isArray( dataRoot ) && _.isArray( resultObj )) {
            throw new TypeError( "dataRoot AND resultObj can not both be Array" );
        }
    }

    protocolCheck();

    if (_.isArray( dataRoot )) {
        for ( let d of dataRoot ) {
            let result = parse( pathObj, d, Object.create( null ) );
            flatten( result );
        }
    } else if (_.isArray( resultObj )) {
        resultObj.forEach( function (rObj) {
                               let result = parse( pathObj, dataRoot, rObj );
                               flatten( result );
                           }
        );
    } else {
        return parse( pathObj, dataRoot, resultObj );
    }
    return r;
}
function exp(obj, hold) {
    let expanded = [];
    const objProps = Object.getOwnPropertyNames( obj ),
        holdKeys = Object.keys( hold );
    if (holdKeys.length > 1) {
        throw new TypeError( "parse algo can not handled more than 1 property retrieval that returns an array per object" );
    }
    if (!holdKeys.length) {
        return [ obj ];
    }
    for ( let hProp in hold ) {
        let {value, enumerable} = hold[ hProp ];
        for ( let nVal of value ) {
            let newObj = Object.create( null, { [hProp]: { value: nVal, enumerable } } );
            for ( let oProp of objProps ) {
                let description = Object.getOwnPropertyDescriptor( obj, oProp );
                Object.defineProperty( newObj, oProp, description );
            }
            expanded.push( newObj );
        }
    }
    return expanded;
}
module.exports.expand = exp;


function parse(pathObj, dataRoot, obj) {
    "use strict";
    let hold = {};
    for ( let prop in pathObj ) {
        let {path, enumerable, cb} = pathObj[ prop ];
        let value = retrieve( path, dataRoot, cb );
        if (_.isArray( value )) {
            hold[ prop ] = { value, enumerable };
        } else {
            if (prop === "id" || prop.indexOf( "ID" ) !== -1) {
                if (value === undefined || value === null || value === "") {
                    return;
                }
            }
            Object.defineProperty( obj, prop, {
                    value,
                    enumerable
                }
            );
        }
    }
    return exp( obj, hold );
}
function bindFunctions(resultObj, funcs) {
    "use strict";
    if (!_.isArray( funcs )) {
        return;
    }
    function bFunc(obj) {
        "use strict";
        funcs.forEach( function (f) {
                           f.call( obj );
                       }
        )
    }

    resultObj.forEach( function (v) {
                           bFunc( v );
                       }
    )
}
function inject(from, to) {
    "use strict";
    if (_.isObject( from )) {
        return to.map( function (v) {
                           for ( let key in from ) {
                               Object.defineProperty( v, key, {
                                       value     : from[ key ].value,
                                       enumerable: from[ key ].enumerable
                                   }
                               )
                           }
                           return v;
                       }
        );
    }
}
module.exports.inject = inject;

function controle(pathObj, data, obj = Object.create( null )) {
    function itterPaths() {
        for ( let props of pathObj.parse ) {
            let root = props.root;
            let dataRoot = retrieve( props.root, data );
            let r = guidParser( props.parseProps, dataRoot, obj );
            if (_.isObject( r )) {
                obj = r;
            }
            if (!_.isArray( obj )) {
                return;
                //throw new TypeError("parse result object must be array");
            }
        }
        return true;
    }

    if (!itterPaths()) {
        return obj;
    }
    inject( pathObj.inject, obj );
    bindFunctions( obj, pathObj.getters );
    bindFunctions( obj, pathObj.emitters );
    return obj;
}
module.exports.parse = controle;