/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
     id: {
      type: 'string',
      size: 36,
      primaryKey: true,
      unique: true,
    },
    mobile: {
      type: 'string',
      unique: true,
      numeric: true,
      maxLength: 10,
      minLength: 10,
      required: true,
    },
    email: {
      type: 'email',
      required: true,
    },
    firstName: 'string',
    lastName: 'string',
    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },
  },
  beforeCreate: function(values, next) {
    if (values.id) {
      delete values.id;
    }
    if (values.createdAt) {
      delete values.createdAt;
    }
    if (values.updatedAt) {
      delete values.updatedAt;
    }

    values.id = utils.uuid();

    next();
  },

  beforeUpdate: function(values, next) {
    if (values.id) {
      delete values.id;
    }
    if (values.createdAt) {
      delete values.createdAt;
    }
    if (values.updatedAt) {
      delete values.updatedAt;
    }
    if (values.mobile) {
      delete values.mobile;
    }
    
    next();    
  },

};

