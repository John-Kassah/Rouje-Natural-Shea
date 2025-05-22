import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        }
    ],
    provider: {
        type: String,
        default: 'paystack',
    },
    type: {
        type: String,
        enum: ['card', 'momo', 'bank'],
        default: 'momo',
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
