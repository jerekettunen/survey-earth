const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator')

const projectSchema = new mongoose.Schema(
  {
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
      validate: {
        validator: function (value) {
          return value >= -90 && value <= 90
        },
        message: 'Latitude must be between -90 and 90',
      },
    },
    longitude: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= -180 && value <= 180
        },
        message: 'Longitude must be between -180 and 180',
      },
    },
    type: {
      type: String,
      enum: ['Research', 'Monitoring', 'Historical', 'Other'],
      required: false,
    },
    startDate: {
      type: Date,
      required: false,
      get: function (value) {
        return value ? value.toISOString() : null
      },
    },
    endDate: {
      type: Date,
      required: false,
      get: function (value) {
        return value ? value.toISOString() : null
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: function (value) {
        return value ? value.toISOString() : null
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['Viewer', 'Editor', 'Admin'],
          default: 'Viewer',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
)

projectSchema.methods.getFormattedDate = function (dateField) {
  const date = this[dateField]
  if (!date) return null

  return date instanceof Date ? date.toISOString() : date
}

projectSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Project', projectSchema)
