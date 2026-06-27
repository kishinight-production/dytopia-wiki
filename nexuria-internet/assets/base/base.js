/* === Autres Fonctions === */

/* Horloge */
function horloge() {
    const date = new Date().toLocaleTimeString();
    document.getElementById("clock").innerHTML = date;
}

/* Identifiant connexion */
function identifiant(id) {
    const div = document.getElementById("id");

    div.innerHTML = `Bonjour "${id}"`;
    div.style.border = "0.01rem solid white";
}

/* Éléments chargés */
function element(n) {
    const div = document.getElementById("element");

    if (!n) {
        div.textContent = "0 element";
        return;
    }

    div.textContent = `${n} element(s)`;
}

/* === Fonctions de l'explorateur === */

/* Utilitaires */
function convertion_MD_in_HTML(texte) {
    return texte
        .replace(/^---\n([\s\S]*?)\n---/, "")

        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")

        .replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")

        .replace(/~~(.+?)~~/g, "<s>$1</s>")
        .replace(/`(.+?)`/g, "<code>$1</code>")
        .replace(/```[\w]*\n([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")

        .replace(/!\[(.+?)\]\((.+?)\)/g, "<img src='$2' alt='$1'>")
        .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2'>$1</a>")

        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")

        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

        .replace(/^---$/gm, "<hr>")
        .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

        .replace(/\n/g, "<br>");
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

function verifier_fichier(contenu_fichier) {
    const tags_brut = localStorage.getItem("tag_connecte");

    let tags_acces = [];

    try {
        tags_acces = tags_brut
            ? JSON.parse(tags_brut)
            : [];
    }
    catch {
        tags_acces = [];
    }

    const yaml = extraire_yaml(contenu_fichier);

    if (!yaml.tags) {
        return true;
    }

    return tags_acces.includes(yaml.tags);
}

/* Document */

function cacher_document() {
    const explorateur = document.getElementById("base");
    const afficheur = document.getElementById("page-document");

    afficheur.style.display = "none";
    explorateur.style.display = "block";
}

function afficher_document(texte) {
    const explorateur = document.getElementById("base");
    const afficheur = document.getElementById("page-document");

    const yaml = extraire_yaml(texte)

    const texte_f = convertion_MD_in_HTML(texte)

    const titre = yaml.title || "Sans titre";
    const tag = yaml.tags || "Public";

    explorateur.style.display = "none";
    afficheur.innerHTML = `
        <h1>${titre}</h1>
        <p><strong>Accès :</strong> ${tag}</p>
        <hr>
        ${texte_f}
    `;
    afficheur.style.display = "block";
}

/* Fichiers */

function create_fichier(fichier, dossier, chemin = "", date = "") {
    const emplacement = document.getElementById("base");

    if (fichier !== "") {
        const div = document.createElement("div");

        div.innerHTML = `
            <p>📄 ${fichier}</p>
            <p>${date}</p>
        `;

        div.className = "fichier";
        div.dataset.nom = fichier;
        div.dataset.chemin = chemin;

        emplacement.appendChild(div);
    }

    if (dossier !== "") {
        const div = document.createElement("div");

        div.innerHTML = `📁 ${dossier}`;

        div.className = "dossier";
        div.dataset.nom = dossier;

        emplacement.appendChild(div);
    }
}

function cacher_fichier(element) {
    if (element) {
        element.remove();
    }
}

function creer_explorateur(dossier, vue_fichier) {
    const base = document.getElementById("base");

    base.innerHTML = "";

    const dossiers_affiches = [];
    let nbr_element = 0;

    vue_fichier.forEach(fichier => {

        const chemin = fichier.chemin;

        if (!chemin.startsWith(dossier)) {
            return;
        }

        const relatif = chemin.replace(dossier, "");
        const morceaux = relatif.split("/");

        if (morceaux.length > 1) {

            const nom_dossier = morceaux[0];

            if (!dossiers_affiches.includes(nom_dossier)) {

                dossiers_affiches.push(nom_dossier);

                create_fichier("", nom_dossier);

                nbr_element++;
            }

        } else {

            create_fichier(
                morceaux[0],
                "",
                `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`,
                fichier.date
            );

            nbr_element++;
        }
    });

    element(nbr_element);

    document.querySelectorAll(".dossier").forEach(element_html => {

        element_html.onclick = () => {

            creer_explorateur(
                `${dossier}${element_html.dataset.nom}/`,
                vue_fichier
            );

        };

    });

    document.querySelectorAll(".fichier").forEach(element_html => {

        element_html.onclick = () => {

            fetch(element_html.dataset.chemin)
                .then(reponse => reponse.text())
                .then(contenu => {

                    afficher_document(contenu);

                    document.getElementById("retour").onclick = () => {
                        cacher_document();
                        creer_explorateur(dossier, vue_fichier);
                    };

                });

        };

    });
}

/* === Lancement === */

/* Autres */

const id = localStorage.getItem("id_connecte");

if (id === null) {
    window.location = "terminal.html";
}

identifiant(id);

horloge();
setInterval(horloge, 1000);

element(0);

/* Principal */

const acces_document = [];

fetch("https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/index.json")
    .then(reponse => reponse.json())
    .then(async fichiers => {

        for (const chemin of fichiers) {

            const contenu = await fetch(
                `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`
            ).then(r => r.text());

            const yaml = extraire_yaml(contenu);

            if (id === "perm+" || verifier_fichier(contenu)) {

                acces_document.push({
                    chemin,
                    date: yaml.date || "",
                    titre: yaml.title || "",
                    tags: yaml.tags || ""
                });

            }
        }

        creer_explorateur("", acces_document);

    })
    .catch(erreur => {
        console.error("Erreur lors du chargement :", erreur);
    });