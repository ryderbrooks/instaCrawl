/**
 * Created by ryderbrooks on 8/17/16.
 */


const {urls, relationTypes, nodeTypes, app_events} = require( "./constants" ),
    _ = require( "underscore" );


// nodes
const tag_node = {
    parse: [
        {
            root      : "entry_data.TagPage.0.tag.media",
            parseProps: {
                count: {
                    path      : "count",
                    enumerable: true
                },
                id   : {
                    path      : "name",
                    enumerable: false
                },
            },
        }
    ],
    type : nodeTypes.TAG
};

const comment_node = {
    parse: [
        {
            root      : "entry_data.PostPage.0.media.comments.nodes",
            parseProps: {
                created_at: {
                    path      : "created_at",
                    enumerable: true
                },
                id        : {
                    path      : "id",
                    enumerable: false
                },
            },
        }
    ],
    type : nodeTypes.COMMENT
};
const user_node = {
    parse: [
        {
            root      : "entry_data.ProfilePage.0.user",
            parseProps: {
                follows   : {
                    path      : "follows.count",
                    enumerable: true
                },
                followedBy: {
                    path      : "followed_by.count",
                    enumerable: true
                },
                id        : {
                    path      : "username",
                    enumerable: true
                },
                is_private: {
                    path      : "is_private",
                    enumerable: false
                },
                posts     : {
                    path      : "media.count",
                    enumerable: true
                },
            },
        }
    ],
    type : nodeTypes.USER
};
const media_node =
{
    parse: [
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                commentCount     : {
                    path      : "comments.count",
                    enumerable: true
                },
                likeCount        : {
                    path      : "likes.count",
                    enumerable: true
                },
                date             : {
                    path      : "date",
                    enumerable: true
                },
                id               : {
                    path      : "id",
                    enumerable: false
                },
                src              : {
                    path      : "display_src",
                    enumerable: true
                },
                is_video         : {
                    path      : "is_video",
                    enumerable: true
                },
                //location         : {
                //    path: "location",
                //    enumerable: true
                //},
                is_ad            : {
                    path      : "is_ad",
                    enumerable: false
                },
                comments_disabled: {
                    path      : "comments.comments_disabled",
                    enumerable: false
                }
            }
        }
    ],
    type : nodeTypes.MEDIA
};
module.exports.nodes = { comment_node, user_node, media_node, tag_node };
// relation nodes
function parseText(regex, text) {
    "use strict";
    if (!_.isRegExp( regex )) {
        throw new TypeError( "parseText requires a regular expression as first param" );
    }
    if (_.isString( text )) {
        let match = regex.exec( text );
        if (match) {
            return match[ 1 ];
        }
    }
    return;
}
const tagsFromComments_media = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.comments.nodes",
            parseProps: {
                fromID: {
                    path      : "text",
                    enumerable: false,
                    cb        : function (text) {
                        "use strict";
                        const regex = new RegExp( /#([\S]*)/, 'g' );
                        return parseText( regex, text );
                    }
                },
            },
        },
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                toID: {
                    path      : "id",
                    enumerable: false
                },
            },
        }
    ],
    toType      : nodeTypes.MEDIA,
    fromType    : nodeTypes.TAG,
    relationType: relationTypes.HASHATG,
};
const linksFromComments_media = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.comments.nodes",
            parseProps: {
                fromID: {
                    path      : "text",
                    enumerable: false,
                    cb        : function (text) {
                        "use strict";
                        const regex = new RegExp( /@([\S]*)/, 'g' );
                        return parseText( regex, text );
                    }
                },
                toID  : {
                    path      : "id",
                    enumerable: false
                },
            },
        },
    ],
    toType      : nodeTypes.COMMENT,
    fromType    : nodeTypes.USER,
    relationType: relationTypes.COMMENT_LINK,
};
const tagsFromCaption_media = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                fromID: {
                    path      : "caption",
                    enumerable: false,
                    cb        : function (text) {
                        "use strict";
                        const regex = new RegExp( /#([\S]*)/, 'g' );
                        return parseText( regex, text );
                    }
                },
                toID  : {
                    path      : "id",
                    enumerable: false
                },
            },
        },
    ],
    toType      : nodeTypes.MEDIA,
    fromType    : nodeTypes.TAG,
    relationType: relationTypes.HASHATG,
};
const linksFromCaption_media = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                fromID: {
                    path      : "caption",
                    enumerable: false,
                    cb        : function (text) {
                        "use strict";
                        const regex = new RegExp( /@([\S]*)/, 'g' );
                        return parseText( regex, text );
                    }
                },
                toID  : {
                    path      : "id",
                    enumerable: false
                },
            },
        },
    ],
    toType      : nodeTypes.MEDIA,
    fromType    : nodeTypes.USER,
    relationType: relationTypes.COMMENT_LINK,
};


