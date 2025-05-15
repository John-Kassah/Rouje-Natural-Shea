import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            priceAtPurchase: {
                type: Number,
                required: true
            },
        }, { _id: false }
    ],
    total: {
        type: Number,
        required: true
    },
    paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
    createdAt: {
        type: Date, default: Date.now
    },
    updatedAt: {
        type: Date, default: Date.now
    },
}, {
    timestamps: true,
});

export const orderModel = mongoose.model('Order', orderSchema);
