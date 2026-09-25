// Scripts
localStorage.setItem("version", `V 1.0.0.0`)

try {
    connexion()
}
catch(error) {
    reset(error)
}

// Fonction
async function connexion() {
    try {
        await WriteTerminal("Vérification d'un identifiant dans le LocalStorage...")
        if (!verif("id")) {
            await WriteTerminal("Aucun identifiant dans le LocalStorage.", "erreur")
            await WriteTerminal("Préparation à l'entrer des identifiants et mots de passe...")

            const json = await charger_connexion()

            if (!json) {
                return reset("Error: Erreur de chargement/téléchargement de la base de données de connexion.")
            }

            const ligne = await identifiant(json)

            if (!ligne) {
                return reset("Error: Mauvais identifiant.")
            }

            const passe = await code(ligne)

            if (!passe) {
                return reset("Error: Mauvais mot de passe.")
            }

            localStorage.setItem("tag", JSON.stringify(ligne.tag))
            localStorage.setItem("nom", ligne.nom)
            localStorage.setItem("id", ligne.id)

            return init()

        } else {
            await WriteTerminal("Nous avons trouver une connexion dans le LocalStorage", "correct")
            await WriteTerminal(`Identifiant: ${localStorage.getItem("id")}`,)

            await WriteTerminal("Souhaitez vous, vous reconnecter ? yes or no.")
            ADDinput("yes")
            const reponse = await ListenInput()
        
            if (reponse === "yes") {
                localStorage.removeItem("tag")
                localStorage.removeItem("nom")
                localStorage.removeItem("id")

                return connexion()
            } else { return init() }
        }
    }
    catch(error) {
        return reset(error)
    }
}

async function reset(error) {
    try {
        await WriteTerminal(error, "erreur")
        await WriteTerminal("Redémarrage du terminal...")

        await wait(1000)
        return connexion()
    }
    catch(error) {
        console.log(`(Nom de la version: ${Version} / Date: ${horloge()}) - ${error} `)
    }
}