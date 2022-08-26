// On écoute l'événément "dom soit finis d'être charger" avant de lancer le script.
document.addEventListener("DOMContentLoaded", function () {

    /*------------------- Fonction principale -------------------*/

    async function main() {
        let ApiArray = [];

        let localStorageArray = getLocalStorageProduct();

        for (let i = 0; i < localStorageArray.length; i++) {
            ApiArray.push(await getApiArray(localStorageArray[i].id));
        }

        let AllProducts = fusionArray(localStorageArray, ApiArray);

        displayCart(AllProducts);
        displayPrice(AllProducts);

        Listen(AllProducts);

        orderValidation();
    }

    main();

    /*------------------------ Récupération de l'API -----------------------*/

    async function getApiArray(productId) {

        return fetch("http://localhost:3000/api/products/" + productId)
            .then(function (response) {
                return response.json();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /*------------------------ Récupération du localStorage -----------------------*/

    function getLocalStorageProduct() {

        let ProductLocalStorage = [];
        // Boucle for à la longueur du localStorage avec récuperation des informations du localStorage
        for (let i = 0; i < localStorage.length; i++) {
            ProductLocalStorage[i] = JSON.parse(localStorage.getItem(localStorage.key(i)));
        }
        return ProductLocalStorage;
    }

    /*------------------------ Initialisation de la classe produit -----------------------*/

    class ProductClass {
        constructor(id, name, color, qty, alttxt, description, imageurl, price) {
            this.id = id;
            this.name = name;
            this.color = color;
            this.qty = qty;
            this.alttxt = alttxt;
            this.description = description;
            this.imageurl = imageurl;
            this.price = price;
        }
    }

    /*---- On regroupe le tableau des produits du localStorage avec celui de tous les produits présents dans l'API ----*/

    function fusionArray(localStorageArray, ApiArray) {

        let AllProducts = [];

        for (let i = 0; i < localStorageArray.length; i++) {

            let ObjectProduct = new ProductClass(
                localStorageArray[i].id,
                ApiArray[i].name,
                localStorageArray[i].color,
                localStorageArray[i].qty,
                ApiArray[i].altTxt,
                ApiArray[i].description,
                ApiArray[i].imageUrl,
                ApiArray[i].price,

            );
            AllProducts.push(ObjectProduct);
        }
        return AllProducts;
    }

    /*------------------------ Affichage des produits du panier -----------------------*/

    function displayCart(AllProducts) {
        const Dom = document.getElementById("cart__items");

        for (Product of AllProducts) {
            Dom.insertAdjacentHTML(
                "beforeend",
                `<article class="cart__item" data-id="${Product.id}" data-color="${Product.color}">
                    <div class="cart__item__img">
                        <img src="${Product.imageurl}" alt="${Product.alttxt}">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${Product.name}</h2>
                            <p>${Product.color}</p>
                            <p>${Product.price}€</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté :</p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${Product.qty}">
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>`
            );
        }
    }

    function displayPrice(AllProducts) {
        const DtotalQty = document.getElementById("totalQuantity");
        const DtotalPrice = document.getElementById("totalPrice");

        let TotalQty = 0;
        let TotalPrice = 0;

        for (Product of AllProducts) {
            TotalQty += parseInt(Product.qty);
            TotalPrice += parseInt(Product.price * Product.qty);
        }

        DtotalQty.innerText = TotalQty;
        DtotalPrice.innerText = TotalPrice;
    }

    /*------------------- Fonction principale d'écoute -------------------*/

    function Listen(AllProducts) {
        // Fonction d'écoute en cas de changement dans notre input quantity
        listenQuantity(AllProducts);
        // Fonction d'écoute en cas de suppression d'un des produits de la liste
        listenDeleteProduct(AllProducts);
    }

    /*------------------- Fonction d'écoute de quantité -------------------*/

    function listenQuantity(AllProducts) {

        let allQtyInput = document.querySelectorAll(".itemQuantity");


        // On boucle chaque input 1 à 1
        allQtyInput.forEach(function (input) {
            // À chaque input, on écoute si il y a un changement, on stocke dans inputevent
            input.addEventListener("change", function (inputevent) {

                let newInputQty = inputevent.target.value;

                // On remonte depuis l'élément input modifié vers le parent et on redscend au h2
                const Name = input
                    .closest("div.cart__item__content")
                    .querySelector("div.cart__item__content__description > h2").innerText;

                const color = input
                    .closest("div.cart__item__content")
                    .querySelector("div.cart__item__content__description > p").innerText;

                const productKey = Name + " " + color;

                if (newInputQty >= 1 && newInputQty <= 100) {

                    let productlocal = JSON.parse(localStorage.getItem(productKey));
                    productlocal.qty = newInputQty;

                    localStorage.setItem(productKey, JSON.stringify(productlocal));

                    const result = AllProducts.find(Product => Product.name === productlocal.name && Product.color === productlocal.color);

                    result.qty = newInputQty;

                    displayPrice(AllProducts);

                } else if (newInputQty <= 1) {

                    let productlocal = JSON.parse(localStorage.getItem(productKey));

                    localStorage.removeItem(productKey);

                    input.closest("article.cart__item").remove();

                    const result = AllProducts.find(Product => Product.name === productlocal.name && Product.color === productlocal.color);

                    AllProducts = AllProducts.filter(Product => Product !== result);

                    listenQuantity(AllProducts);
                    displayPrice(AllProducts);

                }
            })
        })
    }

    /*------------------- Fonction d'écoute de produit supprmimé -------------------*/

    function listenDeleteProduct(AllProducts) {

        let allDeletedItem = document.querySelectorAll(".deleteItem");

        // On boucle chaque bouton "supprimer" cliqué
        allDeletedItem.forEach(function (button) {
            // À chaque bouton "supprimer", on écoute si il y a eu un clic dessus, on stocke dans inputevent
            button.addEventListener("click", function () {

                // On remonte depuis l'élément button qui a été cliqué, vers le parent et on redscend au h2
                const Name = button
                    .closest("div.cart__item__content")
                    .querySelector("div.cart__item__content__description > h2").innerText;

                const color = button
                    .closest("div.cart__item__content")
                    .querySelector("div.cart__item__content__description > p").innerText;

                const productKey = Name + " " + color;

                let productlocal = JSON.parse(localStorage.getItem(productKey));

                localStorage.removeItem(productKey);

                button.closest("article.cart__item").remove();

                const result = AllProducts.find(Product => Product.name === productlocal.name && Product.color === productlocal.color);

                AllProducts = AllProducts.filter(Product => Product !== result);

                listenQuantity(AllProducts);
                displayPrice(AllProducts);
            })
        })
    }

    /*--------------------- Validation du formulaire ---------------------*/

    function validationForm(form) {
        // Initialisation de nos variables de test utilisant les expressions régulières
        const stringRegex = /^[a-zA-Z-\s']+$/;
        const emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+).(.\w{2,3})+$/;
        const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
        let control = true;

        // Si une des valeurs des champs du formulaire est non conforme, on affiche un message d'erreur
        if (!form.firstName.value.match(stringRegex)) {
            document.getElementById("firstNameErrorMsg").innerText = "Mauvais prénom";
            control = false;
            // Sinon on n'affiche pas de message
        } else {
            document.getElementById("firstNameErrorMsg").innerText = "";
        }

        if (!form.lastName.value.match(stringRegex)) {
            document.getElementById("lastNameErrorMsg").innerText = "Mauvais nom";
            control = false;

        } else {
            document.getElementById("lastNameErrorMsg").innerText = "";
        }

        if (!form.address.value.match(addressRegex)) {
            document.getElementById("addressErrorMsg").innerText = "Mauvaise adresse";
            control = false;

        } else {
            document.getElementById("addressErrorMsg").innerText = "";
        }

        if (!form.city.value.match(stringRegex)) {
            document.getElementById("cityErrorMsg").innerText = "Mauvaise ville";
            control = false;

        } else {
            document.getElementById("cityErrorMsg").innerText = "";
        }

        if (!form.email.value.match(emailRegex)) {
            document.getElementById("emailErrorMsg").innerText = "Mauvais email";
            control = false;

        } else {
            document.getElementById("emailErrorMsg").innerText = "";
        }

        if (control) {
            return true;
        } else {
            return false;
        }
    }

    /*--------------------- Validation de la commande ---------------------*/

    function orderValidation() {
        let orderButton = document.getElementById("order");

        orderButton.addEventListener('click', function (event) {
            let form = document.querySelector(".cart__order__form");
            event.preventDefault();

            if (localStorage.length !== 0) {

                if (validationForm(form)) {


                    // On crée un objet avec les valeurs du formulaire
                    let formInfo = {
                        firstName: form.firstName.value,
                        lastName: form.lastName.value,
                        address: form.address.value,
                        city: form.city.value,
                        email: form.email.value,
                    };

                    // Initialisation de notre array à vide
                    let product = [];

                    // Boucle for pour récupérer nos éléments du localStorage
                    for (let i = 0; i < localStorage.length; i++) {
                        product[i] = JSON.parse(localStorage.getItem(localStorage.key(i))).id;
                    }

                    // On crée un objet avec notre formulaire validé + nos produits du localStorage
                    const order = {
                        contact: formInfo,
                        products: product,
                    };

                    // Méthode d'appel AJAX en POST en incluant notre commande (order)
                    const options = {
                        method: "POST",
                        body: JSON.stringify(order),
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    };

                    fetch("http://localhost:3000/api/products/order/", options)
                        .then((response) => response.json())
                        .then(function (data) {
                            window.location.href = "confirmation.html?id=" + data.orderId;
                        })
                        .catch(function (error) {
                            alert("Error fetch order" + error.message);
                        })

                } else {
                    event.preventDefault();
                    alert("Votre formulaire est mal rempli.");
                }

            } else {
                event.preventDefault();
                alert("Votre panier est vide.");
            }
        });
    }
});