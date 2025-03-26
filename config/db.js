const mongoose = require('mongoose');
require('dotenv').config()

const connectdb= async () => {
	await mongoose.connect(process.env.db_url);
	
}
module.exports = connectdb;