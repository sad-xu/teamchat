const mongoose = require('mongoose')

const msgSchema = mongoose.Schema({
	roomid: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
		ref: 'Room'
	},
	from: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	to: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true
	},
	time: {
		type: Date,
		default: Date.now
	},
	content: {
		type: String,
		requires: true
	}
});

const Msg = mongoose.model('Msg', msgSchema);

module.exports = Msg;