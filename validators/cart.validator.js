import Joi from "joi";

export const cartValidator = Joi.object({
    user: Joi.string().required(),
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().required(), // Should be ObjectId
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
}).options({ abortEarly: false });