/* eslint-disable no-undef */
const toastEl = document.getElementById("liveToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toast = new bootstrap.Toast(toastEl);
function showToast(title, message, isSuccess = true) {
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  const toastHeader = toastEl.querySelector(".toast-header");
  if (isSuccess) {
    toastHeader.classList.remove("bg-danger", "text-white");
    toastHeader.classList.add("bg-success", "text-white");
  } else {
    toastHeader.classList.remove("bg-success", "text-white");
    toastHeader.classList.add("bg-danger", "text-white");
  }
  toast.show();
}
const sidebar = document.getElementById("adminSidebar");
const toggleBtn = document.getElementById("sidebarToggle");
const mainContent = document.querySelector(".main-content");

function toggleSidebar() {
  if (window.innerWidth < 992) {
    sidebar.classList.toggle("show");
  } else {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  }
}

function handleResize() {
  if (window.innerWidth < 992) {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("expanded");
  } else {
    sidebar.classList.remove("show");
  }
}
toggleBtn.addEventListener("click", toggleSidebar);
window.addEventListener("resize", handleResize);
handleResize();
// Validation patterns
const validationPatterns = {
  name: /^[a-zA-Z\s]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/,
};
// Pagination variables
let currentPage = 1;
let pageSize = 10;
let filteredCustomers = [];

function initializeEcommerceData() {
  if (!localStorage.getItem("ecommerceData")) {
    const defaultData = {
      users: [
        {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          password: "Admin@123",
          role: "admin",
          status: "active",
          joinedDate: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Seller One",
          email: "seller1@example.com",
          password: "seller123",
          role: "seller",
          status: "active",
          joinedDate: new Date().toISOString(),
        },
        {
          id: 3,
          name: "John Doe",
          email: "john@example.com",
          password: "customer123",
          role: "customer",
          status: "active",
          joinedDate: new Date().toISOString(),
        }
      ],
    };
    localStorage.setItem("ecommerceData", JSON.stringify(defaultData));
  } 
}
function filterCustomers() {
  const nameFilter = document.getElementById("nameFilter").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {
    users: [],
  };
  filteredCustomers = ecommerceData.users;

  if (nameFilter) {
    filteredCustomers = filteredCustomers.filter((customer) =>
      customer.name.toLowerCase().includes(nameFilter)
    );
  }

  if (roleFilter) {
    filteredCustomers = filteredCustomers.filter(
      (customer) => customer.role === roleFilter
    );
  }

  if (statusFilter) {
    filteredCustomers = filteredCustomers.filter(
      (customer) => customer.status === statusFilter
    );
  }
  // Reset to first page when filtering
  currentPage = 1;  
  renderCustomersTable();
}
function renderCustomersTable() {
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";
  // Calculate pagination values
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredCustomers.slice(startIndex, endIndex);
  if (currentItems.length === 0) {
    tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                            No customers found matching your criteria.
                        </td>
                    </tr>
                `;
    updatePaginationControls(totalItems, totalPages);
    return;
  }
  currentItems.forEach((customer, index) => {
    const tr = document.createElement("tr");
    const joinedDate = customer.joinedDate
      ? new Date(customer.joinedDate).toLocaleDateString()
      : "N/A";
    tr.innerHTML = `
                    <td>${startIndex + index + 1}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>
                        <span class="badge ${getRoleBadgeClass(customer.role)}">
                            ${
                              customer.role.charAt(0).toUpperCase() +
                              customer.role.slice(1)
                            }
                        </span>
                    </td>
                    <td>
                        <span class="badge status-badge ${
                          customer.status === "active"
                            ? "bg-success"
                            : "bg-secondary"
                        }">
                            ${
                              customer.status
                                ? customer.status.charAt(0).toUpperCase() +
                                  customer.status.slice(1)
                                : "Active"
                            }
                        </span>
                    </td>
                    <td>${joinedDate}</td>
                    <td class="action-btns">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${
                          customer.id
                        }">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                          customer.id
                        }">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
    tbody.appendChild(tr);
  });

  updatePaginationControls(totalItems, totalPages);
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      const ecommerceData = JSON.parse(
        localStorage.getItem("ecommerceData")
      ) || { users: [] };
      const customer = ecommerceData.users.find((u) => u.id === id);

      if (customer) {
        document.getElementById("editCustomerId").value = customer.id;
        document.getElementById("editName").value = customer.name;
        document.getElementById("editEmail").value = customer.email;
        document.getElementById("editRole").value = customer.role;
        document.getElementById("editStatus").checked =
          customer.status === "active";
        // Clear validation errors when opening modal
        document
          .querySelectorAll("#editCustomerForm .is-invalid")
          .forEach((el) => {
            el.classList.remove("is-invalid");
          });

        const modal = new bootstrap.Modal(
          document.getElementById("editCustomerModal")
        );
        modal.show();
      }
    });
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      document.getElementById("deleteCustomerId").value = id;

      // eslint-disable-next-line no-undef
      const modal = new bootstrap.Modal(
        document.getElementById("deleteCustomerModal")
      );
      modal.show();
    });
  });
}

