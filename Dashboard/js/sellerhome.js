// ecommerce Data
const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));

// Filter products for this seller
const myProducts = ecommerceData.products.filter((p) => p.sellerId === user.id);

// Filter orders that contain this seller's products
const myOrders = ecommerceData.orders.filter((order) =>
  order.items.some((item) => myProducts.some((p) => p.id === item.productId))
);

// DOM Elements
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const totalProducts = document.getElementById("totalProducts");
const topPage = document.getElementById("topPage");

// Order status counts
const pendingOrders = myOrders.filter((o) => o.status === "Pending").length;
const completedOrders = myOrders.filter((o) => o.status === "Delivered").length;

// Assign main stats
totalOrders.innerText = myOrders.length;
totalProducts.innerText = myProducts.length;
totalRevenue.innerText =
  "$" +
  myOrders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2);

// Top product link
const topProduct = myProducts.reduce((max, product) => {
  return product.soldCount > (max?.soldCount || 0) ? product : max;
}, null);

if (topProduct) {
  topPage.innerHTML = `<a href="../pages/productDetails.html?id=${topProduct.id}" class="text-white">${topProduct.name}</a>`;
} else {
  topPage.innerText = "N/A";
}

// Charts
window.addEventListener("load", function () {
  // Sales by Month
  const salesByMonth = Array(12).fill(0);
  myOrders.forEach((order) => {
    if (order.orderDate && order.totalAmount) {
      const monthIndex = new Date(order.orderDate).getMonth();
      salesByMonth[monthIndex] += order.totalAmount;
    }
  });

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenueCtx = document
    .getElementById("revenueSparkline")
    .getContext("2d");
new Chart(revenueCtx, {
  type: "line",
  data: {
    labels: monthLabels,
    datasets: [
      {
        data: salesByMonth,
        borderColor: "#fff",
        backgroundColor: "rgba(255,255,255,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  },
});
  // Sales Overview (Line Chart)
  const ctxSales = document.getElementById("salesChart").getContext("2d");
  const salesGradient = ctxSales.createLinearGradient(0, 0, 0, 200);
  salesGradient.addColorStop(0, "rgba(78,115,223,0.3)");
  salesGradient.addColorStop(1, "rgba(78,115,223,0)");
  new Chart(ctxSales, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Sales ($)",
          data: salesByMonth,
          fill: true,
          borderColor: "#4e73df",
          backgroundColor: salesGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { beginAtZero: true } },
      },
    },
  });

  // Orders by Status (Pie Chart)
  const ctxOrders = document
    .getElementById("ordersStatusChart")
    .getContext("2d");
  new Chart(ctxOrders, {
    type: "pie",
    data: {
      labels: ["Pending", "Delivered", "Cancelled"],
      datasets: [
        {
          label: "Orders",
          data: [
            pendingOrders,
            completedOrders,
            ecommerceData.orders.filter((o) => o.status === "Canceled").length,
          ],
          backgroundColor: ["#f6c23e", "#1cc88a", "#e74a3b"],
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true },
      },
      cutout: "70%", // makes it a donut with empty center
    },
  });

  // Fill Recent Orders
  const recentOrdersTable = document.getElementById("recentOrdersTable");
  recentOrdersTable.innerHTML = myOrders
    .slice(-5)
    .reverse()
    .map(
      (order) => `
            <tr>
                <td>#${order.orderId}</td>
                <td>${
                  ecommerceData.users.find((u) => u.id == order.userId)?.name ||
                  "N/A"
                }</td>
                <td>$${order.totalAmount?.toFixed(2) || "0.00"}</td>
                <td><span class="badge bg-${
                  order.status === "Delivered"
                    ? "success"
                    : order.status === "Pending"
                    ? "warning"
                    : order.status === "Canceled"
                    ? "danger"
                    : "secondary"
                }">${order.status}</span></td>
                <td>${order.orderDate || "N/A"}</td>
            </tr>
        `
    )
    .join("");

  // Top products and low stock alert
  const topProductsList = document.getElementById("topProductsList");
  const lowStockList = document.getElementById("lowStockList");

  const renderList = (
    element,
    items,
    emptyText,
    badgeKey,
    badgeClass,
    headers
  ) => {
    element.innerHTML = "";
    if (items.length === 0) {
      element.innerHTML = `<li class="list-group-item">${emptyText}</li>`;
      return;
    }
    if (headers) {
      element.innerHTML += `
                <li class="list-group-item fw-bold d-flex justify-content-between">
                  <span>ID</span>
                  <span>${headers[0]}</span>
                  <span>${headers[1]}</span>
                </li>
            `;
    }
    items.forEach((p) => {
      element.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>${p.id}</span>
                  <div class="d-flex align-items-center">
<img src="${
        p.imageUrl.startsWith("http") || p.imageUrl.startsWith("data")
          ? p.imageUrl
          : "../assets/images/products/" + p.imageUrl
      }" 
                                    alt="${p.name}" 
    width="40" 
    height="40" 
    class="me-2 rounded">
                        ${p.name}
                  </div>
                  <span class="badge ${badgeClass} rounded-pill">${
        p[badgeKey]
      }</span>
                </li>
            `;
    });
  };

  const topSelling = [...myProducts]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5);

  renderList(
    topProductsList,
    topSelling,
    "No top products yet",
    "soldCount",
    "bg-success",
    ["Product", "Sold"]
  );

  const lowStock = myProducts.filter((p) => (p.stock || 0) <= 5);
  renderList(
    lowStockList,
    lowStock,
    "No low stock items",
    "stock",
    "bg-danger",
    ["Product", "Stock Left"]
  );
});
