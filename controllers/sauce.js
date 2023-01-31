const Sauce = require("../models/Sauce"); // Modèle sauce
const fs = require("fs"); // Modification de fichiers

// Creation sauce
function createSauce(req, res, next) {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    // Nouvel objet sauce
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // url de l'image enregistrer dans la bdd et dans le fichier images
  });
  sauce
    .save() // la sauce est sauvegardée dans la bdd
    .then(() => res.status(201).json({ message: "Sauce sauvegardée" }))
    .catch((error) => res.status(400).json({ error }));
}

function modifySauce(req, res, next) {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Utilisateur non identifié" });
        return false;
      } else {
        console.log("utilisateur vérifié");
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
            .catch((error) => {
              console.log(error);
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
}

function deleteSauce(req, res, next) {
 Sauce.findOne({ _id: req.params.id })
   .then((sauce) => {
     if (sauce.userId != req.auth.userId) {
       res.status(401).json({ message: "Non-autorisé" });
       return false;
     } else {
       const filename = sauce.imageUrl.split("/images/")[1];
       fs.unlink(`images/${filename}`, () => {
         Sauce.deleteOne({ _id: req.params.id })
           .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
           .catch((error) => {
             console.log(error);
             res.status(401).json({ error });
           });
       });
     }
   })
   .catch((error) => {
     console.log(error);
     res.status(500).json({ error });
   });
}

function getAllSauces(req, res, next) {
  // Récupération de toutes les sauces
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
}

function getOneSauce(req, res, next) {
  // Récupération d'une seule sauce
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
}

//Boutons Like et dislike
function likeSauce(req, res, next) {
  const like = req.body.like;
  if (like === 1) {
    // bouton like
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId },
        _id: req.params.id,
      }
    )
      .then(() => res.status(200).json({ message: "Vous aimez cette sauce" }))
      .catch((error) => res.status(400).json({ error }));
  } else if (like === -1) {
    // bouton dislike
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
        _id: req.params.id,
      }
    )
      .then(() =>
        res.status(200).json({ message: "Vous n’aimez pas cette sauce" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else {
    // Annuler le like ou le dislike
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then(() =>
              res.status(200).json({ message: "Vous n’aimez plus cette sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
              _id: req.params.id,
            }
          )
            .then(() =>
              res.status(200).json({
                message: "Vous aimerez peut-être cette sauce à nouveau",
              })
            )
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
}

module.exports = {
  createSauce,
  modifySauce,
  deleteSauce,
  getAllSauces,
  getOneSauce,
  likeSauce,
};
