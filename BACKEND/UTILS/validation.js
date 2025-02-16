const Joi = require("joi");

// Validate user registration
exports.validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$"
        )
      )
      .message(
        "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      ),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  return schema.validate(data);
};

// Validate user login
exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};
