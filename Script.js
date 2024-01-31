
// Constantes pour la configuration
const TAILLE_GRILLE = 30;
const DIMENSION_CELLULE = 10;
const COULEUR_CELLULE_CREATION = 'black';

// Variables d'état du jeu
let modeJeu = 'create';
let jeuVie;
let mainGrille = createGrille();

// Éléments du DOM
const statutBar = document.getElementById("statutBar");
const labelButton = document.getElementById("labelButton");
const canv = document.getElementById('surface');
const ctx = canv.getContext('2d');

// Configuration initiale
setMode('create');
updateCanvas();

// Fonctions
function setMode(m) {
    modeJeu = m;
    statutBar.innerText = m === 'create' ? "Mode création" : "Mode simulation";
    labelButton.innerText = m === 'create' ? "Lancer jeu" : "Arrêter la simulation";
}

function createGrille() {
    return Array.from({ length: TAILLE_GRILLE }, () => Array(TAILLE_GRILLE).fill(false));
}

canv.addEventListener('mouseup', (event) => {
    if (modeJeu === 'create') {
        let caseX = Math.floor(event.offsetX / DIMENSION_CELLULE);
        let caseY = Math.floor(event.offsetY / DIMENSION_CELLULE);
        mainGrille[caseY][caseX] = !mainGrille[caseY][caseX];
        updateCanvas();
    }
});

function runJeu() {
    if (modeJeu === 'create') {
        setMode('jeu');
        jeuVie = new JeuDeLaVie(TAILLE_GRILLE, 200); // Supposition de 200 cycles
        requestAnimationFrame(animate);
    } else {
        setMode('create');
        jeuVie.stop();
        mainGrille = createGrille();
        updateCanvas();
    }
}

function animate() {
    jeuVie.run().then(() => {
        if (jeuVie.running) {
            requestAnimationFrame(animate);
        }
    });
}

function updateCanvas() {
    ctx.clearRect(0, 0, canv.width, canv.height);
    mainGrille.forEach((row, l) => {
        row.forEach((cell, c) => {
            if (cell) {
                ctx.fillStyle = modeJeu === 'jeu' ? getRandomColor() : COULEUR_CELLULE_CREATION;
                ctx.fillRect(c * DIMENSION_CELLULE, l * DIMENSION_CELLULE, DIMENSION_CELLULE, DIMENSION_CELLULE);
            }
        });
    });
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

class JeuDeLaVie {
    constructor(taille, nbCycles) {
        this.taille = taille;
        this.nbCycles = nbCycles;
        this.running = false;
    }

    async run() {
        this.running = true;
        let tempGrille = createGrille();
        for (let cycle = 0; cycle < this.nbCycles; cycle++) {
            if (!this.running) break;

            for (let l = 0; l < this.taille; l++) {
                for (let c = 0; c < this.taille; c++) {
                    let vivants = this.nbVoisinsVivants(c, l, mainGrille);
                    let cellule = mainGrille[l][c];
                    tempGrille[l][c] = cellule ? (vivants === 2 || vivants === 3) : (vivants === 3);
                }
            }

            this.transferGrille(tempGrille, mainGrille);
            updateCanvas();
            await this.sleep(200); // Supposition d'un délai de 200 ms
        }
        this.running = false;
    }

    nbVoisinsVivants(x, y, grille) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                let nx = this.modulo(x + dx, this.taille);
                let ny = this.modulo(y + dy, this.taille);
                if (grille[ny][nx]) count++;
            }
        }
        return count;
    }

    transferGrille(tempGrille, grille) {
        for (let l = 0; l < this.taille; l++) {
            for (let c = 0; c < this.taille; c++) {
                grille[l][c] = tempGrille[l][c];
            }
        }
    }

    modulo(n, m) {
        return ((n % m) + m) % m;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        this.running = false;
    }
}
