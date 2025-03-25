const Joi = require("joi");

// Validate user registration
exports.validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(30)
      .pattern(/^[a-zA-Z\s]+$/)
      .message('Name can only contain letters and spaces')
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 30 characters'
      }),
      
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
      
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase, uppercase, number, and special character',
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Validate user login
exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};