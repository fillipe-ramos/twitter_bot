var TwitterPackage = require('twitter');


var secret = require("../private/secret");
var Twitter = new TwitterPackage(secret);

var tweets = require("./tweets");

var maxTweets = tweets.length;

var oldIndex = -1;

var minutes = 5, the_interval = minutes * 60 * 1000;
/*setInterval(function() {
  console.log("I am doing my 5 minutes check");
  Twitter.post('statuses/update', {status: getRandomTweet() + " #PinhoBot"},  function(error, tweet, response){
	  if(error){
		console.log(error);
	  }
	});
}, the_interval);*/

Twitter.get('statuses/user_timeline', {screen_name: '@leninho', count: 2},  function(error, data){
	  if(error){
		console.log(error);
	  }else{
		  for(var i=0; i < data.length; i++){
			  if(data[i].retweeted_status == null){
				  console.log("Nao eh retweet");
				  if(data[i].retweeted == false){
					console.log("Nao foi retwittado");
					// grab ID of tweet to retweet
					var retweetId = data[i].id_str;
					console.log(retweetId);
					// Tell TWITTER to retweet
					/*Twitter.post('statuses/retweet/:id', {
						id: retweetId
					}, function(err, response) {
						if (response) {
							console.log('Retweeted!!!');
						}
						// if there was an error while tweeting
						if (err) {
							console.log('Something went wrong while RETWEETING... Duplication maybe...');
						}
					});*/
				  }else{
					  console.log("Ja foi retwittado");
				  }
			  }else{
					console.log("Eh retweet");
			  }
		  }
		  //console.log(data);
			/*/ grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell TWITTER to retweet
            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (response) {
                    console.log('Retweeted!!!');
                }
                // if there was an error while tweeting
                if (err) {
                    console.log('Something went wrong while RETWEETING... Duplication maybe...');
                }
            });*/
	  }
});


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


