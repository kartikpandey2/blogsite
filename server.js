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
		console.log(user)
		if(err){
			return done(err);
		}
		if(!user){
			return done(null, false, { message: 'Incorrect username or password.' });
		}
		console.log(user.Local.Password)
		bcrypt.compare(password, user.Local.Password, function(err, result) {
			console.log(result)
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
	title = req.body.title
	content = req.body.content
	if(title&&content){
		
	}
})

app.get('/register',function(req,res){
	res.sendFile(__dirname+'/test.html');
})

app.post('/register',function(req,res){
	Username = req.body.Username
	 Password = req.body.Password
	 FirstName = req.body.FirstName
	 LastName = req.body.LastName
	 BlogUrl = req.body.BlogUrl
	if(Username&&Password&&FirstName&&LastName&&BlogUrl)
		{
			var new_user = User();
			new_user.Local.FirstName = FirstName;
			new_user.Local.LastName = LastName;
			new_user.Local.Username = Username;
			bcrypt.hash(req.body.password, null, null, function(err, hash) {
				 if(err)
				 {
					 console.log(err);
				 }
				 else{
				 	new_user.Local.Password = hash;
				 }
				})
			new_user.save(function(err){
			if(err){
				console.log(err);
			}
			res.send('User register success');})	 
		}
		else{
			res.send('fill all fields')
		}
})

app.get('/login',function(req,res){

	res.sendFile(__dirname+'/login.html');
})

app.post('/login',passport.authenticate('local',{ failureRedirect: '/login' }),function(req,res){
	req.session.username = 'abc';
	res.send('welcome');
});



app.put('/follow/:username', function (req, res) {
	console.log(req.session.Username)
  	User.update({username:req.session.Username},{local.Follow.name:req.params.username},function(req,res){
  		res.send("done")
  	})
}); 

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

