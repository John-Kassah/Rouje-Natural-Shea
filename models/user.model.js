import mongoose from "mongoose";
import bcrypt from "bcrypt";
import normalize from "normalize-mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    verificationToken: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    billingDetails: [
        {
            fullName: {
                type: String
            },
            email: {
                type: String,
                required: true
            },
            number: {
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
            defaultPaymentMethod: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PaymentMethod',
                default: null
            },

            billingInfo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BillingInfo',
                default: null
            }
        }
    ]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true, // Include virtuals
        transform: (doc, ret) => {
            delete ret.password; // Remove the password field
            delete ret._id;      // Remove the __v field
            return ret; // Return the modified object
        }
    }
}
);

// create a pre-save middleware to hash the values of any updated password fields 
// before savinig the user info to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();

    // Hash the password using bcrypt if 'password' field is modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); // continue to the next middleware 
});

// create/define an insatance method to compare the password entered by the user with the hashed password in the database so it can be called later when needed

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.plugin(normalize);

export const userModel = mongoose.model('User', userSchema);

