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

                await run(contenu)
            } else {
                WriteTerminal("Le chemin n'existe pas.", "erreur")
            }
        } else if (commande === "list") {
            await list()
        } else {
            WriteTerminal("Commande non valide.", "erreur")
        }
    }

    boucle()
}