document.addEventListener("DOMContentLoaded", function () {

    /*------------------- Fonction principale -------------------*/

    async function main() {

        // Récupération de l'URL
        const url = new URL(window.location.href);
        // On implémente le numéro de commande dans orderId
        document.getElementById("orderId").innerText = url.searchParams.get("id");
        // Puis on supprime la ou les key du localStorage pour le réinitialiser
        localStorage.clear();
    }

    main();
});