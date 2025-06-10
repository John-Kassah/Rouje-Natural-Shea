import paymentMethodModel from "../models/paymentMethod.model.js";
import { userModel } from "../models/user.model.js";


export const addPaymentMethod = async (req, details) => {
  try {
    const user = await userModel.findOne({email: req.user.email})
    if (!user) {
      console.log('user not found');
      return
    }
    const userId = user.id;

    const method = new paymentMethodModel({ userId, provider: 'paystack', fullName:  details.fullName, email: details.email, phone: details.phone, address: details.address, city: details.city, paymentMethod: details.paymentMethod, phoneNumber: details.phoneNumber });
    await method.save();

    return method;
  } catch (error) {
    console.log(`This error was thrown in an attempt to add an order: ${error.message}`);
  }
};

export const addGuestPaymentMethod = async (req, details) => {
  try {
    const paymentMethod = new paymentMethodModel({ provider: 'paystack', fullName:  details.fullName, email: details.email, phone: details.phone, address: details.address, city: details.city, paymentMethod: details.paymentMethod, phoneNumber: details.phoneNumber });
    await paymentMethod.save();

    return paymentMethod;
  } catch (error) {
    console.log(`This error was thrown in an attempt to add an order: ${error.message}`);
  }
};