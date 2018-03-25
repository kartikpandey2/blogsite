var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/intern_database',function(err){
	if(err)
	{
		console.log(err);
	}
	else{
		console.log('connected to database');
	}
});


var reg_schema = mongoose.Schema({
Local:{
		FirstName : {type: String},
		LastName :{type : String},
		Username    :{type : String},
		Password :{type : String},
		Follow  :[{
					name:{type:String}
				  }],
		Article:[{
	 		Title:{type:String},
	 		Content:{type:String}
	 		}]
 	}
})

var User = mongoose.model('User',reg_schema);

exports.User = User;