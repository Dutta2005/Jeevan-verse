import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const addressSchema = new mongoose.Schema({
    state: { 
        type: String, 
        required: true 
    },
    district: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    }
});

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    canDonate: { 
        type: Boolean, 
        required: true 
    },
    address: { 
        type: addressSchema, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['doctor', 'medical student', 'others'], 
        required: true 
    },
    info: {
        bloodGroup: { 
            type: String, 
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
            required: true 
        },
        height: { 
            type: Number, 
            required: true 
        },
        weight: { 
            type: Number, 
            required: true 
        }
    },
    password: { 
        type: String, 
        required: true 
    },
    refreshToken: { 
        type: String 
    }
}, { 
    timestamps: true 
});

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.isPasswordMatched = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    const expiresIn = process.env.ACCESS_TOKEN_EXPIARY || '86400s';
    console.log(`Generating access token with expiration: ${expiresIn}`);
    return jwt.sign({_id: this._id, email: this.email, name: this.name}, process.env.ACCESS_TOKEN_SECRET, {expiresIn})
}

userSchema.methods.generateRefreshToken = function() {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIARY || '864000s';
    console.log(`Generating refresh token with expiration: ${expiresIn}`);
    return jwt.sign({_id: this._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn})
}


export const User = mongoose.model('User', userSchema);
