const bcrypt = require("bcrypt"); // hashage password
const User = require("../models/User"); // modele Utilisateur
const jwt = require("jsonwebtoken"); // token generator package

// Inscription Utilisateur
function createUser(req, res, next) {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        // créer un nouveau user
        email: req.body.email, // l'adresse mail
        password: hash, // le mot de passe haché
      });
      user
        .save() // et mongoose le stocke dans la bdd
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
}

// connexion de l'utilisateur
function login(req, res, next) {
  User.findOne({ email: req.body.email }) // Verification de l'email dans la bdd
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password) // Comparaison des mdp
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              // Creation du token
              { userId: user._id },
              process.env.JWT_PASSWORD,
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
}

module.exports = { createUser, login };
