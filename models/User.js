import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    ciename: {
        type: String,
        required: [true, "Manque nom d'entreprise"],
    },
    name: {
        type: String,
        required: [true, 'Manque nom'],
    },
    firstname: {
        type: String,
        required: [true, 'Manque prénom'],
    },
    fonctionname: {
        type: String,
        required: [true, 'Manque fonction'],
    },
    email: {
        type: String,
        required: [true, 'Manque votre mail'],
    },
    password: {
        type: String,
        required: [true, 'Manque mot de passe']
    },
})

const User = mongoose.model('User', userSchema)

export default User

