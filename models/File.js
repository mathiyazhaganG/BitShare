const mongoose=require('mongoose');

const File = mongoose.Schema({
	path:{
		type:String,
		required:true
	},
	Originalname:{
		type:String,
		required:true
	},
	password:{
		type:String
	},
	downloadcount:{
		type:Number,
		default:0
	}
})

module.exports=mongoose.model("File",File);