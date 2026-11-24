async function terminal() {
    try {
        // Configuration du header
        document.getElementById("user").textContent = `Bienvenue "${localStorage.getItem("nom")}" - IP connecté: ${localStorage.getItem("IP")}`

        // Configuration du footer
        document.getElementById("version").textContent = localStorage.getItem("version")
        function function_horloge() {
            document.getElementById("horloge").textContent = horloge()
        }

        setInterval(function_horloge, 1000)

        // Script
        if (await boucle()) {
            reset("")
        }
    }
    catch(error) {
        return reset(error)
    }
}

async function boucle() {
    const reponse = await ReturnInput()

    if (reponse === "stop") {
        await WriteTerminal("Rechargement de la page...")
        location.reload()
        return false
    } if (!reponse) {
        await WriteTerminal("Rentrer une valeur non nulle.", "erreur")
    } else {
        const commande = reponse.split(" ")[0].trim().toLowerCase()
        const parametre = reponse.split(" ").slice(1)

        // Distribution des commandes
        if (commande === "run") {
            if (ReturnObject(parametre[0], "chemin")) {
                // Récupération du contenu
                const contenu = ReturnObject(parametre[0], "contenu")

                const contenu_f = await HtmlContenu(contenu)
                const page = document.getElementById("fenetre")

                await run(contenu_f, page)
            } else {
                WriteTerminal("Le chemin n'existe pas.", "erreur")
            }
        } else if (commande === "list") {
            const liste_fichier = JSON.parse(localStorage.getItem("chemins"))

            await enumerate(liste_fichier, "Documents disponibles:")
        } else if (commande == "close") {
            const page = document.getElementById("fenetre")

            fenetre.style.display = "none"
        } else if (commande =="help") {
            const liste_cmds = ["list", "stop", "run"]

            await enumerate(liste_cmds, "Commandes disponibles:")
        } else {
            WriteTerminal("Commande non valide.", "erreur")
        }
    }

    boucle()
}
