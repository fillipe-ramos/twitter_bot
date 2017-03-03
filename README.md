# Twitter_bot
Twitter bot that tweets random generated words, retweets specific user, unfollows who is not following you.

## How to use it

* Clone this repository
* Open cloned folder in terminal(or equivalent) and then 

1. Install modules with
> npm install

2. Start bot with
> npm test


# Configuration

*File not included when cloning the repository*

Inside the main folder (/twitter_bot), create a folder called **private**. Inside should be 2 files: **secret.json** and **user.json**

File structure:
```
-private
--user.json
--secret.json
```

secret.json should have the following code:
```
{
	"consumer_key": "YOUR_KEY_HERE",
	"consumer_secret": "YOUR_SECRET_HERE",
	"access_token_key": "YOUR_KEY_HERE",
	"access_token_secret": "YOUR_SECRET_HERE"
}
```

To get your keys and tokens, follow this guide till Step 2 (or continue if you want to create one using python and tweepy).

user.json should have the following code:
```
{
	"target_user_name": "@user_name",
	"my_user_name": "@my_user_name"
}
```

* *target_user_name* is used to set the destination twitter in which you want to retweet.
* *my_user_name* is used to set your user so the bot can unfollow the ones that are not following you.