function updatePaginationControls(totalItems, totalPages) {
  const pageInfo = document.getElementById("pageInfo");
  const paginationControls = document.getElementById("paginationControls");
  // Update page info text
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);
  pageInfo.textContent =
    totalItems > 0
      ? `Showing ${startIndex} to ${endIndex} of ${totalItems} entries`
      : "Showing 0 entries";

  // Generate pagination buttons
  paginationControls.innerHTML = "";

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage - 1
  }">Previous</a>`;
  paginationControls.appendChild(prevLi);

  // Page number buttons
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    paginationControls.appendChild(pageLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages || totalPages === 0 ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage + 1
  }">Next</a>`;
  paginationControls.appendChild(nextLi);

  // Add event listeners to pagination buttons
  document.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute("data-page"));
      if (!isNaN(page)) {
        currentPage = page;
        renderCustomersTable();
      }
    });
  });
}

function validateInput(input, pattern, errorMessage) {
  const isValid = pattern.test(input.value.trim());
  if (!isValid) {
    input.classList.add("is-invalid");
    input.nextElementSibling.textContent = errorMessage;
  } else {
    input.classList.remove("is-invalid");
  }
  return isValid;
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add("btn-loading");
    button.disabled = true;
  } else {
    button.classList.remove("btn-loading");
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeEcommerceData();
  loadCustomers();
  updateNavbarUser();

  document
    .getElementById("toggleNewPassword")
    .addEventListener("click", function () {
      const passwordInput = document.getElementById("newPassword");
      const icon = this.querySelector("i");
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    });

  document.getElementById("newName").addEventListener("input", function () {
    validateInput(
      this,
      validationPatterns.name,
      "Please enter a valid name (2-50 characters)"
    );
  });

  document.getElementById("newEmail").addEventListener("input", function () {
    validateInput(
      this,
      validationPatterns.email,
      "Please enter a valid email address"
    );
  });

  document.getElementById("newPassword").addEventListener("input", function () {
    validateInput(
      this,
      validationPatterns.password,
      "Password must be at least 6 characters long"
    );
  });

  document.getElementById("newRole").addEventListener("change", function () {
    if (!this.value) {
      this.classList.add("is-invalid");
      this.nextElementSibling.textContent = "Please select a role";
    } else {
      this.classList.remove("is-invalid");
    }
  });

  document.getElementById("editName").addEventListener("input", function () {
    validateInput(
      this,
      validationPatterns.name,
      "Please enter a valid name (2-50 characters)"
    );
  });

  document.getElementById("editEmail").addEventListener("input", function () {
    validateInput(
      this,
      validationPatterns.email,
      "Please enter a valid email address"
    );
  });

  document
    .getElementById("nameFilter")
    .addEventListener("input", filterCustomers);
  document
    .getElementById("roleFilter")
    .addEventListener("change", filterCustomers);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterCustomers);
  document
    .getElementById("resetFilters")
    .addEventListener("click", function () {
      document.getElementById("nameFilter").value = "";
      document.getElementById("roleFilter").value = "";
      document.getElementById("statusFilter").value = "";
      loadCustomers();
    });

  // Page size selector event
  document
    .getElementById("pageSizeSelector")
    .addEventListener("change", function () {
      pageSize = parseInt(this.value);
      currentPage = 1;
      renderCustomersTable();
    });

  document
    .getElementById("saveCustomerBtn")
    .addEventListener("click", function () {
      const nameInput = document.getElementById("newName");
      const emailInput = document.getElementById("newEmail");
      const passwordInput = document.getElementById("newPassword");
      const roleInput = document.getElementById("newRole");

      const isNameValid = validateInput(
        nameInput,
        validationPatterns.name,
        "Please enter a valid name (2-50 characters)"
      );
      const isEmailValid = validateInput(
        emailInput,
        validationPatterns.email,
        "Please enter a valid email address"
      );
      const isPasswordValid = validateInput(
        passwordInput,
        validationPatterns.password,
        "Password must be at least 6 characters"
      );
      const isRoleValid = roleInput.value ? true : false;

      if (!isRoleValid) {
        roleInput.classList.add("is-invalid");
        roleInput.nextElementSibling.textContent = "Please select a role";
      } else {
        roleInput.classList.remove("is-invalid");
      }

      if (!isNameValid || !isEmailValid || !isPasswordValid || !isRoleValid) {
        showToast("Error", "Please fix all validation errors", false);
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const role = roleInput.value;

      const ecommerceData = JSON.parse(
        localStorage.getItem("ecommerceData")
      ) || { users: [] };
      const users = ecommerceData.users;

      if (users.some((user) => user.email === email)) {
        emailInput.classList.add("is-invalid");
        emailInput.nextElementSibling.textContent = "Email already exists";
        showToast("Error", "Email already exists", false);
        return;
      }

      setButtonLoading(this, true);

      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          name,
          email,
          password,
          role,
          status: "active",
          joinedDate: new Date().toISOString(),
        };

        users.push(newUser);
        ecommerceData.users = users;
        localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

        // eslint-disable-next-line no-undef
        bootstrap.Modal.getInstance(
          document.getElementById("addCustomerModal")
        ).hide();
        document.getElementById("addCustomerForm").reset();
        loadCustomers();

        setButtonLoading(this, false);

        showToast("Success", "Customer added successfully");
      }, 1000);
    });

  // Update customer
        document
          .getElementById("updateCustomerBtn")
          .addEventListener("click", function () {
            const id = parseInt(document.getElementById("editCustomerId").value);
            const nameInput = document.getElementById("editName");
            const emailInput = document.getElementById("editEmail");
            const roleInput = document.getElementById("editRole");

            const isNameValid = validateInput(
              nameInput,
              validationPatterns.name,
              "Please enter a valid name (2-50 characters)"
            );
            const isEmailValid = validateInput(
              emailInput,
              validationPatterns.email,
              "Please enter a valid email address"
            );
            const isRoleValid = roleInput.value ? true : false;

            if (!isRoleValid) {
              roleInput.classList.add("is-invalid");
              roleInput.nextElementSibling.textContent = "Please select a role";
            } else {
              roleInput.classList.remove("is-invalid");
            }

            if (!isNameValid || !isEmailValid || !isRoleValid) {
              showToast("Error", "Please fix all validation errors", false);
              return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const role = roleInput.value;
            const status = document.getElementById("editStatus").checked
              ? "active"
              : "inactive";

            const ecommerceData = JSON.parse(
              localStorage.getItem("ecommerceData")
            ) || { users: [] };
            const users = ecommerceData.users;
            const userIndex = users.findIndex((user) => user.id === id);

            if (userIndex === -1) {
              showToast("Error", "Customer not found", false);
              return;
            }

            if (
              users.some((user, index) => user.email === email && index !== userIndex)
            ) {
              emailInput.classList.add("is-invalid");
              emailInput.nextElementSibling.textContent =
                "Email already exists for another customer";
              showToast("Error", "Email already exists for another customer", false);
              return;
            }

            setButtonLoading(this, true);

            setTimeout(() => {
              users[userIndex] = {
                ...users[userIndex],
                name,
                email,
                role,
                status,
              };

              ecommerceData.users = users;
              localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

              bootstrap.Modal.getInstance(
                document.getElementById("editCustomerModal")
              ).hide();
              loadCustomers();

              setButtonLoading(this, false);

              const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
              if (loggedInUser && loggedInUser.id === id) {
                localStorage.setItem(
                  "loggedInUser",
                  JSON.stringify(users[userIndex])
                );
                updateNavbarUser();
              }

              showToast("Success", "Customer updated successfully");
            }, 1000);
          });

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      const id = parseInt(document.getElementById("deleteCustomerId").value);
      const ecommerceData = JSON.parse(
        localStorage.getItem("ecommerceData")
      ) || { users: [] };
      const users = ecommerceData.users;
      const userIndex = users.findIndex((user) => user.id === id);

      if (userIndex === -1) {
        showToast("Error", "Customer not found", false);
        return;
      }

      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser && loggedInUser.id === id) {
        showToast(
          "Error",
          "You cannot delete your own account while logged in ",
          false
        );
        return;
      }

      setButtonLoading(this, true);

      setTimeout(() => {
        users.splice(userIndex, 1);
        ecommerceData.users = users;
        localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

        bootstrap.Modal.getInstance(
          document.getElementById("deleteCustomerModal")
        ).hide();
        loadCustomers();

        setButtonLoading(this, false);

        showToast("Success", "Customer deleted successfully");
      }, 1000);
    });

  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "../pages/auth/login.html";
  });
});

function loadCustomers() {
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {
    users: [],
  };
  filteredCustomers = ecommerceData.users;
  renderCustomersTable();
}

function getRoleBadgeClass(role) {
  switch (role) {
    case "admin":
      return "role-badge-admin";
    case "seller":
      return "role-badge-seller";
    case "customer":
      return "role-badge-customer";
    default:
      return "bg-secondary";
  }
}

function updateNavbarUser() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    document.querySelector(".user-name").textContent = loggedInUser.name;
    document.querySelector(".dropdown-menu .mb-0").textContent =
      loggedInUser.name;
    document.querySelector(".dropdown-menu .text-muted").textContent =
      loggedInUser.role
        ? loggedInUser.role.charAt(0).toUpperCase() + loggedInUser.role.slice(1)
        : "User";

    const initials = loggedInUser.name
      .split(" ")
      .map((n) => n[0])
      .join("");
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=6366f1&color=fff`;

    document.querySelector(".user-profile img").src = avatarUrl;
    document.querySelector(".dropdown-menu img").src = avatarUrl;
  }
}
