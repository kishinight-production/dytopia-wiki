/* === Logs === */
const logs = [];

function log(message) {
    const ligne = `[${new Date().toLocaleTimeString()}] - ${message}`;
    console.log(ligne);
    logs.push(ligne);
}

/* === Fonctions === */
function ecouter_input() {
    const input = document.getElementById("input");
    input.focus();

    input.addEventListener('blur', function() {
        setTimeout(() => input.focus(), 10);
    });

    return new Promise(function(resolve) {
        input.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                log("[Action] Entrée d'une valeur dans le terminal.");
                resolve(input.value);
            }
        });
    });
}

function commande_liste(texte, liste) {
    return new Promise(function(resolve) {
        log(`[Terminal] Recherche de la commande "${texte}".`);
        const trouve = liste.find(element => texte === element);
        resolve(trouve || false);
    });
}

function terminal_ecrire(terminal, texte, classe = "") {
    const p = document.createElement("p");
    if (classe) p.className = classe;
    p.textContent = texte;
    terminal.appendChild(p);
}

function terminal_modif(terminal) {
    const input = document.getElementById("input");
    const texte = input.value;

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "0.5rem";

    const prefix = document.createElement("p");
    prefix.textContent = `[${new Date().toLocaleTimeString()}] - N:/internet>`;

    const commande = document.createElement("p");
    commande.textContent = texte;

    div.appendChild(prefix);
    div.appendChild(commande);

    input.parentElement.replaceWith(div);
}

function ajouter_input(terminal) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "0.5rem";

    const prefix = document.createElement("p");
    prefix.textContent = "N:/internet>";

    const input = document.createElement("input");
    input.id = "input";

    div.appendChild(prefix);
    div.appendChild(input);
    terminal.appendChild(div);
}

/* === Connexion === */
async function charger_utilisateurs() {
    const response = await fetch("assets/connexion.json");
    const liste = await response.json();
    return liste;
}

/* === Commandes === */
async function nexuria_connect(terminal) {
    const utilisateurs = await charger_utilisateurs();

    terminal_ecrire(terminal, "Votre identifiant ?");
    ajouter_input(terminal);
    const valeur_id = await ecouter_input();

    terminal_modif(terminal);
    terminal_ecrire(terminal, "Vérification de l'identifiant...");

    const utilisateur = utilisateurs.find(u => u.id === valeur_id);

    if (utilisateur) {
        log("[Nexuria] Identifiant trouvé !");
        terminal_ecrire(terminal, "Identifiant trouvé !", "correct");

        terminal_ecrire(terminal, "Votre code ?");
        ajouter_input(terminal);
        const valeur_passe = await ecouter_input();

        terminal_modif(terminal);
        terminal_ecrire(terminal, "Vérification du mot de passe...");

        if (valeur_passe === utilisateur.code) {
            log("[Nexuria] Code correct !");
            terminal_ecrire(terminal, "Code correct !", "correct");
            terminal_ecrire(terminal, "Recherche de l'adresse IP...");
            terminal_ecrire(terminal, "IP: 153.642.67.2");
            terminal_ecrire(terminal, "Connexion établie.", "correct");

            localStorage.setItem("id_connecte", utilisateur.id);
            localStorage.setItem("tag_connecte", utilisateur.tag);

            window.location = "base.html";
        } else {
            log("[Nexuria] Mauvais mot de passe.");
            terminal_ecrire(terminal, "Erreur: Mauvais mot de passe.", "erreur");
        }

    } else {
        log(`[Nexuria] Aucun identifiant sous le nom de "${valeur_id}".`);
        terminal_ecrire(terminal, `Erreur: Aucun identifiant sous le nom de "${valeur_id}".`, "erreur");
    }
}

/* === Lancement === */
async function lancer(terminal) {
    const commandes = [
        "connect -base nexuria",
        "reset -terminal",
        "logs -terminal",
        "help",
        "sup! -terminal",
        "version -terminal"
    ];

    ajouter_input(terminal);
    const valeur_terminal = await ecouter_input();
    const result = await commande_liste(valeur_terminal, commandes);

    terminal_modif(terminal);

    if (result) {
        log(`[Terminal] Commande utilisée: "${result}".`);

        if (result === "reset -terminal") {
            terminal.innerHTML = "";
            log("[Terminal] Terminal réinitialisé.");

        } else if (result === "logs -terminal") {
            terminal_ecrire(terminal, "=== Logs du terminal ===");
            logs.forEach(ligne => terminal_ecrire(terminal, ligne));

        } else if (result === "help") {
            terminal_ecrire(terminal, "Liste des commandes:");
            commandes.forEach(element => terminal_ecrire(terminal, element));

        } else if (result === "connect -base nexuria") {
            log("[Terminal] Tentative de connexion...");
            await nexuria_connect(terminal);

        } else if (result === "sup! -terminal") {
            terminal_ecrire(terminal, `Nous vous déconseillons d'essayer, faites "annuler" pour éviter la destruction de votre PC.`);
            terminal_ecrire(terminal, "Code d'autodestruction :");
            ajouter_input(terminal);
            const code = await ecouter_input();

            terminal_modif(terminal);

            if (code === "nex@r@/N-e-x-u-sDIEU30100001.") {
                terminal_ecrire(terminal, "Code correct !", "correct");
                terminal_ecrire(terminal, "Connexion inconnue au terminal.", "correct");
                terminal_ecrire(terminal, "Insertion d'un virus destructeur.", "correct");
                terminal_ecrire(terminal, "Ralentissement du débit de connexion.", "correct");
                terminal_ecrire(terminal, "Destruction du terminal.", "correct");
                terminal_ecrire(terminal, "Envoie de ping multiple.", "correct");
                crash(terminal)

            } else if (code === "annuler") {
                terminal_ecrire(terminal, "Commande annuler...", "erreur");

            } else {
                log("[Terminal] Mauvais code.");
                terminal_ecrire(terminal, "Erreur: Mauvais code.", "erreur");
            }

        } else if (result === "version -terminal") {
            terminal_ecrire(terminal, "Terminal version: 0.0.0.0");
        }

    } else {
        log(`[Terminal] "${valeur_terminal}" introuvable.`);
        terminal_ecrire(terminal, "Erreur: Commande inconnue.", "erreur");
    }

    lancer(terminal);
}

function crash(terminal) {
    terminal_ecrire(terminal, "Erreur..", "erreur");
    terminal_ecrire(terminal, "Erreur...", "erreur");
    terminal_ecrire(terminal, "Erreur....", "erreur");
    terminal_ecrire(terminal, "Erreur.....", "erreur");
    terminal_ecrire(terminal, "?rreur.....", "erreur");
    terminal_ecrire(terminal, "?@reur.....", "erreur");
    terminal_ecrire(terminal, "?@/eur.....", "erreur");
    terminal_ecrire(terminal, "?@/(ur.....", "erreur");
    terminal_ecrire(terminal, "?@/(=r.....", "erreur");
    terminal_ecrire(terminal, "?@/(=-.....", "erreur");
    terminal_ecrire(terminal, "?@/(=-!....", "erreur");
    terminal_ecrire(terminal, "?@/(=-!é...", "erreur");
    terminal_ecrire(terminal, "?@/(=-!é*..", "erreur");
    terminal_ecrire(terminal, "?@/(=-!é*&.", "erreur");
    terminal_ecrire(terminal, "?@/(=-!é*&`", "erreur");
    log("[???] ?@/(=-!é*&`");
    crash(terminal)
}
/* === Initialisation === */
const terminal = document.getElementById("terminal");
log("[Terminal] Terminal correctement configuré.");
lancer(terminal);