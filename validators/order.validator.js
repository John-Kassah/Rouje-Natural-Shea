import Joi from "joi";

export const orderValidator = Joi.object({
    user: Joi.string().required(),
    items: Joi.array().items(
            Joi.object({
                product: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                priceAtPurchase: Joi.number().min(0).required()
            })
    ).min(1).required(),
    total: Joi.number().min(0).required(),
    status: Joi.string().valid('Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled')
}).options({ abortEarly: false });