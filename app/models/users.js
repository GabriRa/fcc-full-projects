'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({ //user schema for the db
	github: {
		id: String,
		displayName: String,
		username: String,
        publicRepos: Number
	},
    twitter:{
	    id: String,
	    displayName: String,
	    username: String,
	},
    nbrClicks: {
        clicks: Number
    }
});

module.exports = mongoose.model('votingUser', User);
