const header = document.querySelector("header");
const menu = document.querySelector('#menu-icon');
const navlist = document.querySelector('.navlist');

// Header sticky au scroll (typo "scrool" corrigée)
window.addEventListener("scroll", function () {
    header.classList.toggle("sticky", window.scrollY > 50);
});

// Menu burger
menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('active');
};

// Fermer le menu au scroll
window.onscroll = () => {
    header.classList.toggle("sticky", window.scrollY > 50);
    menu.classList.remove('bx-x');
    navlist.classList.remove('active');
};

// Compteur dynamique de projets
const projectCount = document.querySelectorAll('.portefolio .portfolio-content .col').length;
const projectStat = document.querySelector('.cta-box .wrap.one h3');
if (projectStat) {
    projectStat.textContent = projectCount + '+';
}

// Téléchargement CV
const cvBtn = document.querySelector('.cv-btn');
if (cvBtn) {
    cvBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = 'cv.pdf';           // ← mets ton vrai chemin ici
        link.download = 'CV_Benedoued.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}