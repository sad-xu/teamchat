const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	group: [
		{
			type: [mongoose.Schema.Types.ObjectId],
			ref: 'User',
			default: []
		}
	],
	canuse: {
		type: Boolean,
		required: true
	}
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;