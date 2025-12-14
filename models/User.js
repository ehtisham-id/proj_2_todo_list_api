import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import pino from 'pino';
import Todo from './Todo.js';
import RefreshToken from './RefreshToken.js';

const logger = pino();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },

    //for email verification
    isVerified: {
        type: Boolean,
        default: true,
    },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    logger.info(`Password hashed successfully`);
    next;
})

// CASCADE DELETE: runs when calling userDoc.deleteOne()
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        await Todo.deleteMany({ user: this._id });
        await RefreshToken.deleteMany({ user: this._id });
        next;
    } catch (err) {
        next;
    }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;
