import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import nodemailer from "nodemailer";
import Config from "./Config.js";
import User from "./models/User.js"; // une minuscule a user ?
import groot from "./authGuard/authGuard.js";
import UserController from "./controllers/User.js";
const db = `mongodb+srv://cc:${Config.mdpBDD}@eccc.0fr40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

//-------------------------------------------------CONNEXION BASE DE DONNEES--------------------------------------------------------------------
mongoose.connect(db, (err) => {
    if (err) {
        console.error("error" + err);
    } else {
        console.log("connected at mongoDb");
    }
});

//----------------------------------------------------------------------------------------------------------------------------------------------
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        type: "login", //| Default
        user: Config.mail, //| Je recupére le Config.mail de mon fichier Config.js
        pass: Config.mdpMail, //| Je recupére le Config.mdpMail de mon fichier Config.js
    },
});

//------------------------------------------------------DEMARAGE DU SERVER----------------------------------------------------------------------
const app = express(); // Créer l'application express
app.use(session({ secret: "ssh", saveUninitialized: true, resave: true }));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.listen(8013, () => {
    // Ecoute sur le port 8013
    console.log("Server a démarer dans http://localhost:8013"); // Renvoi le message "Server a démarer dans http://localhost:8013"
});

//------------------------------------------------FORMULAIRE CONTACT FONCTION ENVOIE MESSAGE-------------------------------------------------------------
app.post("/contact", async (req, res) => {
    let message = "";
    let mailOptions = {
        from: req.body.email,
        to: "c.au.carre.ri7@gmail.com",
        subject: `demande de contact de ${req.body.fisrtname} ${req.body.email} ${req.body.sujet}`,
        text: req.body.message,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            message = "Votre message n'est pas transmis !";
            console.log(err);
            res.render("contact.html.twig", { message });
        } else {
            message = "Votre message est transmis !";
            res.render("contact.html.twig", { message });
        }
    });
});

//------------------------------------------------------ROUTE PAGE.HTML.TWIG--------------------------------------------------------------------
//---------------------------------------INDEX------------------------------------------------
app.get("/", async (req, res) => {
    res.render("index.html.twig");
});

//--------------------------------------CONTACT-----------------------------------------------
app.get("/contact", async (req, res) => {
    res.render("contact.html.twig", {
        page: "contact",
        user: req.session.user,
    });
});

//-------------------------------------CONNEXION----------------------------------------------
app.get("/connexion", async (req, res) => {
    res.render("connexion.html.twig");
});

app.post("/connexion", async (req, res) => {
    let user = await UserController.login(req.body);
    if (user.error) {
        res.render("connexion.html.twig", {
            error: user.error,
        });
    } else {
        req.session.userId = user._id;
        res.redirect("/accueil");
    }
});

//-------------------------------------INSCRIPTION--------------------------------------------
app.get("/sinscrire", async (req, res) => {
    res.render("sinscrire.html.twig");
});

app.post("/sinscrire", async (req, res) => {
    let user = await UserController.subscribe(req.body);
    if (user.errors) {
        res.render("sinscrire.html.twig", {
            errors: user.errors,
        });
    } else {
        req.session.userId = user._id;
        res.redirect("/monprofil/" + req.session.userId);
    }
});

//-----------------------------------------------------------CONNECTER--------------------------------------------------------------------------
//----------------------------------------ACCUEIL----------------------------------------------
app.get("/accueil/", groot, async (req, res) => {
    res.render("accueil.html.twig", {
        user: req.session.user,
    });
});

//---------------------------------------ENTREPRISE--------------------------------------------
app.get("/entreprises/:id", groot, async (req, res) => {
    res.render("entreprises.html.twig", {
        user: req.session.user,
    });
});

//----------------------------------------RECHERCHE--------------------------------------------
app.get("/recherche/:id", groot, async (req, res) => {
    res.render("recherche.html.twig", {
        user: req.session.user,
    });
});

//----------------------------------------CONTACTAD--------------------------------------------
app.get("/contactad/:id", groot, async (req, res) => {
    res.render("contactad.html.twig", {
        user: req.session.user,
    });
});

//-------------------------------------MON PROFIL-----------------------------------------------
app.get("/monprofil/:id", groot, async (req, res) => {
    res.render("monprofil.html.twig", {
        user: req.session.user,
    });
});

app.post("/monprofil/:id", groot, async (req, res) => {
    let user = await UserController.updateUser(req.session.userId, req.body);
    if (user.modifiedCount == 1) {                                               // modifiedCount deja mis
        res.redirect("/besoin/" + req.session.userId);
    }
});

app.get("/deconnexion", groot, async (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

//------------------------------------------BESOINS-----------------------------------------
app.get("/besoins/:id", groot, async (req, res) => {
    res.render("besoins.html.twig", {
        user: req.session.user,
        step: "entreprises",
        nextStep: "productions"
    });
});

app.post("/besoins/:id", groot, async (req, res) => {
    res.render("besoins.html.twig",{
        user: req.session.user,
        step: "entreprises",
        nextStep: "productions"
    });
});

app.post("/besoins/:id/:nextStep", groot, async (req, res) => {
    console.log(req.body);
    let user = await UserController.updateUser(req.session.userId, req.body);
        res.redirect(`/${req.params.nextStep}/${req.session.userId}`)
});

app.post("/besoins/:id/:step", groot, async (req, res) => {
console.log(req.body);
    let user = await UserController.updateUser(req.session.userId, req.body);
        res.redirect(`/${req.params.step}/${req.session.userId}`)
 });
 
//------------------------------------------PRODUCTIONS---------------------------------------------
app.get("/productions/:id", groot, async (req, res) => {
    res.render("productions.html.twig", {
        user: req.session.user,
        step: "entreprises",
        nextStep: "dechets"
    });
});

app.post("/productions/:id", groot, async (req, res) => {
    res.render("productions.html.twig", {
        user: req.session.user,
        step: "entreprises",
        nextStep: "dechets"
    });
});

app.post("/productions/:id/:nextStep", groot, async (req, res) => {
    let user = await UserController.updateUser(req.session.userId, req.body);
    res.redirect(`/${req.params.nextStep}/${req.session.userId}`)
 });
 
 app.post("/productions/:id/:step", groot, async (req, res) => {
    let user = await UserController.updateUser(req.session.userId, req.body);
    res.redirect(`/${req.params.step}/${req.session.userId}`)
 });

//---------------------------------------------DECHETS-----------------------------------------------
app.get("/dechets/:id", groot, async (req, res) => {
    res.render("dechets.html.twig", {
        user: req.session.user,
        step: "entreprises",
    });
});

app.post("/dechets/:id", groot, async (req, res) => {
    res.render("dechets.html.twig", {
        user: req.session.user,
        step: "entreprises",
    });
});

app.post("/dechets/:id/:step", groot, async (req, res) => {
    let user = await UserController.updateUser(req.session.userId, req.body);
    res.redirect(`/${req.params.step}/${req.session.userId}`)
 });
 
//-----------------------------------------------------CARD---------------------------------------

app.get("/card", async (req, res) => {
    res.render("ficheentreprise.html.twig");
});

//----------------------------------------------------------------------------------------------------------------------------------------------
