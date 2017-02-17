var TwitterPackage = require('twitter');
var wordListPath = require('word-list');
var fs = require('fs');
var wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');


var secret = require("./private/secret");
var user = require("./private/user");
var Twitter = new TwitterPackage(secret);

var maxWords = wordArray.length;

var oldIndex = -1;

var minutes = 5, the_interval = minutes * 1000//* 60 * 1000;

/*setInterval(function() {
	console.log("I am doing my 5 minutes check");
	tweet();
	//checkTweetsToRetweets();
}, the_interval);*/


/* 
	|-----------------------------------------------------------------------|
	|--------------------------------- Tweet -------------------------------|
	|-----------------------------------------------------------------------|
*/ 

function tweet(){
	Twitter.post('statuses/update', {status: generateSentence() + " #PinhoBot"},  function(error, tweet, response){
		if(error){
			console.log(error);
		}
	});
}


/* 
	|-----------------------------------------------------------------------|
	|--------------------------------- Retweet -----------------------------|
	|-----------------------------------------------------------------------|
*/


function checkTweetsToRetweets(){
	Twitter.get('statuses/user_timeline', {screen_name: user.target_user_name},  function(error, data){
		if(error){
			console.log(error);
		}else{
			for(var i=0; i < data.length; i++){
				if(data[i].retweeted_status == null){
					if(data[i].retweeted == false){
						console.log("Wasnt retweeted");
						// grab ID of tweet to retweet
						var retweetId = data[i].id_str;
						// Tell TWITTER to retweet
						retweet(retweetId);
					}else{
						console.log("Already retweeted");
					}
				}else{
					console.log("It is a retweet");
				}
			}
		}
	});
}

function retweet(retweetId){
	Twitter.post('statuses/retweet/' + retweetId , function(err, response) {
		if (response) {
			console.log('Retweeted!!!');
			console.log(response);
		}
		// if there was an error while tweeting
		if (err) {
			console.log('Something went wrong while RETWEETING... Duplication maybe...');
		}
	});
}

function getRandomWord() {
	//calculate a random index
	var wordIndex = Math.floor(Math.random() * (maxWords - 1));
	return wordArray[wordIndex];
}

function getNumberOfWords(){
	var numberOfWords = Math.floor(Math.random() * 6) + 1;
	return numberOfWords;
}

function generateSentence(){
	var numberOfWords = getNumberOfWords();
	var sentence = "";
	for (var i = 0; i < numberOfWords; i++) {
		var word = getRandomWord();
		sentence += " " + word;
	}
	return sentence;
}

/* 
	|-----------------------------------------------------------------------|
	|---------------------------- Following List ---------------------------|
	|-----------------------------------------------------------------------|
*/

function checkFollowingList(callback){
	Twitter.get('friends/ids', {screen_name: user.my_user_name, stringify_ids: true},  function(error, data){
		if(error){
			console.log(error);
		}else{
			// console.log("Following number: " + data.ids.length);
			callback(data);
		}
	});
}

function unFollowById(id){
	Twitter.post('/friendships/destroy', {user_id: id},  function(error, data){
		if(error){
			console.log(error);
		}else{
			console.log("Succesfully removed: " + data.screen_name);
		}
	});
}

function relationshipOfUser(id, callback){
	Twitter.get('/friendships/show', {source_screen_name: user.my_user_name, target_id: id },  function(error, data){
		if(error){
			console.log(error);
		}else{
			console.log(data.relationship.target.screen_name + " " + (data.relationship.source.followed_by? "is" : "isnt") + " following " + user.my_user_name);
			console.log(user.my_user_name + " " + (data.relationship.source.following? "is" : "isnt") + " following " + data.relationship.target.screen_name);
			callback(data.relationship);
		}
	});
}

function unFollowNotFollowing(){
	checkFollowingList(function(response) {
    	if(response != null){
    		console.log(response.ids.length);
    		var minutes = 5, the_interval = minutes * 1000//* 60 * 1000;
    		var i = 0;
    		// Wait some seconds to unfollow to not reach API's limit
    		var timer = setInterval(function() {
	    		relationshipOfUser(response.ids[i], function(relationship){
					if(!relationship.source.followed_by){
						unFollowById(relationship.target.id_str);
						console.log("He is NOT following you back, unfollowed.");
					}else{
						console.log("He is following you back");
					}
				})
				if(i == response.ids.length){
					clearInterval(timer);
					console.log("clear");
				}
				i++;
			}, the_interval);
		}
	})
}

unFollowNotFollowing();



