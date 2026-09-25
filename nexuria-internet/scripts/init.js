async function init() {
    try {
        if (localStorage.getItem("id")) {
            const IP = await GiveIP()

            localStorage.setItem("IP", IP.ip)
        } else { return reset("Error: Aucune données de LocalStorage.") }

        if (!localStorage.getItem("chemins")) {
            const liste_fichier = await TrierDocument()

            if (!liste_fichier) {
                return reset("Error: Un problème est survenue lors du chargement.")
            }

            localStorage.setItem("chemins", JSON.stringify(liste_fichier))
        } else { await WriteTerminal("Chargement de la liste d'autorisation préconfigurer...") }

        await WriteTerminal("Chargement du terminal...")

        document.getElementById("header").style.display = "grid"
        document.getElementById("footer").style.display = "grid"

        return terminal()
    }
    catch(error) {
        return reset(error)
    }
}