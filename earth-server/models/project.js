const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator')

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Research', 'Monitoring', 'Historical', 'Other'],
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

projectSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Project', projectSchema)
