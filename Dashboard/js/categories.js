//load Data and loggedInUser
const data = JSON.parse(localStorage.getItem("ecommerceData"));
// view all categories in the table
const categoriesTable = document.querySelector("#categoriesTable tbody");
renderCategories();
// add new category
const newName = document.getElementById("newName");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");
saveCategoryBtn.addEventListener("click", () => {
  let name = newName.value.trim();
  newName.classList.remove("is-invalid", "is-valid");
  if (!name) {
    newName.classList.add("is-invalid");
    return;
  }
  name = name
    .split(" ")
    .filter((n) => n)
    .join(" ");
  const exists = data.categories.some(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    newName.classList.add("is-invalid");
    return;
  }
  newName.classList.add("is-valid");
  data.categories.push({ id: data.categories.length + 1, name });
  renderCategories();
  localStorage.setItem("ecommerceData", JSON.stringify(data));
  bootstrap.Modal.getInstance(
    document.getElementById("addCategoryModal")
  ).hide();
  showToast(
    "Category Added",
    `Category "${name}" was added successfully!`,
    true
  );
  newName.value = "";
  newName.classList.remove("is-valid");
});
//edit category
let id = null;
document.getElementsByTagName("tbody")[0].addEventListener("click", (e) => {
  if (e.target.closest(".edit-btn")) {
    id = parseInt(e.target.closest(".edit-btn").dataset.id, 10);
    new bootstrap.Modal(document.getElementById("editCategoryModal")).show();
    const editName = document.getElementById("editName");
    editName.value = data.categories.find((c) => c.id === id).name;
  }
});
document.getElementById("updateCategoryBtn").addEventListener("click", () => {
  const editName = document.getElementById("editName");
  let name = editName.value.trim();
  editName.classList.remove("is-invalid", "is-valid");
  if (!name) {
    editName.classList.add("is-invalid");
    return;
  }
  name = name
    .split(" ")
    .filter((n) => n)
    .join(" ");
  const exists = data.categories.some(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== id
  );
  if (exists) {
    editName.classList.add("is-invalid");
    return;
  }
  editName.classList.add("is-valid");
  data.categories.find((c) => c.id === id).name = editName.value;
  renderCategories();
  localStorage.setItem("ecommerceData", JSON.stringify(data));
  bootstrap.Modal.getInstance(
    document.getElementById("editCategoryModal")
  ).hide();
  showToast(
    "Category Edit",
    `Category "${name}" was edited successfully!`,
    true
  );
  editName.classList.remove("is-valid");
});
// delete category
let categoryToDelete = null; // global for pending delete

document.querySelector("tbody").addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (btn) {
    const id = parseInt(btn.dataset.id, 10);

    // check if products use this category
    const inUse = data.products.some((p) => p.categoryId === id);
    if (inUse) {
      showToast(
        "Delete Failed",
        "This category cannot be deleted because products are assigned to it.",
        false
      );
      return;
    }

    // store id for confirmation
    categoryToDelete = id;
    new bootstrap.Modal(document.getElementById("deleteCategoryModal")).show();
  }
});

// confirm delete
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  if (!categoryToDelete) return;

  const btn = document.getElementById("confirmDeleteBtn");
  const spinner = btn.querySelector(".spinner-border");
  const text = btn.querySelector(".btn-text");

  // show loading spinner
  spinner.classList.remove("d-none");
  text.textContent = "Deleting...";

  setTimeout(() => {
    // delete category
    data.categories = data.categories.filter((c) => c.id !== categoryToDelete);
    localStorage.setItem("ecommerceData", JSON.stringify(data));
    renderCategories();

    // reset button UI
    spinner.classList.add("d-none");
    text.textContent = "Delete";

    // close modal
    bootstrap.Modal.getInstance(
      document.getElementById("deleteCategoryModal")
    ).hide();

    // toast
    showToast(
      "Category Deleted",
      "The category was deleted successfully.",
      true
    );

    categoryToDelete = null;
  }, 800); // little delay for UX
});

// ====== utilites functions ======
// render category
function renderCategories() {
  // clear table first
  categoriesTable.innerHTML = "";

  data.categories.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cat.id}</td>
      <td>${cat.name}</td>
      <td class="action-btns">
        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${cat.id}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${cat.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    categoriesTable.appendChild(row);
  });
}
// show toast
const toastEl = document.getElementById("liveToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toast = new bootstrap.Toast(toastEl);
function showToast(title, message, isSuccess = true) {
  toastTitle.textContent = title;
  toastMessage.textContent = message;

  // Change header color based on success/error
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
