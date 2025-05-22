import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        default: 'paystack',
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Mobile Money', 'Credit/Debit Card'],
        required: true
    },
    providerId: {
        type: String,
        required: false
    },
    isDefault: {
        type: Boolean,
        default: false
    },

    // Card-specific fields
    last4: String,
    cardBrand: String,
    expiry: String,

    // MoMo-specific fields
    phoneNumber: String,
    momoProvider: {
        type: String,
        enum: ['MTN', 'AirtelTigo', 'Vodafone']
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

paymentMethodSchema.index({ userId: 1 });

const paymentMethodModel = mongoose.model('PaymentMethod', paymentMethodSchema);

export default paymentMethodModel;
