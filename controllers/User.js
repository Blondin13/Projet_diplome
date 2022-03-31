import User from "../models/User.js";
import { cryptPassword } from "../crypte_mdp/cryptPassword.js";
import { comparePassword } from "../crypte_mdp/cryptPassword.js";
import path from "path";
import { fileURLToPath } from "url";
import fetch from 'node-fetch'
import Config from "../Config.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url); //retourne le chemin absolu du fichier en cours
const __dirname = path.dirname(__filename); //retourne le chemin absolu de la racine du projet

//---------------------------------------------verification formlaire d'inscription------------------------------------------------------------
export class UserController {
    static async subscribe(user) {
        let objerror = {
            errors: [],
        };
        let userSaved = null;
        if (user.password != user.confirmpassword) {
            objerror.errors.push("le mot de passe n'est pas le meme");
            return objerror;
        }
        user.password = await cryptPassword(user.password); //je crypte le mot de passe de l'utilisateur avant de l'inséré en base page utilisé (cryptPassword.js)
        const newUser = new User(user);
        let err = newUser.validateSync(); // cette methode retourne une erreur si notre objet n'est pas conforme au (User.js models)
        if (err) {
            for (let i = 0; i < Object.values(err.errors).length; i++) {
                //je parcours les erreurs
                objerror.errors.push(Object.values(err.errors)[i].message); //je les inseres dans mon tableau d'erreur
            }
            return objerror; //je retourne mon tableau d'erreur si il y en a
        }
        let findUser = await User.findOne({ email: user.email }); //({ mail: user.email }) //je verifie si un utilisateur avec le meme mail existe en base
        if (!findUser) {
            // si aucun utilisateur en base
            userSaved = await newUser.save(); //je l'insere en base
            return userSaved;
        } else {
            // si il y en a un en base
            objerror.errors.push("Ce mail à deja été utilisé"); //j'insere une erreur dans mon tableau d'erreur
            return objerror; // et je retourne mon tableau d'erreur
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------
    static async getUsers() {
        return await User.find();
    }
    static async getUser(id, excludeFields) {
        return await User.findOne({ _id: id }, excludeFields);
    }

    static async updateUser(id, updtatedUser) {
    
        let test = await fetch(encodeURI(`http://api.positionstack.com/v1/forward?access_key=${Config.ApiKey}&query=${updtatedUser.ndevoie} ${updtatedUser.tdevoie} ${updtatedUser.voiename} ${updtatedUser.codepostal} ${updtatedUser.ville} ${updtatedUser.pays}&country=FR`))
        test = await test.json()
        console.log(test);
        updtatedUser.latitude = test.data[0].latitude
        updtatedUser.longitude = test.data[0].longitude
        return await User.updateOne({ _id: id }, updtatedUser);
    }
    
    static async deleteUser(id) {
        return await User.deleteOne({ _id: id });
    }

    static async login(body) {
        let objerror = {
            error: "",
        };
        let user = await User.findOne({ email: body.email });
        if (user) {
            let compare = await comparePassword(body.password, user.password);
            if (compare) {
                return user;
            } else {
                objerror.error = "Le mot de passe n'est pas valide";
                return objerror;
            }
        } else {
            objerror.error = "L'utilisateur n'existe pas !";
            return objerror;
        }
    }
}

export default UserController;
