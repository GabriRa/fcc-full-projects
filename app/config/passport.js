'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/users');

var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	//set up twitter strategy and callback(create user if first time)
	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret: configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL,
	}, (token, tokenSecret, profile, done) => {
		process.nextTick( function () { //Executes the function as soon as it can
			User.findOne({ 'twitter.id' : profile.id }, (err, user) => {
				if(err) return done(err);
				
				if (user){
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.github.id = '';
					newUser.github.username = '';
					newUser.github.displayName = '';
					newUser.github.publicRepos = null;
					newUser.twitter.id = profile.id;
					newUser.twitter.displayName = profile.displayName;
					newUser.twitter.username = profile.username;
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			})
		}
		
		)
	}))

	//set up github strategy and callback(creates user if its the first time)
	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackURL: configAuth.githubAuth.callbackURL
	},
	function (token, refreshToken, profile, done) {
		process.nextTick(function () {
			console.log(profile);
			User.findOne({ 'github.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.github.id = profile.id;
					newUser.github.username = profile.username;
					newUser.github.displayName = profile.displayName === null ? profile.username : profile.displayName;
					newUser.github.publicRepos = profile._json.public_repos;
					newUser.twitter.id = '';
					newUser.twitter.displayName = '';
					newUser.twitter.username = '';
					newUser.nbrClicks.clicks = 0;

					newUser.save(function (err) {
						if (err) {
							throw err;
						}

						return done(null, newUser);
					});
				}
			});
		});
	}));
};
