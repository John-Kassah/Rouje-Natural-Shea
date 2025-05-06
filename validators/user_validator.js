import Joi from "joi";

export const userRegistrationValidator = Joi.object({
    userName: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Passwords do not match'
    })
}).options({ abortEarly: false });

export const userLoginValidator = Joi.object({
    userName: Joi.string(),
    email: Joi.string(),
    password: Joi.string().required(),
});