const comment_owner = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.comments.nodes",
            parseProps: {
                fromID: {
                    path      : "id",
                    enumerable: false
                },
                toID  : {
                    path      : "user.username",
                    enumerable: false
                },
            }
        }
    ],
    toType      : nodeTypes.USER,
    fromType    : nodeTypes.COMMENT,
    relationType: relationTypes.COMMENT_OWNER
};
const media_owner = {
    parse       : [
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                fromID: {
                    path      : "id",
                    enumerable: false
                },
                toID  : {
                    path      : "owner.username",
                    enumerable: false
                }
            }
        }
    ],
    toType      : nodeTypes.USER,
    fromType    : nodeTypes.MEDIA,
    relationType: relationTypes.MEDIA_OWNER
};
const liker_media =
{
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.likes.nodes",
            parseProps: {
                fromID: {
                    path      : "user.username",
                    enumerable: false
                }
            }
        },
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                toID: {
                    path      : "id",
                    enumerable: false
                }
            }
        },
    ],
    toType      : nodeTypes.MEDIA,
    fromType    : nodeTypes.USER,
    relationType: relationTypes.LIKE,
};
const comment_media =
{
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.comments.nodes",
            parseProps: {
                fromID: {
                    path      : "id",
                    enumerable: false
                },
                created_at: {
                    path      : "created_at",
                    enumerable: true
                }

            }
        },
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                toID: {
                    path      : "id",
                    enumerable: false
                }
            }
        }
    ],
    fromType    : nodeTypes.COMMENT,
    toType      : nodeTypes.MEDIA,
    relationType: relationTypes.COMMENT_MEDIA,
};

const userTag_media =
{
    parse       : [
        {
            root      : "entry_data.PostPage.0.media.usertags.nodes",
            parseProps: {
                toID: { path: "user.username", eunumerable: false }
            }
        },
        {
            root      : "entry_data.PostPage.0.media",
            parseProps: {
                fromID: { path: "id", eunumerable: false }
            }
        }
    ],
    toType  : nodeTypes.USER,
    fromType: nodeTypes.MEDIA,
    relationType: relationTypes.USERTAG_MEDIA,
};
module.exports.relations = {
    userTag_media, comment_media, liker_media, media_owner, comment_owner,
    tagsFromCaption_media, tagsFromComments_media, linksFromCaption_media, linksFromComments_media
};









// requests
module.exports.requests = {
    profile_media        : {
        root   : "entry_data.ProfilePage.0.user.media.nodes",
        urlType: urls.MEDIA,
        uriPath: "code"
    },
    tag_topMedia         : {
        root   : "entry_data.TagPage.0.tag.top_posts.nodes",
        urlType: urls.MEDIA,
        uriPath: "code"
    },
    tag_recentMedia      : {
        root   : "entry_data.TagPage.0.tag.media.nodes",
        urlType: urls.MEDIA,
        uriPath: "code"
    },
    mediaOwner           : {
        root   : "entry_data.PostPage.0.media",
        urlType: urls.PROFILE,
        uriPath: "owner.username"
    },
    liker                : {
        root   : "entry_data.PostPage.0.media.likes.nodes",
        urlType: urls.PROFILE,
        uriPath: "user.username"
    },
    commenter            : {
        root   : "entry_data.PostPage.0.media.comments.nodes",
        urlType: urls.PROFILE,
        uriPath: "user.username"
    },
    userTag              : {
        root   : "entry_data.PostPage.0.media.usertags.nodes",
        urlType: urls.PROFILE,
        uriPath: "user.username"
    },
    linkdUserFromComments: {
        root   : "entry_data.PostPage.0.media.comments.nodes",
        urlType: urls.PROFILE,
        uriPath: "text",
        cb     : function (text) {
            "use strict";
            const regex = new RegExp( /@([\S]*)/, 'g' );
            return parseText( regex, text );
        }
    },
    linkdUserFromCaption : {
        root   : "entry_data.PostPage.0.media",
        urlType: urls.PROFILE,
        uriPath: "caption",
        cb     : function (text) {
            "use strict";
            const regex = new RegExp( /@([\S]*)/, 'g' );
            return parseText( regex, text );
        }
    },
    linkedTagFromComments: {
        root   : "entry_data.PostPage.0.media.comments.nodes",
        urlType: urls.TAGS,
        uriPath: "text",
        cb     : function (text) {
            "use strict";
            const regex = new RegExp( /#([\S]*)/, 'g' );
            return parseText( regex, text );
        }
    },
    linkdTagFromCaption  : {
        root   : "entry_data.PostPage.0.media",
        urlType: urls.TAGS,
        uriPath: "caption",
        cb     : function (text) {
            "use strict";
            const regex = new RegExp( /#([\S]*)/, 'g' );
            return parseText( regex, text );
        }
    },
}




