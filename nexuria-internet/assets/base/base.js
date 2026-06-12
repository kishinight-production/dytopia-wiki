/* === Horloge === */
function horloge() {
    const date = new Date().toLocaleTimeString()

    document.getElementById("clock").innerHTML = date
}

/* === Fonction === */
/* Autres */
function identifiant(id) {
    const div = document.getElementById("id")

    div.innerHTML = `Bonjour "<u>${id}</u>"`
    div.style.border = "0.05rem solid white"
}

function element(n) {
    const div = document.getElementById("element")
    if (n === "") {
        div.textContent = `0 element`
        return
    }
    div.textContent = `${n} element(s)`
    return
}

/* Document */
function convertion_MD_in_HTML(texte) {
    return texte
        // Titres
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")

        // Gras et italique
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")

        // Barré
        .replace(/~~(.+?)~~/g, "<s>$1</s>")

        // Code inline
        .replace(/`(.+?)`/g, "<code>$1</code>")

        // Bloc de code
        .replace(/```[\w]*\n([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")

        // Images ![alt](url)
        .replace(/!\[(.+?)\]\((.+?)\)/g, "<img src='$2' alt='$1'>")

        // Liens [texte](url)
        .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2'>$1</a>")

        // Liste non ordonnée
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")

        // Liste ordonnée
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

        // Séparateur
        .replace(/^---$/gm, "<hr>")

        // Blockquote
        .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

        // Retour à la ligne
        .replace(/\n/g, "<br>")
}

function afficher_texte(texte) {
    const explorateur = document.getElementById("base")
    const afficheur = document.getElementById("page-document")

    explorateur.style.display = "none"
    afficheur.innerHTML = texte
    afficheur.style.display = "block"
}

function cacher_texte(texte) {
    const explorateur = document.getElementById("base")
    const afficheur = document.getElementById("page-document")

    afficheur.style.display = "none"
    explorateur.style.display = "block"
}

async function charger_fichier(chemin) {
    const url = `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`
    const reponse = await fetch(url)
    const texte = await reponse.text()

    /* === Lecture du YAML === */
    let meta = { titre: chemin, tag: null }
    let contenu = texte

    if (texte.startsWith("---")) {
        const fin = texte.indexOf("---", 3)
        if (fin !== -1) {
            const yaml = texte.substring(3, fin).trim()
            yaml.split("\n").forEach(ligne => {
                const [cle, ...valeur] = ligne.split(":")
                const val = valeur.join(":").trim().replace(/^"|"$/g, "")
                if (cle.trim() === "titre") meta.titre = val
                if (cle.trim() === "tag") meta.tag = val || null
            })
            contenu = texte.substring(fin + 3).trim()
        }
    }

    /* === Vérification accès === */
    const tags = JSON.parse(localStorage.getItem("tag_connecte")) || []
    const a_perm_plus = tags.includes("perm+")

    const peut_voir = a_perm_plus || !meta.tag || tags.includes(meta.tag)

    if (!peut_voir) {
        afficher_texte("<p class='erreur'>Accès refusé.</p>")
        return
    }

    /* === Affichage === */
    afficher_texte(convertion_MD_in_HTML(contenu))
}

function click_attente_retour() {
    return new Promise(function(resolve) {
        const retour = document.getElementById("retour")
        retour.addEventListener("click", function() {
            resolve()
        })
    })
}

/* Explorateur de fichier */
function click_attente() {
    return new Promise(function(resolve) {
        // Sélectionne tous les fichiers et dossiers
        const fichiers = document.querySelectorAll(".fichier")
        const dossiers = document.querySelectorAll(".dossier")

        fichiers.forEach(fichier => {
            fichier.addEventListener("click", function() {
                resolve({ type: "fichier", nom: fichier.dataset.nom })
            })
        })

        dossiers.forEach(dossier => {
            dossier.addEventListener("click", function() {
                resolve({ type: "dossier", nom: dossier.dataset.nom })
            })
        })
    })
}

function construire_arbre(liste, emplacement) {
    const fichier_renvoyer = []
    const dossier_renvoyer = []

    if (emplacement === "") {
        liste.forEach(doc => {
            if (!doc.includes("/")) {
                fichier_renvoyer.push(doc)
            }
            else {
                const nom_dossier = doc.split("/")[0]
                if (!dossier_renvoyer.includes(nom_dossier)) {
                    dossier_renvoyer.push(nom_dossier)
                }
            }
        })
    }
    else {
        liste.forEach(doc => {
            if (doc.startsWith(emplacement + "/")) {
                const suite = doc.replace(emplacement + "/", "")

                if (!suite.includes("/")) {
                    fichier_renvoyer.push(suite)
                }
                else {
                    const nom_dossier = suite.split("/")[0]
                    if (!dossier_renvoyer.includes(nom_dossier)) {
                        dossier_renvoyer.push(nom_dossier)
                    }
                }
            }
        })
    }

    return { fichiers: fichier_renvoyer, dossiers: dossier_renvoyer }
}

function create_document(fichier, dossier) {
    const emplacement = document.getElementById("base")

    if (fichier !== "") {
        const p = document.createElement("p")
        p.textContent = `📄 ${fichier}`
        p.className = "fichier"
        p.dataset.nom = fichier
        emplacement.appendChild(p)
    }

    if (dossier !== "") {
        const p = document.createElement("p")
        p.textContent = `📁 ${dossier}`
        p.className = "dossier"
        p.dataset.nom = dossier
        emplacement.appendChild(p)
    }
}

function cacher_document(element) {
    if (element) {
        element.remove()
    }
}

async function charger_index() {
    const reponse = await fetch("https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/index.json")
    const index = reponse.json()
    return index
}

function click_attente() {
    return new Promise(function(resolve) {
        const fichier = document.getElementById("fichier")
        const dossier = document.getElementById("dossier")
        fichier.addEventListener("click", function() {
            resolve(fichier)
        })
        dossier.addEventListener("click", function() {
            resolve(dossier)
        })
    })
}

/* === Lancement === */
async function lancer(dossier_emplacement) {
    /* === Initialisation === */
    const user = localStorage.getItem("id_connecte")
    identifiant(user)
    element("")

    /* === Chargement === */
    const index = await charger_index()
    const tag = JSON.parse(localStorage.getItem("tag_connecte")) || []

    /* === Contenu === */
    const contenu = construire_arbre(index, dossier_emplacement)
    const fichiers = contenu.fichiers
    const dossiers = contenu.dossiers

    /* === Affichage === */
    document.getElementById("base").innerHTML = ""
    dossiers.forEach(dossier => create_document("", dossier))
    fichiers.forEach(fichier => create_document(fichier, ""))
    element(dossiers.length + fichiers.length)

    /* === Attente du clic === */
    const choix = await click_attente()

    /* === Traitement du clic === */
    if (choix.type === "dossier") {
        const nouvel_emplacement = dossier_emplacement === "" ? choix.nom : dossier_emplacement + "/" + choix.nom
        lancer(nouvel_emplacement)
    }
    else if (choix.type === "fichier") {
        const chemin = dossier_emplacement === "" ? choix.nom : dossier_emplacement + "/" + choix.nom
        await charger_fichier(chemin)
        /* Attendre un clic pour revenir à l'explorateur */
        await click_attente_retour()
        cacher_texte()
        lancer(dossier_emplacement)
    }
}

/* === Initialisation === */
setInterval(horloge, 1000)
let dossier = ""
lancer(dossier)
