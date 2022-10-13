import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import config from 'config'


export interface UserInput {
    email: string,
    password: string
}


export interface UserDocument extends UserInput, mongoose.Document {
    firstName: string
    lastName: string
    fullName: string
    about: string
    url: string
    phone: string
    country: string
    lang: string,
    createdAt: Date,
    updatedAt: Date
    comparePassword: (candidatePwd: string) => Promise<Boolean>
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ''
    },
    lang: {
        type: String,
        default: ''
    }
    },
    {
        timestamps: true
    }
)


userSchema.pre('save', async function(next) {
    const user = this as UserDocument;
    if(!user.isModified('password')) return next()

    const salt = await bcrypt.genSalt(config.get<number>('salt'));

    const hash = bcrypt.hashSync(user.password, salt);

    user.password = hash

    return next()
})


userSchema.methods.comparePassword = async function (candidatePwd: string) : Promise<boolean> {
    const user = this as UserDocument;
    return await bcrypt.compare(candidatePwd, user.password).catch(err => false)
}


userSchema.virtual('fullName').get(function (this: UserDocument) {
    return `${this.firstName} ${this.lastName}`
})

// userSchema.index({ email: 1}, { unique: true })

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;



