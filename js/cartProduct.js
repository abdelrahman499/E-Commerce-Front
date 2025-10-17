let data = JSON.parse(localStorage.getItem("ecommerceData"));
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let cartItems = data.cart.find((c) => c.userId === loggedInUser.id);
console.log(cartItems.items);

function updateQuantity(btn, change) {
  //this  : btn   [+ , -]           which listen to the event
  const row = btn.closest(".product-row"); // عاوزة اجيب الرو ال فيه ال الزار ده بالذات يا نورا
  const productName = row.querySelector(".product-name").textContent;

  let addedItem = JSON.parse(localStorage.getItem("productsInCart")) || [];
  let currentItem = addedItem.find((item) => item.name === productName);

  if (!currentItem) return;

  //  Check stock
  let newValue = currentItem.quantity + change;
  if (newValue < 1) newValue = 1; //to prevent the neg val
  if (newValue > currentItem.stock) {
    alert(" You cannot add more than the available stock!");
    return;
  }

  currentItem.quantity = newValue;

  // Update input value
  const input = row.querySelector(".quantity-input");
  input.value = newValue;

  // Update subtotal
  const price = +row.querySelector(".price").textContent.slice(1);
  row.querySelector(".subtotal").textContent = `$${price * newValue}`;

  // Save back to localStorage
  localStorage.setItem("productsInCart", JSON.stringify(addedItem));

  // Update totals
  updateCartTotal();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
function removeProduct(trashIcon) {
  // this  :  trashIcon
  const row = trashIcon.closest(".product-row"); //the row where the product in
  const productName = row.querySelector(".product-name").textContent; //in this [specific row]     ... get the element which is with a class "product-name"

  row.style.animation = "fadeOut 0.3s ease"; // so we us setTimeout

  setTimeout(() => {
    row.remove();

    ////updates after remove the row:
    // 1. get products from localStorage
    // 2. filter out the removed product
    // 3. save updated array back to localStorage
    // 4. update totals
    // 5. update cart menu UI (to reflect removal)

    //////////////////////////////////////////////////
    //1-
    let addedItem = JSON.parse(localStorage.getItem("productsInCart")) || [];
    //2-
    addedItem = addedItem.filter((item) => item.name !== productName);
    //3-
    localStorage.setItem("productsInCart", JSON.stringify(addedItem));
    //4-
    updateCartTotal();
    //5-
    cartsProductsDivDom.innerHTML = "";
    addedItem.forEach((item) => {
      cartsProductsDivDom.innerHTML += `<p>${item.name} (x${item.quantity})</p>`;
    });

    if (addedItem.length > 0) {
      badgeDom.style.display = "block";
      badgeDom.innerHTML = addedItem.length;
    } else {
      badgeDom.style.display = "none";
    }
  }, 300);
}

function updateCartTotal() {
  const subtotals = document.querySelectorAll(".subtotal");
  let total = 0;
  subtotals.forEach((subtotal) => {
    total += parseFloat(subtotal.textContent.replace("$", ""));
  });

  document.getElementById("subtotal-amount").textContent = "$" + total;
  document.getElementById("total-amount").textContent = "$" + total;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//VIP mark:
//غلط تكون هنا عشان مش كل ما الصفحة ترفرش ... كل لما تجيب تاني ال كان في الكارت
// let productsInCart = localStorage.getItem("productsInCart");

let productsDom = document.querySelector(".productsInCart");
let noProductsDom = document.querySelector(".noProducts");

// if(productsInCart){ // chk in localStorage there are products added?

//     let items = JSON.parse(productsInCart);
//     // console.log(items)
//     drawCartProductsUI(items);

// }
/////////////////////////////////////

function drawCartProductsUI(allProducts = []) {
  let products = cartItems.items || allProducts; //instead of the validation above  //عشان احل موضوع اني كل لما ارفرش بجيب كل الايتمز تاني
  // productsDom.innerHTML = "";       // to remove all the previous items

  if (products.length === 0) {
    noProductsDom.innerHTML = `<p>there is no items yet </p>`;
  }
  let productsUI = products.map((item) => {
    let product = data.products.find((p) => p.id == item.productId);
    return `

        <div class="product-row">
                    <div class="product-info">
                        <img src="${
                          product.imageUrl.startsWith("http") ||
                          product.imageUrl.startsWith("data")
                            ? product.imageUrl
                            : "../assets/images/products/" + product.imageUrl
                        }" class="product-image">
                        <div class="product-name">${product.name}</div>
                    </div>
                    <div class="price"><span class="text-decoration-line-through">$${
                      product.price
                    }</span>&nbsp;&nbsp;$${
      product.price - (product.price * product.discount) / 100
    }</div>

                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(this, -1)">-</button>
                        <input type="text" class="quantity-input" value="${
                          item.quantity
                        }" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(this, 1)">+</button>
                    </div>


                    <div class="subtotal">$${
                      product.price * item.quantity
                    }</div>                 
                    <div class="trash-icon" onclick="removeProduct(this)" title="Remove item">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
        
        `;
    //اليوزر هيعدل الكمية من بره ....
    //addToCart btn       |       inside the cartProducts
    ////<div class="subtotal">$${item.price * item.order}</div>                           //  TODO myself
  });
  productsDom.innerHTML = productsUI.join("");
}

drawCartProductsUI();

//************************Rmove from cart**************************

// function removeItemFromCart(id){
//     let productsInCart = localStorage.getItem("productsInCart");
//     if(productsInCart){  //productsInCart   :  return    null | string
//         let items = JSON.parse(productsInCart); // [  obj , obj , ....]
//         let filteredItems  = items.filter((item)=> item.id != id)   // get all items except i removed

//         //update productsInCart in the localStorage ^^  [will send to drawCartProductsUI]
//         // localStorage.setItem("productsInCart" , filteredItems);
//         localStorage.setItem("productsInCart" , JSON.stringify(filteredItems));
//         drawCartProductsUI(filteredItems);

//         //update badge of the cart:

//     }

// }
