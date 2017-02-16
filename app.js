var TwitterPackage = require('twitter');
var wordListPath = require('word-list');
var fs = require('fs');
var wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');


var secret = require("./private/secret");
var user = require("./private/user");
var Twitter = new TwitterPackage(secret);

var tweets = require("./tweets");

var maxTweets = tweets.length;

var oldIndex = -1;

var minutes = 5, the_interval = minutes * 1000//* 60 * 1000;

// setInterval(function() {
//   console.log("I am doing my 5 minutes check");
//   tweet();
//   //checkTweetsToRetweets();
// }, the_interval);


function tweet(){
	Twitter.post('statuses/update', {status: getRandomTweet() + " #PinhoBot"},  function(error, tweet, response){
		if(error){
			console.log(error);
		}
	});
}


function checkTweetsToRetweets(){
	Twitter.get('statuses/user_timeline', {screen_name: user.user_name},  function(error, data){
		if(error){
			console.log(error);
		}else{
			for(var i=0; i < data.length; i++){
				if(data[i].retweeted_status == null){
					if(data[i].retweeted == false){
						console.log("Nao foi retwittado");
						// grab ID of tweet to retweet
						var retweetId = data[i].id_str;
						// Tell TWITTER to retweet
						retweet(retweetId);
					}else{
						console.log("Ja foi retwittado");
					}
				}else{
					console.log("Eh retweet");
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

function getRandomTweet() {
	//calculate a random index
	var index = Math.floor(Math.random() * (maxTweets - 1));
	if(oldIndex == index){
		if(index == 0){
			index+1;
		}
		else{
			index-1;
		}
	}
	//return the random sentence
	oldIndex = index;
	return tweets[index];
}


