import Joi from "joi";

export const orderValidator = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    paymentMethod: Joi.string().required()
}).options({ abortEarly: false });

export const guestOrderValidator = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    paymentMethod: Joi.string().required(),

    cart: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        )
}).options({ abortEarly: false });