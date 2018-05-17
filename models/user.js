const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
	account: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	canuse: {
		type: Boolean,
		required: true
	},
	token: {
		type: String
	},
	level: {
		type: Number,
		required: true
	}, 
	notification: {
		type: Boolean,
		required: true,
		default: true
	}, 	
	platform: {
		type: String
	}
});

// 加密密码 
userSchema.pre('save', function(next) {  
	let user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) return next(err);
			bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) return next(err);
				user.password = hash;
				next();
			})
		})
	} else{
		return next();
	}
});


// 验证密码 *箭头函数不绑定this!*
userSchema.methods.comparePassword = function(psd, callback) {
	bcrypt.compare(psd, this.password)
				.then((isMatch) => {
					callback(null, isMatch)
				})
				.catch(err => callback(err))
} 



const User = mongoose.model('User', userSchema);

module.exports = User; 