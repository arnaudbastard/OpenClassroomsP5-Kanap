
// On écoute l'événément "DOM soit fini d'être chargé" avant de lancer le script
document.addEventListener("DOMContentLoaded", function () {

    /*------------------- Fonction principale -------------------*/

    async function main() {
        // On appelle notre fonction qui va nous retourner nos produits de l'API
        let products = await GetProducts();
        for (let article of products) {
            // Affichage des articles dans products
            displayProducts(article);
        }
    }

    main();

    /*------------- Fonction d'interrogation de notre API avec product -------------*/

    async function GetProducts() {
        return fetch("http://localhost:3000/api/products")
            .then(function (res) {
                return res.json();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /*------------------- Fonction d'affichage du produit -------------------*/

    function displayProducts(products) {

        // Récupération du parent
        const Dom = document.getElementById("items");

        // On insère dans le HTML
        Dom.insertAdjacentHTML(
            "beforeend",
            `<a href="./product.html?id=${products._id}">
            <article>
                <img src="${products.imageUrl}" alt="${products.altTxt}">
                <h3 class="productName">${products.name}</h3>
                <p class="productDescription">${products.description}</p>
                </article>
        </a>`
        );
    }
});
