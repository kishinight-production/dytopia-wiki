// === Fonctions === //
// TEMPS
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function horloge() {
    const date = new Date().toLocaleTimeString();
    return date
}

// INPUT
function ListenInput() {
    function DeleteInput(input, valeur) {
        const block = document.createElement("div")

        if (input.type === "password") {
            let content = ""
            for (const carac of valeur) {
                content += "•"
            }
            block.textContent = content
        }
        else { 
            block.textContent = valeur 
        }

        input.replaceWith(block)
    }

    const input = document.getElementById("input")
    if (!input) return Promise.resolve("")

    // Focus
    input.focus()

    const onBlur = () => {
        setTimeout(() => { if (document.contains(input)) {input.focus()} }, 5)
    }

    input.addEventListener('blur', onBlur)

    return new Promise( function(resolve) {
        input.addEventListener('keydown', function handleKey(event) {
            if (event.key === "Enter") {
                input.removeEventListener('keydown', handleKey)
                const valeur = input.value
                DeleteInput(input, valeur)
                resolve(valeur)
            }
        })
    })
}

function ADDinput(PlaceHolder, TypeInput) {
    const block = document.getElementById("ligne")
    const input = document.createElement("input")
    input.id = "input"
    
    if (TypeInput) {
        input.type = TypeInput
    }

    if (PlaceHolder) {
        input.placeholder = PlaceHolder
    }

    block.appendChild(input)
}

// CHARGEMENT ET LOAD
async function load(chemin) {
    try{
        return await fetch(chemin)
    }
    catch(error) {
        await WriteTerminal("Une erreur est survenue lors du téléchargement.", "erreur")
        await WriteTerminal(error, "erreur")
        return false
    }
}

async function charge(fichier) {
    try{
        return await fichier.json()
    }
    catch(error) {
        await WriteTerminal("Une erreur est survenue lors du chargement.", "erreur")
        await WriteTerminal(error, "erreur")
        return false
    }
}

// TERMINAL
async function WriteTerminal(contenu, classe) {
    const oldblock = document.getElementById("ligne")
    if (oldblock) {
        oldblock.id = "oldligne"
    }

    const terminal = document.getElementById("main")

    // Contenu du block
    const block = document.createElement("div")
    block.id = "ligne"
    const text_block = document.createElement("div")
    text_block.id = "ligne-text"
    // ClassName
    if (classe) {
        text_block.className = classe
    }

    // Intégration
    block.appendChild(text_block)
    terminal.appendChild(block)

    // Écriture progressive
    const texte = String(contenu)
    for (const lettre of texte) {
        text_block.textContent += lettre
        // Temps
        const ms = Math.floor(Math.random() * 20)
        await wait(ms)
    }
}

// Fichier
function extraire_yaml(fichier) {
    const yaml = {}

    const resultat = fichier.match(/^---\n([\s\S]*?)\n---/)
    if (!resultat) {
        return yaml
    }

    const contenu_yaml = resultat[1]
    const lignes = contenu_yaml.split("\n")
    lignes.forEach(ligne => {
        const [cle, valeur] = ligne.split(":")
        if (cle && valeur) {
            yaml[cle.trim()] = valeur.trim()
        }
    })

    return yaml
}