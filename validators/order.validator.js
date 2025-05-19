import Joi from "joi";

export const orderValidator = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    paymentMethod: Joi.string().required()
}).options({ abortEarly: false });