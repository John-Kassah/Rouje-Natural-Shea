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
        enum: ['Skin', 'Hair', 'Cleansers', 'Natural Oils', 'Gifts and Sets', 'Other'],
        required: true,
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
    }],
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

// Compound index: category ascending. We could have added more index fileds after a "," and with thesame after each addition.
//The MongoDB query planner will use the index to speed up a read request if the query filter contains a field equal to the index field for the index created.
productSchema.index({ category: 1 });


export const productModel = new mongoose.model('Product', productSchema);