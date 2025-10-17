let cartsProductsDivDom,
  badgeDom,
  shoppingCartIcon,
  cartsProductMenu,
  productDom;

shoppingCartIcon = document.querySelector(".cart");
productDom = document.querySelector(".products"); // the div i will append the products in
cartsProductMenu = document.querySelector(".cartsProducts");

cartsProductsDivDom = document.querySelector(".cartsProductsContent");
badgeDom = document.querySelector("span.badge");
let ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
let products = ecommerceData.products;

//////////////////////////////////////////

//************************open cart menu**************************
shoppingCartIcon.addEventListener("click", openCartMenu);

//************************display the products**************************
let drawProductsUI; // to allow to be called    not only immediattly
(drawProductsUI = function (products = []) {
  productsUI = products.map((item) => {
    return `

            <div class="product-item">
                <img src="images/${item.imageUrl}"
                class="product-item-img"
                alt="blueFlower">

                <div class="product-item-desc">
                    <h2 onclick="saveItemData(${item.id})">${item.name}</h2>
                    <p>Lorem ipsum dolor sit.</p>
                    <span>Category : ${item.category}</span>
                </div>
                    
                <div class="product-item-actions">
                    <button class="addToCart" onclick = "addedToCart(${item.id});" >Add To Cart</button>
                    <i class="fa-regular fa-heart"></i>
                </div>

                </div>
            `;
  });
  productDom.innerHTML = productsUI.join(""); // .join("") :  it's an array    not a string
})(JSON.parse(localStorage.getItem("ecommerceData")).products); // it's calling   NOT initalization

// drawProductsUI();

//*********************************************************************************************** */

//************************check if there are products in localStorage**************************

// addedItem  : must declare glabaly due to its call in cartMenuData fun
//عشان مش كل مرة اعمل رفيرش للصفحة ... يرجع من الاول اراي فاضية

//TODO my self  [the validation ok?]
let addedItem = localStorage.getItem("productsInCart")
  ? JSON.parse(localStorage.getItem("productsInCart"))
  : [];
// // let addedItem = []        //wrong    not enough
// (function cartMenuData(){

//     // for cart :          to update its badge with the count of products [this time from addedItem array which in the localStorage]
//     if(addedItem.length > 0){ // wrong : if(addedItem) always true
//         addedItem.map((item)=>{
//             cartsProductsDivDom.innerHTML += `<p> ${item.name} </p>`;
//         })

//         badgeDom.style.display = "block";
//         badgeDom.innerHTML = addedItem.length; //inside not to be shown in case of     0
//     }
// }
// )();//immediate fun

(function cartMenuData() {
  // let addedItem = JSON.parse(localStorage.getItem("productsInCart")) || [];

  if (addedItem.length > 0) {
    cartsProductsDivDom.innerHTML = ""; // clear before re-adding
    addedItem.forEach((item) => {
      cartsProductsDivDom.innerHTML += `<p>${item.name} (x${item.quantity})</p>`;
    });

    badgeDom.style.display = "block";
    badgeDom.innerHTML = addedItem.length;
  } else {
    badgeDom.style.display = "none";
  }
})();

//************************add to cart**************************

function addedToCart(id) {
  // if(localStorage.getItem("username"))   //TODO team
  // {

  let choosenItem = products.find((item) => item.id == id);

  // check if item already exists in cart
  let existingItem = addedItem.find((item) => item.id === id); // avoid dublication in cartDetails page [UI]
  //مش بضيف في ال هيتعرض ف الصفحة دي غير فقط قطعه واحده

  if (existingItem) {
    //check stock before increasing
    if (existingItem.quantity < choosenItem.stock) {
      existingItem.quantity += 1;
    } else {
      alert(" Sorry, no more stock available for this product.");
      return;
    }
  } else {
    // If stock is available, add new item
    if (choosenItem.stock > 0) {
      // make a shallow copy, so we don’t affect the original products
      //must do this step ... because addedItem represent productsInCart in the localStorage ... so need update without affecting the products
      addedItem.push({ ...choosenItem, quantity: 1 });
    } else {
      alert(" This product is out of stock.");
      return;
    }
  }

  // save updated cart back to localStorage
  localStorage.setItem("productsInCart", JSON.stringify(addedItem));

  // update UI
  cartsProductsDivDom.innerHTML = ""; //imp to avoid dublication in the cart menu ^^  avoid :   piece01   (x1)   piece01   (x2)
  addedItem.forEach((item) => {
    cartsProductsDivDom.innerHTML += `<p>${item.name} (x${item.quantity})</p>`;
  });

  badgeDom.style.display = "block";
  badgeDom.innerHTML = addedItem.length;

  // }

  /////   TODO team
  // else
  // window.location = "login.html";
}

//************************get Unique Array**************************
// if needed
function getUniqueArr(arr, filterType) {
  let unique = arr.map(
    (item) =>
      item[filterType]
        .map((item, i, finalArr) => finalArr.indexOf(item) === i && i) //هنا بيشوف العنصر ال معاه اول  اندكس اتوجد فيه >>> هل هو نفس الاندكس دلوقتي ...  لو.. لا ... اذن اعطي فولس
        .filter((item) => arr[item]) //removes false values, keeps only valid indexes.
        .map((item) => arr[item]) //converts indexes back into actual items.
  );

  return unique;
}
//************************open cart menu**************************
function openCartMenu() {
  if (cartsProductsDivDom.innerHTML != "") {
    //use getComputedStyle   : to avoid the delay which will occure during the toggling
    let currentStyle = getComputedStyle(cartsProductMenu).display;
    if (currentStyle == "none") cartsProductMenu.style.display = "block";
    else if (currentStyle == "block") cartsProductMenu.style.display = "none";
  }
}
//************************save item data in localStorage**************************
function saveItemData(id) {
  localStorage.setItem("productID", JSON.stringify(id)); // 'productID' : '1'
  window.location = "cartDetails.html";
}
//************************search**************************

function search(name, myArray) {
  // matchedItemArr = myArray.filter((item)=> item.name===name)  //ممكن يبقى في اكتر من منتج فيه جزء من الاسم ال بسرش عنه
  var matchedItemArr = myArray.filter(
    (item) => item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
  ); //indexOf   =>  used in str     [name]     :   name.indexOf

  /*
        indexOf : instead of filter    ... to [catch] if there is  any word of my "value" in input i search for 
    */

  drawProductsUI(matchedItemArr);
}

// =================
let input = document.getElementById("search");
input.addEventListener("keyup", function (e) {
  //TODO        is there pagenation?   to search on it only?
  search(
    e.target.value,
    JSON.parse(localStorage.getItem("ecommerceData")).products
  ); //searched and draw

  if (e.target.value.trim() === "")
    // like   entered only    'enter' keyboard
    drawProductsUI(JSON.parse(localStorage.getItem("ecommerceData")).products); //the original fun
});

// console.log(search("Men's Leather Jacket" ,    JSON.parse(localStorage.getItem("ecommerceData")).products    )   )
