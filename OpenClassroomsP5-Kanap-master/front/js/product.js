document.addEventListener("DOMContentLoaded", function () {

    /*------------------- Fonction principale -------------------*/

    async function main() {

        // On récupère l'URL
        const url = new URL(window.location.href);
        // productId = à ID récupéré en paramètre de notre URL
        let productId = url.searchParams.get("id");

        // On appelle notre fonction qui va nous retourner notre produit de l'API
        let product = await GetId(productId);

        displayProduct(product);

        BtnClick(product)
    }

    main();


    /*------------------- Fonction d'interrogation de notre API avec productId -------------------*/

    async function GetId(productId) {
        return fetch("http://localhost:3000/api/products/" + productId)
            .then(function (response) {
                return response.json();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /*----------- Fonction d'affichage du produit et ses détails -----------*/

    function displayProduct(product) {
        console.log(product)
        // Récupération des parents
        const title = document.getElementsByTagName("title")[0];
        const parentImg = document.getElementsByClassName("item__img")[0];
        const parentName = document.getElementById("title");
        const parentPrice = document.getElementById("price");
        const parentDescription = document.getElementById("description");

        // Création de notre balise image avec les attributs
        const productImg = document.createElement("img");
        productImg.setAttribute("src", product.imageUrl);
        productImg.setAttribute("alt", product.altTxt);
        parentImg.appendChild(productImg)

        // On change les différentes valeurs à la volée
        title.innerHTML = product.name;
        parentName.innerText = product.name;
        parentPrice.innerText = product.price;
        parentDescription.innerText = product.description;

        // Création des choix de couleurs
        const colorSelector = document.getElementById("colors");
        let options = product.colors;

        options.forEach(function (element) {

            colorSelector.appendChild(new Option(element, element));
        });
    }

    /*------------------- Initialisation de la classe produit -------------------*/

    class ProductClass {
        constructor(id, name, color, qty) {
            this.id = id;
            this.name = name;
            this.color = color;
            this.qty = qty;
        }
    }

    /*------------------- Fonction d'ajout au panier et save localStorage -------------------*/

    function BtnClick(product) {

        // Initialisation des variables
        let colorChoosen = "";
        let qtyChoosen = "";
        let qty = "";
        let BtnPanier = document.getElementById("addToCart");

        // Sélection des couleurs avec son comportement au change
        let colorSelection = document.getElementById("colors");
        colorSelection.addEventListener("change", function (data) {
            colorChoosen = data.target.value;
        })

        // Sélection de la quantité avec son comportement au change
        let qtySelection = document.getElementById("quantity");
        qtySelection.addEventListener("change", function (data) {
            qty = data.target.value;
        });

        BtnPanier.addEventListener("click", function () {


            // Initialisation des variables
            let ProductLocalStorage = [];
            let oldQty = 0;

            // Boucle for à la longueur du localStorage avec récuperation des informations du localStorage
            for (let i = 0; i < localStorage.length; i++) {
                ProductLocalStorage[i] = JSON.parse(localStorage.getItem(localStorage.key(i)));

                if (product._id === ProductLocalStorage[i].id && ProductLocalStorage[i].color === colorChoosen) {
                    oldQty = ProductLocalStorage[i].qty;
                }
            }

            // On calcule notre nouvelle quantité en prenant en compte l'ancienne valeur
            qtyChoosen = parseInt(oldQty) + parseInt(qty);

            /* On définit le produit choisi en créant une nouvelle instance de ProductClass 
            et on injecte les nouvelles valeurs dans notre classe */
            let productChoosen = new ProductClass(
                product._id,
                product.name,
                colorChoosen,
                qtyChoosen,
            );

            // Envoi de notre produit au localStorage
            if (colorChoosen != "" && qtyChoosen >= 1 && qtyChoosen <= 100) {
                localStorage.setItem(
                    product.name + " " + colorChoosen,
                    JSON.stringify(productChoosen)
                )
                alert("Votre Article " + product.name + " de la couleur: " + colorChoosen + " a été ajouté au panier.")
            } else {
                alert("Veuillez renseigner une couleur et une quantité entre 1 et 100.");
            }
        })
    }
});