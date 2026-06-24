/* === Autres Fonctions === */
/* Horloge */
function horloge() {
    const date = new Date().toLocaleTimeString()

    document.getElementById("clock").innerHTML = date
}

/* Identifiant connection */
function identifiant(id) {
    const div = document.getElementById("id")

    div.innerHTML = `Bonjour "${id}"`
    div.style.border = "0.01rem solid white"
}

/* élément chargés */
function element(n) {
    const div = document.getElementById("element")
    if (n === "") {
        div.textContent = `0 element`
        return
    }
    div.textContent = `${n} element(s)`
    return
}

/* === Fonctions de l'explorateur === */
/* Utilitaires */
function convertion_MD_in_HTML(texte) {
    return texte
        // Titres
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")

        // Gras et italique
        .replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")

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

function extraire_yaml(fichier) {
    const yaml = {};
    const resultat = fichier.match(/^---\n([\s\S]*?)\n---/);
    if (!resultat) {
        return yaml;
    }
    const contenu_yaml = resultat[1];
    const lignes = contenu_yaml.split("\n");

    lignes.forEach(ligne => {
        const [cle, valeur] = ligne.split(":");
        if (cle && valeur) {
            yaml[cle.trim()] = valeur.trim();
        }
    });

    return yaml;
}

function verifier_fichier(fichier) {
    const tags_brut = localStorage.getItem("tag_connecte");

    const tags_acces = tags_brut
        ? JSON.parse(tags_brut)
        : [];

    const yaml = extraire_yaml(fichier);

    if (!yaml.tag) {
        return true;
    }

    return tags_acces.includes(yaml.tag);
}

/* document */
function cacher_document(texte) {
    const explorateur = document.getElementById("base")
    const afficheur = document.getElementById("page-document")

    afficheur.style.display = "none"
    explorateur.style.display = "block"
}

function afficher_document(texte) {
    const explorateur = document.getElementById("base")
    const afficheur = document.getElementById("page-document")

    explorateur.style.display = "none"
    afficheur.innerHTML = texte
    afficheur.style.display = "block"
}

/* Fichiers */
function create_fichier(fichier, dossier) {
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

function cacher_fichier(element) {
    if (element) {
        element.remove()
    }
}

function creer_explorateur(dossier, vue_fichier) {
    const base = document.getElementById("base");
    base.innerHTML = "";
    const dossiers_affiches = [];

    vue_fichier.forEach(chemin => {
        const relatif = chemin.replace(dossier, "");
        const morceaux = relatif.split("/");
        const nbr_element = 0;
        if (morceaux.length > 1) {
            const nom_dossier = morceaux[0];
            if (!dossiers_affiches.includes(nom_dossier)) {
                dossiers_affiches.push(nom_dossier);
                create_fichier("", nom_dossier);
                nbr_element += 1
                element(nbr_element)
            }

        }
        else {
            create_fichier(morceaux[0], "");
        }
    });

    document.querySelectorAll(".dossier").forEach(element => {
        element.addEventListener("click", () => {
            creer_explorateur(
                `${dossier}${element.dataset.nom}/`,
                vue_fichier
            );
        });
    });

    document.querySelectorAll(".fichier").forEach(element => {
        element.addEventListener("click", () => {
            fetch(element.dataset.chemin)
                .then(reponse => reponse.text())
                .then(contenu => {
                    afficher_document(
                        convertion_MD_in_HTML(contenu)
                    );
                });
        });
    });
}

/* === Lancement === */

/* Autres */
const id = localStorage.getItem("id_connecte")
if (id === null) {
    window.location = "terminal.html"
}
identifiant(id)

/////////////////////////////

setInterval(horloge, 1000)

/* Principal */
const acces_document = []
fetch("https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/index.json")
    .then(convertir => { return convertir.json() })
    .then(fichiers.forEach(fichier => {
        if (verifier_fichier(fichier) == true) {
            acces_document.push(fichier)
        }
    }))
    .then( () =>
        creer_explorateur("", acces_document)
    )