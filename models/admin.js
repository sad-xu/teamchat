const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

/* 已废弃 */

const adminSchema = mongoose.Schema({
	account: {
		type: String, 
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	token: {
		type: String
	}
});

// 加密密码
adminSchema.pre('save', function(next) {
	let admin = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) return next(err);
			bcrypt.hash(admin.password, salt, (err, hash) => {
				if (err) return next(err);
				admin.password = hash;
				next();
			})
		})
	} else {
		return next();
	}
});

// 验证密码
adminSchema.methods.comparePassword = function(psd, callback) {
	bcrypt.compare(psd, this.password)
				.then((isMatch) => {
					callback(null, isMatch)
				})
				.catch(err => callback(err))
}

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;