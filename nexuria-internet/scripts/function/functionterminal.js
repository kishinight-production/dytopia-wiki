async function ReturnInput() {
    await WriteTerminal("")
    ADDinput()
    const reponse = await ListenInput()

    return reponse
}

function ReturnObject(fichier, nom) {
    const liste_fichier = JSON.parse(localStorage.getItem("chemins"))

    for (const elmt of liste_fichier) {
        if (elmt.chemin === fichier) {
            return elmt[nom]
        }
    }

    return false;
}

async function HtmlContenu(contenu) {
    // Bloc YAML (Supprimer)
    contenu = contenu.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")

    // Titres (En <hX>)
    contenu = contenu.replace(
        /^###### (.+)$/gm, "<h6>$1</h6>"
    )
    contenu = contenu.replace(
        /^##### (.+)$/gm, "<h5>$1</h5>"
    )
    contenu = contenu.replace(
        /^#### (.+)$/gm, "<h4>$1</h4>"
    )
    contenu = contenu.replace(
        /^### (.+)$/gm, "<h3>$1</h3>"
    )
    contenu = contenu.replace(
        /^## (.+)$/gm, "<h2>$1</h2>"
    )
    contenu = contenu.replace(
        /^# (.+)$/gm, "<h1>$1</h1>"
    )

    // Gras (en <b>)
    contenu = contenu.replace(
        /\*\*(.+?)\*\*/g, "<b>$1</b>"
    )

    // Italique (en <i>)
    contenu = contenu.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<i>$1</i>"
    )

    // Listes (en <ul> et <li>)
    contenu = contenu.replace(
        /^(?:- .+(?:\r?\n|$))+/gm,
        bloc => {
            const elements = bloc.trim().split(/\r?\n/);

            return "<ul>" +
                elements.map(element =>
                    "<li>" + element.slice(2) + "</li>"
                ).join("") +
                "</ul>"
        }
    )

    // Saut de ligne (en <br>)
    contenu = contenu.replace(/\r?\n/g, "<br>")

    return contenu
}

async function run(contenu, fenetre) {
    // === Gestion d'une vrai fenetre === \\\
    let deplacement = false
    let decalageX = 0
    let decalageY = 0

    fenetre.addEventListener("mousedown", (event) => {
        deplacement = true
        decalageX = event.clientX - fenetre.offsetLeft
        decalageY = event.clientY - fenetre.offsetTop
    })
    document.addEventListener("mousemove", (event) => {
        if (!deplacement) return

        fenetre.style.left = (event.clientX - decalageX) + "px"
        fenetre.style.top = (event.clientY - decalageY) + "px"
    })
    document.addEventListener("mouseup", () => {
        deplacement = false
    })

    // === Gestion du contenu === \\
    fenetre.style.display = "block"
    const block = document.createElement("div")
    block.innerHTML = contenu

    fenetre.innerHTML = ""
    fenetre.appendChild(block)
}

async function enumerate(objets, str_info) {
    let num = 0

    await WriteTerminal(`${str_info}`)

    for (const objet of objets) {
        num += 1
        await WriteTerminal(`${num} - ${objet}`)
    }
}
