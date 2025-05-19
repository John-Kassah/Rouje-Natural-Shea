import { cartModel } from "../models/carts.model.js";

export const getOrCreateCart = async (userId) => {
  let cart = await cartModel.findOne({ user: userId });

  if (!cart) {
    cart = await cartModel.create({ user: userId, items: [] });
  }

  return cart;
};
