const Data=JSON.parse(localStorage.getItem("ecommerceData"));
const userRole = JSON.parse(localStorage.getItem("loggedInUser")).role;
  const userId = JSON.parse(localStorage.getItem("loggedInUser")).id;
  const products=JSON.parse(localStorage.getItem("ecommerceData")).products;
  let orders=  JSON.parse(localStorage.getItem("ecommerceData")).orders;
  let orderI = orders.length+1;
  

  const tableBody = document.getElementById('ordersTable');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const addOrderBtn = document.getElementById('addOrderBtn');
  const actionsHeader = document.getElementById('actionsHeader');

  
  if(userRole === "admin"||userRole==="seller"){
    // addOrderBtn.classList.remove("d-none");
    actionsHeader.classList.remove("d-none");
  }

  function renderOrders(list) {
    tableBody.innerHTML = '';
    list.forEach(order => {
      let row = `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.userId}</td>
          <td>${retriveItems(order.items)}</td>
          <td>${order.totalAmount}</td>
          <td><span class="status ${order.status.replace(" ","")}">${order.status}</span></td>
      `;
      if(userRole === "admin"){
        row += `
          <td>
            <button class="action-btn edit-btn" onclick="editOrder(${order.orderId})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteOrder(${order.orderId})">Delete</button>
          </td>
        `;
      }
      if (userRole === "seller") {

        row += `
          <td>
            <button class="action-btn edit-btn" onclick="editOrder(${order.orderId})">Edit</button>
          </td>
          
            `;
      }
      row += `</tr>`;
      tableBody.innerHTML += row;
    });
  }
  
  function retriveItems(items){
      result=``;
      items.forEach((item)=>{
        result+=`<div>${getItemName(item.productId)+" "+item.quantity}
          </div>`;
      
      })
      return result;
  }

  function getItemName(index){
    result=
    products.filter((item)=>
      item.id==index
    )
    
    return result[0].name;

  }
  function filterOrders() {
    const searchTerm = searchInput.value;
    const statusTerm = statusFilter.value;
    const filtered = orders.filter(order => {
      const matchesSearch = `${order.userId}`.includes(searchTerm) ||
                            `${order.orderId}`.includes(searchTerm);
      const matchesStatus = statusTerm === '' || order.status === statusTerm;
      return matchesSearch && matchesStatus;
    });
    renderOrders(filtered);
  }

  function deleteOrder(id){
    orders = orders.filter(o => o.orderId !== id);
    filterOrders();
    Data.orders=orders;
    localStorage.setItem("ecommerceData",JSON.stringify(Data));
  }

  function editOrder(id){
    console.log(id);
    
    const order = orders.find(o => o.orderId === id);
    const newStatus = prompt("Update status (Pending, Processing, OnHold, Shipped, Delivered, Cancelled):", order.status);
    if(newStatus && ["Pending","Processing","OnHold","Shipped","Delivered","Cancelled"].includes(newStatus)){
        order.status = newStatus;
        filterOrders();
        Data.orders=orders;
        localStorage.setItem("ecommerceData",JSON.stringify(Data));
        
    } else if(newStatus) alert("Invalid status!");
  }

  searchInput.addEventListener('input', filterOrders);
  statusFilter.addEventListener('change', filterOrders);

  // filterOrders();
  renderOrders(orders);
    ///////////////////////////////////////////////seller orders display /////////////////////////////////
    //sellerid in product 
    //seller role in users 
    //orders of seller in seller 
    //logedin user id 
  
    // sellerProductsId=products.filter((product)=>
    //     product.sellerId==userId)
    //     .map(product=>product.id)


if (userRole === "seller") {
  
   
            

  function getSellerOrders(Sorders = orders, Sproducts = products, sellerId = userId) {
    return Sorders
      .map(order => {
        // filter items in this order that belong to this seller
        const sellerItems = order.items.filter(item => {
          const product = Sproducts.find(p => p.id === item.productId);
          return product && product.sellerId === sellerId;
        });

        if (sellerItems.length > 0) {
          return {
            orderId: order.orderId,
            userId: order.userId,
            items: sellerItems,
            status: order.status,   
            totalAmount: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)  
          };
        }
        return null;
      })
      .filter(order => order !== null);
  }

  const sellerOrders = getSellerOrders();
  renderOrders(sellerOrders);   
}
else {
  renderOrders(orders); 
}
