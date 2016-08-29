/**
 * Created by ryderbrooks on 8/23/16.
 */
const nodeTypes = {
    TAG    : "TAG",
    MEDIA  : "MEDIA",
    USER   : "USER",
    COMMENT: "COMMENT",
}
const relationTypes = {
    MEDIA_OWNER  : "MEDIA_OWNER",
    COMMENT_OWNER: "COMMENT_OWNER",
    COMMENT_MEDIA: "COMMENT_MEDIA",
    HASHATG      : "HASHTAG",
    LIKE         : "LIKE",
    COMMENT_LINK : "COMMENT_LINK",
    USERTAG_MEDIA: "USERTAG_MEDIA"
}
const errorMsgs = {
    URL_PROTOCOL                                 : "'this' must have a property 'uri' that is a string",
    NODE_QUERY_PROTOCOL_ID                       : "'this' must have a property 'id' that is either a number or a string",
    NODE_QUERY_PROTOCOL_TYPE_NOT_STRING          : "'this' must have a property 'type' that is of type string",
    NODE_QUERY_PROTOCOL_TYPE_NOT_CONSTANT        : "'this' must have property 'type' whos string value maps to either nodeTypes OR relationTypes (these maps or contained in the constants file)",
    RELATION_QUERY_PROTOCOL_TOID                 : "'this' must have property 'toID' that is either a numer of a string",
    RELATION_QUERY_PROTOCOL_FROMID               : "'this' must have property 'fromID' that is either a numer of a string",
    RELATION_QUERY_PROTOCOL_TOTYPE_NOT_CONSTANT  : "'this' must have property 'toType' whos string value maps to either nodeTypes OR relationTypes (these maps or contained in the constants file)",
    RELATION_QUERY_PROTOCOL_FROMTYPE_NOT_CONSTANT: "'this' must have property 'fromType' whos string value maps to either nodeTypes OR relationTypes (these maps or contained in the constants file)",
    RELATION_QUERY_PROTOCOL_TOTYPE_NOT_STRING    : "'this' must have a property 'toType' that is of type string",
    RELATION_QUERY_PROTOCOL_FROMTYPE_NOT_STRING  : "'this' must have a property 'fromType' that is of type string",
    QUERY_PROTOCOL_ERROR                         : "Query constructor must match either nodeQuery or relationQuery"
}
const app_events = {
    SUBMIT_WRITE    : "SUBMIT_WRITE",
    SUBMIT_REQUEST: "SUBMIT_REQUEST",
    WAIT_FOR        : "WAIT_FOR",
    REQUEST_COMPLETE: "REQUEST_COMPLETE",
    TEST            : "TEST",
}
const init_events = {
    REDIS_CONNECTED       : "REDIS_CONNECTED",
    AMQP_CONNECTED        : "AMQP_CONNECTED",
    AMQP_PUBLISHER_RUNNING: "AMQP_PUBLISHER_RUNNING",
    AMQP_CONSUMER_BOUND   : "AMQP_CONSUMER_BOUND"
};
const queues = {
    PHANTOM : "PHANTOM",
    WRITE   : "WRITE",
    PARSE   : "PARSE",
    WAIT_FOR: "WAIT_FOR",
}
const urls = {
    HOST   : "https://www.instagram.com",
    TAGS   : "/explore/tags/",
    PROFILE: "/",
    MEDIA  : "/p/"
};
module.exports.errorMsgs = errorMsgs;
module.exports.urls = urls;
module.exports.queues = queues;
module.exports.init_events = init_events;
module.exports.app_events = app_events;
module.exports.relationTypes = relationTypes;
module.exports.nodeTypes = nodeTypes;