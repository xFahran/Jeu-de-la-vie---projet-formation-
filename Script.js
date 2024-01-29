let modeJeu = 'create';
let jeuVie;
let statutBar = document.getElementById("statutBar");
let labelButton = document.getElementById("labelButton");
const enCreation = "Mode création";
const enJeu = "Mode simulation";
const lancerJeu = "Lancer jeu";
const arretJeu = "Arrêter la simulation";
/** @type {Array[][]} */
let mainGrille = createGrille();
/** @type {HTMLCanvasElement} */
let canv = document.getElementById('surface');

setMode('create');
updateCanvas();

function setMode(m) {
    if (m === 'create') {
        modeJeu = 'create';
        statutBar.innerText = enCreation;
        labelButton.innerText = lancerJeu;
    }
    if (m === 'jeu') {
        modeJeu = 'jeu';
        statutBar.innerText = enJeu;
        labelButton.innerText = arretJeu;
    }
}

function createGrille() {
    let result = new Array();
    let ligne;
    for (let l = 0; l < 30; l++) {
        ligne = new Array();
        for (let c = 0; c < 30; c++) {
            ligne.push(false);
        }
        result.push(ligne);
    }
    return result;
}

canv.addEventListener('mouseup', (event) => {
    if (modeJeu === 'create') {
        let caseX = ~~(event.offsetX / 10);
        let caseY = ~~(event.offsetY / 10);
        mainGrille[caseY][caseX] = !mainGrille[caseY][caseX];
        updateCanvas();
    }
})

function updateCanvas() {
    let ctx = canv.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = '#F0F0F0';
    ctx.rect(0, 0, canv.width, canv.height);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = 'black';
    for (let l = 0; l < 30; l++) {
        for (let c = 0; c < 30; c++) {
            if (mainGrille[l][c] === true) {
                ctx.rect(c * 10, l * 10, 10, 10);
                ctx.fill();
            }
        }
    }
    ctx.closePath();
}

function runJeu() {
    if (modeJeu === 'create') {
        setMode('jeu');
        jeuVie = new jeuDeLaVie(200);
        jeuVie.run();
    } else {
        setMode('create');
        jeuVie.stop();
        mainGrille = createGrille(); // Réinitialisation de la grille
        updateCanvas(); // Mise à jour du canvas
    }
}


class jeuDeLaVie {
    constructor(nbCycles) {
        this.nbCycles = nbCycles;
        this.running = false;
    }


    async run() {
        this.running = true;
        let tempGrille = createGrille();
        for (let cycle = 0; cycle < this.nbCycles; cycle++) {
            if (!this.running) break;
    
            for (let l = 0; l < 30; l++) {
                for (let c = 0; c < 30; c++) {
                    let vivants = this.nbVoisinsVivants(c, l);
                    if (mainGrille[l][c]) {
                        tempGrille[l][c] = vivants === 2 || vivants === 3;
                    } else {
                        tempGrille[l][c] = vivants === 3;
                    }
                }
            }
    
            this.transferGrille(tempGrille, mainGrille);
            updateCanvas();
            await this.sleep(200); 
        }
    }
    
    transferGrille(tempGrille, mainGrille) {
        for (let l = 0; l < 30; l++) {
            for (let c = 0; c < 30; c++) {
                mainGrille[l][c] = tempGrille[l][c];
            }
        }
    }
    
    nbVoisinsVivants(x, y) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; 
                let nx = this.modulo(x + dx, 30);
                let ny = this.modulo(y + dy, 30);
                if (mainGrille[ny][nx]) count++;
            }
        }
        return count;
    }
    
    stop() {
        this.running = false;
    }
    

    /**
     * transfert la grille temporaire créée par la méthode
     * run dans la grille de modélisation globale
     */
    transferGrille(tempGrille, mainGrille) {
        for (let l = 0; l < 30; l++) {
            for (let c = 0; c < 30; c++) {
                mainGrille[l][c] = tempGrille[l][c];
            }
        }
    }

    /**
     * calcul n modulo m, avec n entier relatif
     * @param {number} n 
     * @param {number} m 
     * @returns {number}
     */
    modulo(n, m) {
        return ((n % m) + m) % m
    }

    /**
     * Méthode qui retourne le nombre de cellules vivantes
     * voisines de la cellule en position (x,y)
     * Les bords du tableau sont considérés comme adjacents
     * @param {number} x - coordonnée horizontale de la cellule
     * @param {number} y - coordonnée verticale de la cellule
     * @returns {number} - nombre de voisins vivants
     */
    nbVoisinsVivants(x, y) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; 
                let nx = this.modulo(x + dx, 30);
                let ny = this.modulo(y + dy, 30);
                if (mainGrille[ny][nx]) count++;
            }
        }
        return count;
    }

    /**
     * @param {number} ms - 
     * @returns
     */
    sleep(ms) {
        return new Promise((resolve) => { setTimeout(resolve, ms) });
    }

    
    stop() {
        this.running = false;
    }
}


function updateCanvas() {
    let ctx = canv.getContext('2d');
    ctx.clearRect(0, 0, canv.width, canv.height); 

    ctx.beginPath();
    ctx.fillStyle = '#F0F0F0'; 
    ctx.rect(0, 0, canv.width, canv.height);
    ctx.fill();
    ctx.closePath();

    for (let l = 0; l < 30; l++) {
        for (let c = 0; c < 30; c++) {
            if (mainGrille[l][c] === true) {
                ctx.fillStyle = modeJeu === 'jeu' ? getRandomColor() : 'black';
                ctx.beginPath();
                ctx.rect(c * 10, l * 10, 10, 10);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}