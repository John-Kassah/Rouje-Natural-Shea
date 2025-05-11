import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Skin', 'Hair', 'Clensers', 'Natural Oils', 'Other'],
        default: 'Other'
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    newArrival:{
        type: Boolean,
        default: 'false'
    },
    productImageUrls: [{
        type: String
    }]
})

export const productModel = new mongoose.model('Product', productSchema);