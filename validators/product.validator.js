import Joi from "joi";

export const addProductValidator = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),
    newArrival: Joi.boolean()
})