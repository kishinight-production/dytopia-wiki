// Fonctions
async function GiveIP() {
    await WriteTerminal("Téléchargement de l'outil de traçage...")
    const api = await load("https://api.ipify.org?format=json")
    if (!api) {
        await WriteTerminal("Affectation de l'adresse IP de base.")
        return IP = { ip: "0.0.0.0" }
    } else {
    await WriteTerminal("Outil téléchargée.", "correct")

    await WriteTerminal("Traçage...")
    const donnees = await charge(api)
    if (!donnees) {
        await WriteTerminal("Traçage échouée.", "erreur")
        return IP = { ip: "?.?.?.?" }
    } else {
    await WriteTerminal("Traçage réussi.", "correct")

    return donnees
}}}

async function TrierDocument() {
    await WriteTerminal("Téléchargement de l'index des fichiers...")
    const index = await load("https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/index.json")
    if (!index) {
        return false
    } else {
    await WriteTerminal("Index téléchargée.", "correct")

    await WriteTerminal("Chargement des fichiers présents dans l'index...")
    const contenu = await charge(index)
    if (!contenu) {
        return false
    } else {
    await WriteTerminal("Chargement réussi.", "correct")

    // Trier document

    await WriteTerminal("Préparation de la liste d'autorisation...")

    const chemins = []
    let nombre = 0
    const tags = JSON.parse(localStorage.getItem("tag") || "[]")

    for (const chemin of contenu) {
        await WriteTerminal(`Téléchargement et chargement du contenu du fichier n°${nombre + 1}...`)
        try {
            const reponse = await fetch(
                `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`
            )

            if (!reponse.ok) {
                await WriteTerminal("Le chemin n'as pas pu être chargé", "erreur")
            } else {
                const fichier = await reponse.text()
                const yamls = extraire_yaml(fichier)

                if (!yamls.tag) {
                    chemins.push({
                        chemin: chemin,
                        date: yamls.date,
                        titre: yamls.title,
                        tag: yamls.tag,
                        contenu: fichier
                    })
                } else if (tags.length > 0) {
                    for (const tag of tags) { if (tag === "perm+" || tag === yamls.tag) {
                        chemins.push({
                            chemin: chemin,
                            date: yamls.date,
                            titre: yamls.title,
                            tag: yamls.tag,
                            contenu: fichier
                        })
                        await WriteTerminal(`Fichier n°${nombre + 1} accordé.`, "correct")
                        break
                    }}
                } else { await WriteTerminal(`Fichier n°${nombre + 1} non accordé.`, "erreur") }
        }}
        catch(error) {
            await WriteTerminal(`Erreur d'un chargement d'un fichier.`, "erreur")
            await WriteTerminal(error, "erreur")
            nombre += 1
        }
    }

    return chemins
}}}