/* === Initialisation === */
const id = localStorage.getItem("id_connecte");
const tags = JSON.parse(localStorage.getItem("tag_connecte")) || [];

if (!id) {
    window.location.href = "../../index.html";
}

const a_perm_plus = tags.includes("perm+");

/* === Horloge === */
function maj_horloge() {
    document.getElementById("clock").textContent = new Date().toLocaleTimeString();
}
maj_horloge();
setInterval(maj_horloge, 1000);

/* === Chargement du JSON === */
async function charger_index() {
    const response = await fetch("../../explorateur-nexuria/index.json");
    const liste = await response.json();
    return liste;
}

/* === Lecture du YAML dans un .md === */
async function lire_yaml(chemin) {
    const url = `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`;
    const response = await fetch(url);
    const texte = await response.text();

    // Vérifie si le fichier commence par ---
    if (!texte.startsWith("---")) return { titre: chemin, tag: null };

    const fin = texte.indexOf("---", 3);
    if (fin === -1) return { titre: chemin, tag: null };

    const yaml = texte.substring(3, fin).trim();
    const meta = { titre: chemin, tag: null };

    yaml.split("\n").forEach(ligne => {
        const [cle, ...valeur] = ligne.split(":");
        const val = valeur.join(":").trim().replace(/^"|"$/g, "");
        if (cle.trim() === "titre") meta.titre = val;
        if (cle.trim() === "tag") meta.tag = val || null;
    });

    return meta;
}

/* === Vérification de l'accès === */
function peut_voir(tag_fichier) {
    if (a_perm_plus) return true;           // perm+ voit tout
    if (!tag_fichier) return true;          // pas de tag = visible par tous
    return tags.includes(tag_fichier);      // sinon vérifie le tag
}

/* === Construction de l'arbre === */
function construire_arbre(liste) {
    const arbre = {};

    liste.forEach(chemin => {
        const parties = chemin.split("/");
        let noeud = arbre;

        parties.forEach((partie, index) => {
            if (index === parties.length - 1) {
                if (!noeud["__fichiers__"]) noeud["__fichiers__"] = [];
                noeud["__fichiers__"].push({ nom: partie, chemin: chemin });
            } else {
                if (!noeud[partie]) noeud[partie] = {};
                noeud = noeud[partie];
            }
        });
    });

    return arbre;
}

/* === Vérifie si un dossier a au moins un fichier accessible === */
async function dossier_accessible(noeud) {
    // Vérifie les fichiers directs
    if (noeud["__fichiers__"]) {
        for (const fichier of noeud["__fichiers__"]) {
            const meta = await lire_yaml(fichier.chemin);
            if (peut_voir(meta.tag)) return true;
        }
    }

    // Vérifie récursivement les sous-dossiers
    for (const cle of Object.keys(noeud)) {
        if (cle === "__fichiers__") continue;
        if (await dossier_accessible(noeud[cle])) return true;
    }

    return false;
}

/* === Affichage de l'explorateur === */
async function afficher_dossier(noeud, base) {
    base.innerHTML = "";
    let nb_elements = 0;

    // Dossiers
    for (const cle of Object.keys(noeud)) {
        if (cle === "__fichiers__") continue;

        const accessible = await dossier_accessible(noeud[cle]);
        if (!accessible) continue;

        nb_elements++;
        const div = document.createElement("div");
        div.className = "dossier";
        div.textContent = `📁 ${cle}`;
        div.addEventListener("click", function() {
            afficher_dossier(noeud[cle], base);
        });
        base.appendChild(div);
    }

    // Fichiers
    if (noeud["__fichiers__"]) {
        for (const fichier of noeud["__fichiers__"]) {
            const meta = await lire_yaml(fichier.chemin);
            if (!peut_voir(meta.tag)) continue;

            nb_elements++;
            const div = document.createElement("div");
            div.className = "fichier";
            div.textContent = `📄 ${meta.titre}`;
            div.addEventListener("click", function() {
                afficher_fichier(fichier.chemin);
            });
            base.appendChild(div);
        }
    }

    document.getElementById("element").textContent = `${nb_elements} élément(s)`;
}

/* === Affichage d'un fichier .md === */
async function afficher_fichier(chemin) {
    const url = `https://raw.githubusercontent.com/kishinight-production/explorateur-nexuria/main/${chemin}`;
    const response = await fetch(url);
    const texte = await response.text();

    // Supprime le YAML avant d'afficher
    let contenu = texte;
    if (texte.startsWith("---")) {
        const fin = texte.indexOf("---", 3);
        if (fin !== -1) contenu = texte.substring(fin + 3).trim();
    }

    const panneau = document.getElementById("panneau");
    panneau.innerHTML = md_vers_html(contenu);
    panneau.style.display = "block";
}

/* === Convertisseur Markdown → HTML === */
function md_vers_html(texte) {
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
        .replace(/\n/g, "<br>");
}

/* === Lancement === */
async function lancer() {
    const base = document.getElementById("base");
    const liste = await charger_index();
    const arbre = construire_arbre(liste);
    await afficher_dossier(arbre, base);
}

lancer();