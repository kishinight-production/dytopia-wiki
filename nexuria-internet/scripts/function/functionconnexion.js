// Fonctions
function verif(Item) {
    Item = String(Item)

    if (localStorage.getItem(Item)) {
        return true
    }
    else {
        return false
    }
}

async function charger_connexion() {
    await WriteTerminal("Téléchargement de la base de données de connexion...")
    const fichier = await load("assets/connexion.json")
    if (!fichier) {
        return false
    } else {
    await WriteTerminal("Base de données de connexion téléchargée.", "correct")

    await WriteTerminal("Chargement du contenu de la base de données...")
    const contenu = await charge(fichier)
    if (!contenu) {
        return false
    } else {
    await WriteTerminal("Base de données de connexion chargée.", "correct")

    return contenu
}}}

async function identifiant(listeID) {
    await WriteTerminal("Votre identifiant ?:")
    ADDinput("visiteur")
    const id = await ListenInput()

    await WriteTerminal(`Recherche de l'identifiant "${id}" sur la base de données de connexion...`)
    for (const connexion of listeID) {
        await WriteTerminal("Recherche en cours...")
        if (connexion.id === id) {

            await WriteTerminal(`L'identifiant "${id}" à bien été trouver sur la base de données de connexion.`, "correct")
            return connexion

        }
    }

    await WriteTerminal(`Aucun identifiant correspond à "${id}" sur la base de données de connexion.`, "erreur")
    return false
}

async function code(listeID) {
    await WriteTerminal("Votre mot de passe ?:")
    ADDinput("12345", "password")
    const code = await ListenInput()

    await WriteTerminal(`Recherche de la correspondance de votre code...`)
    if (listeID.code === code) {

        await WriteTerminal(`Mot de passe correct.`, "correct")
        return true
    }

    return false
}