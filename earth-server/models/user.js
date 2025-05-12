const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    isEmail: true,
    unique: true,
    minlength: 8,
  },
  password: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('User', schema)
