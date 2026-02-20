document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const btnToggle = document.getElementById("btnToggle");

    // Abre/fecha sidebar no mobile
    btnToggle.addEventListener("click", (e) => {
        e.stopPropagation(); // evita que clique no botão conte como clique "fora"
        sidebar.classList.toggle("open");
    });

    // Fecha sidebar ao clicar fora (mobile)
    document.addEventListener("click", (e) => {

        const isMobile = window.innerWidth <= 768;
        if (!isMobile) return; // só no mobile

        const clicouFora =
            !sidebar.contains(e.target) &&
            !btnToggle.contains(e.target);

        if (sidebar.classList.contains("open") && clicouFora) {
            sidebar.classList.remove("open");
        }
    });

    // Fecha sidebar ao redimensionar para desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("open");
        }
    });

    // ============================
    // ABRIR / FECHAR SUBMENUS
    // ============================
    const menuButtons = document.querySelectorAll(".menu-btn");

    menuButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation(); // evita fechar a sidebar ao abrir submenu

            const submenu = button.nextElementSibling;

            // Fechar se estiver aberto, senão abrir
            if (submenu.style.maxHeight) {
                submenu.style.maxHeight = null;
            } else {
                submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
        });
    });

});
