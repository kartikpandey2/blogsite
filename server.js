var User = require('./database.js').User;
var express = require('express');
var app = express();
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var bcrypt   = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Mongostore = require('connect-mongo')(session);
const saltRounds = 10;
//middleware
app.use(bodyParser.json());
app.use(session(
{
secret:'iamkartik',
store: new Mongostore(
{url:'mongodb://localhost/intern_database',
ttl:14*24*60*60}),
resave: false ,
saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(bodyParser.urlencoded({ extended: true }));



passport.use(new LocalStrategy(function(username,password,done){
	User.findOne({'Local.Username':username},function(err,user){
		if(err){
			return done(err);
		}
		if(!user){
			return done(null, false, { message: 'Incorrect username or password.' });
		}
		//console.log(user.Local.Password)
		bcrypt.compare(password, user.Local.Password, function(err, result) {
         if(err)
		 {
			 console.log(err);
		 }
		 if(result){
			return done(null, user); 
		 }
		 return done(null, false);
		});
		
	})
}));

passport.serializeUser(function(user, done) {  
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


//routes


app.post('/blogpost',isLoggedIn,function(req,res){
	//getting data
	title = req.body.title
	content = req.body.content
	//checking data is empty 
	if(title&&content){
		//pushing blog to databse
		User.findOneAndUpdate({"_id":req.session._id},{ $push: { "Local.Article": {"Title":title,"Content":content} }},function(err,user){
			if(err){
				console.log(err)
			}
			else{
				res.send({success: true, msg: 'Blog added'})
			}
  		})
	}
	//if data is empty
	else{
		res.send({success:false,msg:'fill all fields'})
	}
})


app.post('/register',function(req,res){
	//getting data
	Username = req.body.Username
	 Password = req.body.Password
	 FirstName = req.body.FirstName
	 LastName = req.body.LastName
	 BlogUrl = req.body.BlogUrl
	 //if data is not empty
	if(Username&&Password&&FirstName&&LastName&&BlogUrl)
		{
			var new_user = User();
			new_user.Local.FirstName = FirstName;
			new_user.Local.LastName = LastName;
			new_user.Local.Username = Username;
			new_user.Local.BlogUrl = BlogUrl;
			//hashing password
			bcrypt.hash(Password,null,null, function(err, hash) {
				 if(err)
				 {
					 console.log(err);
				 }
				 else{
				 	new_user.Local.Password = hash;
				 }
				})
			//saving data
			new_user.save(function(err){
				if(err){
					res.send({success:false,msg:'username taken or blogurl taken'});
				}
				else
				{res.send({success: true, msg: 'Successful user registration'})}
			})	 
		}
		// if data is empty
		else{
			res.send({success: false, msg: 'enter all fields'})
		}
})


app.get('/fail',function(req,res){
	res.send({success: false, msg: 'login failed'})
})

app.post('/login',passport.authenticate('local',{ failureRedirect: '/fail' }),function(req,res){
	//setting session
	req.session._id = req.user._id;
	res.send({success: true, msg: 'Login Successful'});
});



app.get('/follow/:username',isLoggedIn, function (req, res) {
	//finding _id = session id and then pushing username into database
  	User.findOneAndUpdate({"_id":req.session._id},{ $push: { "Local.Follow": {"name":req.params.username} }},function(err,user){
  		if(err){
  			res.send({success: false, msg: 'err'})
  		}
  		else{
  			res.send({success: true, msg: 'Updated'})
  		}
  	})
}); 


app.get('/feed',isLoggedIn,function(req,res){
	//finding username which are followed by user
	User.findOne({"_id":req.session._id},function(err,user){
			if(err){
				res.send({err})
			}
			else{
				follow = user.Local.Follow
				//names array of followed users
				names = follow.map(function(follow){
					return follow.name
				})
				//geting blogs of followed user
				User.find({"Local.Username":{$in:names}},"Local.Article",function(err,data){
					res.send({data:data})
				})
			}
	})
})

//server listening
app.listen(3000,function(){
	console.log('Server is running at port:3000');
});

//function

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
	{
		return next();
	}   
	else{ 
	res.send('please login');}
   
}

