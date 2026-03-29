document.addEventListener("DOMContentLoaded", function () {

    // ================= HEADER =================
    const header = document.querySelector("header");
    const menu = document.querySelector('#menu-icon');
    const navlist = document.querySelector('.navlist');

    // Sticky header
    window.addEventListener("scroll", function () {
        if (header) {
            header.classList.toggle("sticky", window.scrollY > 50);
        }
    });

    // Menu burger
    if (menu && navlist) {
        menu.onclick = () => {
            menu.classList.toggle('bx-x');
            navlist.classList.toggle('active');
        };
    }

    // Fermer menu au scroll
    window.addEventListener("scroll", () => {
        if (menu && navlist) {
            menu.classList.remove('bx-x');
            navlist.classList.remove('active');
        }
    });

    // ================= PROJECT COUNTER =================
    const projectCount = document.querySelectorAll('.portefolio .portfolio-content .col').length;
    const projectStat = document.querySelector('.cta-box .wrap.one h3');

    if (projectStat) {
        projectStat.textContent = projectCount + '+';
    }

    // ================= EMAILJS =================
    emailjs.init("sbrI2t9rhkLqdkV2Z");

    const form = document.getElementById('contact-form');

    if (!form) {
        console.log("❌ Form not found");
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 🔴 BLOQUE le GET (ton problème principal)

        console.log("📩 Sending email...");

        emailjs.sendForm('service_com2d7m', 'template_8c2rhh3', this)
            .then(function(response) {
                console.log('✅ SUCCESS!', response);

                alert('Message sent successfully!');
                form.reset(); // 🔄 reset form après envoi

            }, function(error) {
                console.log('❌ FAILED...', error);

                alert('Failed to send message: ' + JSON.stringify(error));
            });
    });

});