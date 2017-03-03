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
	//checkTweetsToRetweet();
}, the_interval);*/

showMain();
// Main
function showMain() {
    console.log(
        '1 = 20 Tweets with random words' + '\n' +
        '2 = Unfollow who is not following you back...'  + '\n' +
		'3 = Retweet from target_user_name' + '\n' + 
        '4 = Exit'  + '\n\n' +
        'Choose number, then press ENTER:'
        );
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', checkMenu);

    function checkMenu() {
        var input = process.stdin.read();
        if(input !== null) {
            switch(input.trim()) {
                case '1': checkTweetDone(); break;
                case '2': checkUnFollowNotFollowingDone(); break;
				case '3': checkRetweetDone(); break;
                case '4': process.exit(); break;
                default: 
					console.log('\x1b[31m%s\x1b[0m', 'NOT an option' + '\n');
					showMain();
            }
        }
    }
}

function checkTweetDone(){
	tweet(function(response){
		if(response){
			showMain();
		}
	});
}

function checkUnFollowNotFollowingDone(){
	unFollowNotFollowing(function(response){
		if(response){
			showMain();
		}
	});
}
function checkRetweetDone(){
	retweet(function(response){
		if(response){
			showMain();
		}
	});
}


/* 
	|-----------------------------------------------------------------------|
	|--------------------------------- Tweet -------------------------------|
	|-----------------------------------------------------------------------|
*/ 

function tweet(callback){
	var tweeted = 0;
	while(tweeted < 20){
		Twitter.post('statuses/update', {status: generateSentence() + " #PinhoBot"},  function(error, tweet, response){
			if(error){
				console.log(error);
			}
		});
		tweeted++;
	}
	if(tweeted == 20){
		callback(true);
	}else{
		callback(false);
	}
}


/* 
	|-----------------------------------------------------------------------|
	|--------------------------------- Retweet -----------------------------|
	|-----------------------------------------------------------------------|
*/

function retweet(callback){
	checkTweetsToRetweet(function(response) {
    	if(response != null){
			callback(response);
		}
	})
}

function checkTweetsToRetweet(callback){
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
						retweetById(retweetId);
					}else{
						console.log("Already retweeted");
					}
				}else{
					console.log("It is a retweet");
				}
			}
			console.log('Done.' + '\n');
			callback(true);
		}
	});
}

function retweetById(retweetId){
	Twitter.post('statuses/retweet/' + retweetId , function(error, response) {
		// if there was an error while tweeting
		if (error) {
			console.log(error, 'Something went wrong while RETWEETING... Duplication maybe...');
		}else{
			console.log('Retweeted!!!');
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
			console.log('\x1b[33m%s\x1b[0m: ', "Succesfully removed: " + data.screen_name);
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

function unFollowNotFollowing(callback){
	checkFollowingList(function(response) {
    	if(response != null){
    		console.log(response.ids.length);
    		var minutes = 5, the_interval = minutes * 1000//* 60 * 1000;
    		var i = 0;
    		// Wait some seconds to unfollow to not reach API's limit
    		var timer = setInterval(function() {
	    		if(i == response.ids.length){
					clearInterval(timer);
					console.log('Done.' +  '\n');
					callback(true);
				}else{
					relationshipOfUser(response.ids[i], function(relationship){
						if(!relationship.source.followed_by){
							console.error("He is NOT following you back.");
							unFollowById(relationship.target.id_str);
						}else{
							console.log('\x1b[32m%s\x1b[0m', "He is following you back");
						}
					})
				}
				i++;
			}, the_interval);
		}
	});
}

