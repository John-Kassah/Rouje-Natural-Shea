import Joi from "joi";

export const cartValidator = Joi.object({
    user: Joi.string().required(), // Should be a valid ObjectId, you can add .regex(/^[0-9a-fA-F]{24}$/) if you want to strictly check for ObjectId
    items: Joi.array().items(
                Joi.object({
                    product: Joi.string().required(), // Should be ObjectId
                    quantity: Joi.number().integer().min(1).required()
                })
    ).min(1).required()
}).options({ abortEarly: false });