/**
 * Created by ryderbrooks on 8/26/16.
 */

const {app_events, urls} = require( "./constants" ),
    {relationQuery, nodeQuery} = require( "../DB/queryBuilder" ),
    {nodes, relations, requests} = require( "./pathObjects" ),
    {urlProtocolCheck} = require( "./errors" );
function filter() {
    "use strict";
    const props = [ "is_ad", "comments_disabled", "is_private" ];
    let check = false;
    for ( let i = 0; i < props.length; i++ ) {
        if (this[ props[ i ] ] === true) {
            return false;
        }
    }
    return true;
}
function wrap(emitter) {
    function emit_write() {
        Object.defineProperty( this, "emit_result", {
                value: function () {
                    // queryProtocolCheck.call(this);
                    emitter.emit( app_events.SUBMIT_WRITE, this.query );
                }
            }
        )
    }

    function emit_request() {
        Object.defineProperty( this, "emit_result", {
                value: function () {
                    //urlProtocolCheck.call(this);
                    if (filter.call( this ) === true) {
                        emitter.emit( app_events.SUMBIT_REQUEST, this.url );
                    } else {
                        console.log( "url filtered" );
                    }
                }
            }
        )
    }

    function Url() {
        "use strict";
        Object.defineProperty( this, "url",
                               {
                                   get: function () {
                                       urlProtocolCheck.call( this );
                                       return `${urls.HOST}${this.urlType}${this.uri}/`;
                                   }
                               }
        )
    }

    function request({root, urlType, uriPath = "user.username", cb=null}) {
        return {
            parse   : [
                {
                    root      : root,
                    parseProps: {
                        uri: {
                            path      : uriPath,
                            enumerable: false,
                            cb        : cb
                        }
                    }
                }
            ],
            inject  : { urlType: { value: urlType, enumerable: false } }
            ,
            getters : [ Url ],
            emitters: [ emit_request ]
        };
    }

    function node({parse, type}) {
        return {
            parse,
            inject  : { type: { value: type, enumerable: false } },
            getters : [ nodeQuery ],
            emitters: [ emit_write ]
        }
    }

    function relation({parse, fromType, toType, relationType, unidirectional=false}) {
        return {
            parse,
            inject  : {
                fromType      : { value: fromType, enumerable: false },
                toType        : { value: toType, enumerable: false },
                relationType  : { value: relationType, enumerable: false },
                unidirectional: { value: unidirectional, enumerable: false }
            },
            getters : [ relationQuery ],
            emitters: [ emit_write ]
        };
    }

    return {
        PostPage   : {
            mediaOwner_request: request( requests.mediaOwner ),
            userTag_request   : request( requests.userTag ),
            commenter_request : request( requests.commenter ),
            liker_request     : request( requests.liker ),
            comment_node      : node( nodes.comment_node ),
            media_node        : node( nodes.media_node ),

            comment_owner     : relation( relations.comment_owner ),
            userTag_media     : relation( relations.userTag_media ),
            comment_media     : relation( relations.comment_media ),
            liker_media       : relation( relations.liker_media ),
            media_owner       : relation( relations.media_owner ),
            tagsFromCaption_media  : relation( relations.tagsFromCaption_media ),
            tagsFromComments_media : relation( relations.tagsFromComments_media ),
            linksFromComments_media: relation( relations.linksFromComments_media ),
            linksFromCaption_media : relation( relations.tagsFromCaption_media ),
        },
        ProfilePage: {
            user_node           : node( nodes.user_node ),
            profileMedia_request: request( requests.profile_media ),
        },
        TagPage    : {
            tag_node: node( nodes.tag_node ),
            tag_topMedia_request   : request( requests.tag_topMedia ),
            tag_recentMedia_request: request( requests.tag_recentMedia ),
        }
    };
}
module.exports = wrap;
function find(regex, urlBuilder) {
    "use strict";
    function defProp(fromID) {
        "use strict";
        let obj = Object.create( null, {
            toID          : { value: this.toID },
            toType        : { value: this.toType },
            fromID        : { value: fromID },
            fromType      : { value: this.fromType },
            relationType  : { value: this.relationType },
            unidirectional: { value: this.unidirectional }
        }
        );
        for ( let prop in this ) {
            Object.defineProperty( obj, prop, {
                value     : this.prop,
                enumerable: true
            }
            )
        }
        return obj;
    }

    let hold = Object.create( null );
    for ( let fromID_ofText of parseText( regex, this.text ) ) {
        hold[ fromID_ofText ] = true;
    }
    for ( let fromID_ofCaption of parseText( regex, this.caption ) ) {
        hold[ fromID_ofCaption ] = true;
    }
    for ( let fromID of Object.keys( hold ) ) {
        emitter.emit( app_events.SUBMIT_WRITE, defProp( fromID ) );
        emitter.emit( app_event.SUBMIT_REQUEST, urlBuilder( fromID ) );
    }
}
function emitHashTag() {
    "use strict";
    const regex = new RegExp( /#([\S]*)/, 'g' );

    function url(fromID) {
        return `${urls.HOST}${urls.TAGS}${fromID}/`;
    }

    find.call( this, regex, url );
}
function emitLinked() {
    "use strict";
    const regex = new RegExp( /@([\S]*)/, 'g' );

    function url(fromID) {
        return `${urls.HOST}${urls.PROFILE}${fromID}/`;
    }

    find.call( this, regex, url );
}
function *parseText(regex, text) {
    "use strict";
    if (!_.isRegExp( regex )) {
        throw new TypeError( "parseText requires a regular expression and first param" );
    }
    if (_.isString( text )) {
        let match = text.match( regex );
        if (_.isArray( match )) {
            for ( let m of match ) {
                yield m;
            }
        }
    }
}