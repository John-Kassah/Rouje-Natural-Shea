import mongoose from 'mongoose';

const billingInfoSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    fullName: { 
        type: String, 
        required: true
    },
    emailForReceipts: { 
        type: String, 
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    address: {
        line1: { 
            type: String, 
            required: true
        },
        city: { 
            type: String, 
            required: false
        },
        postalCode: { 
            type: String, 
            required: false
        },
        country: { 
            type: String, 
            required: false
        }
   
    },

    updatedAt: { 
        type: Date, 
        default: Date.now
    }
});

billingInfoSchema.index({ userId: 1 });

const billingInfoModel = mongoose.model('BillingInfo', billingInfoSchema);

export default billingInfoModel;
