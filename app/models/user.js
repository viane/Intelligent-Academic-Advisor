// app/models/user.js

'use strict'

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var appRoot = require('app-root-path');
var configDB = require(appRoot + '/config/database.js');

var conn = mongoose.createConnection(configDB.userDB_URL);
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    type: String,
    privacy: {
        basic_information: {
            type: Boolean,
            default: false
        },
        personality_assessement: {
            type: Boolean,
            default: false
        },
        stats_and_analysis: {
            type: Boolean,
            default: false
        },
        question_log: {
            type: Boolean,
            default: false
        }
    },
    inbox: [
        {
            title: String,
            date: {
                type: Date,
                default: Date.now
            },
            senderID: String,
            senderDisplayName: String,
            body: String,
            isViewed: {
                type: Boolean,
                default: false
            }
        }
    ],
    local: {
        email: {
            type: String
        },
        password: String,
        frist_name: String,
        last_name: String,
        displayName: String,
        avatar: {
            type: String,
            default: "./avatar/user.png"
        },
        create_date: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                },
                ask_count: {
                    type: Number,
                    default: 1
                },
                question_concept: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_entitie: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_taxonomy: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_keyword: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        interest: [mongoose.Schema.Types.Mixed],
        personality_assessement: {
            last_upload_time: {
                type: Date,
                default: Date.now
            },
            description_content: String,
            evaluation: mongoose.Schema.Types.Mixed
        }
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        displayName: String,
        avatar: String,
        familyName: String,
        givenName: String,
        gender: String,
        ageMin: Number,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                },
                ask_count: {
                    type: Number,
                    default: 1
                },
                question_concept: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_entitie: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_taxonomy: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_keyword: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        interest: [mongoose.Schema.Types.Mixed],
        personality_assessement: {
            last_upload_time: {
                type: Date,
                default: Date.now
            },
            description_content: String,
            evaluation: mongoose.Schema.Types.Mixed
        }
    },
    twitter: {
        id: String,
        token: String,
        email: String,
        name: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                },
                ask_count: {
                    type: Number,
                    default: 1
                },
                question_concept: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_entitie: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_taxonomy: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_keyword: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        interest: [mongoose.Schema.Types.Mixed],
        personality_assessement: {
            last_upload_time: {
                type: Date,
                default: Date.now
            },
            description_content: String,
            evaluation: mongoose.Schema.Types.Mixed
        }
    },
    linkedin: {
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                },
                ask_count: {
                    type: Number,
                    default: 1
                },
                question_concept: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_entitie: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_taxonomy: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_keyword: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        interest: [mongoose.Schema.Types.Mixed],
        personality_assessement: {
            last_upload_time: {
                type: Date,
                default: Date.now
            },
            description_content: String,
            evaluation: mongoose.Schema.Types.Mixed
        }
    },
    google: {
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email: String,
        avatar: String,
        gender: String,
        language: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                },
                ask_count: {
                    type: Number,
                    default: 1
                },
                question_concept: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_entitie: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_taxonomy: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ],
                question_keyword: [
                    {
                        type: mongoose.Schema.Types.Mixed
                    }
                ]
            }
        ],
        interest: [mongoose.Schema.Types.Mixed],
        personality_assessement: {
            last_upload_time: {
                type: Date,
                default: Date.now
            },
            description_content: String,
            evaluation: mongoose.Schema.Types.Mixed
        }
    },
    account_status: String,
    account_actvition_code: String,
    submitted_assessment_history: [
        {
            _id: {
                type: mongoose.Schema.ObjectId,
                auto: true
            },
            request_time: {
                type: Date,
                default: Date.now
            },
            question: Array,
            question_comment: Array,
            personality_evaluation: Array,
            personality_evaluation_comment: Array,
            interest: Array,
            interest_comment: Array,
            introduction: String,
            introduction_comment: Array,
            reviewer: Array,
            comment_summary: Array,
            advisor_viewed_current: Array,
            advisor_viewed_before_user_last_check: Array
        }
    ],
    received_assessment_history: [
        {
            from_user_id: String,
            assessment_id: String
        }
    ]
}, {strict: true});

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
    var user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err)
            return next(err);

        user.local.password = hash;
    });

};

// create the model for users and expose it to our app
module.exports = conn.model('User', userSchema);
