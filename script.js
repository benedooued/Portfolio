const header =  document.querySelector("header");
window.addEventListener("scrool",function() {
    header.classList.toggle("sticky",window.scrollY > 0);
});

let menu = document.querySelector('#menu-icon');
let navlist = document.querySelector('.navlist');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('active');

};

window.onscroll = () => {
    menu.classList.remove('bx-x');
    navlist.classList.remove('active');
};

const projectCount = document.querySelectorAll('.portefolio .portfolio-content .col').length;
const projectStat = document.querySelector('.cta-box .wrap.one h3');

if (projectStat) {
    projectStat.textContent = projectCount + '+';
}