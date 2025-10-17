// Initialize sidebar toggle
const sidebar = document.getElementById("adminSidebar");
const toggleBtn = document.getElementById("sidebarToggle");
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const adminOnlyLis = document.getElementsByClassName("adminOnly");

if (loggedInUser.role === "seller") {
  Array.from(adminOnlyLis).forEach((li) => {
    li.classList.add("d-none");
  });
  document.getElementById("home").href = "./sellerhome.html";
}
function toggleSidebar() {
  if (window.innerWidth < 992) {
    sidebar.classList.toggle("show");
  } else {
    sidebar.classList.toggle("collapsed");
  }
}
document.addEventListener("click", (e) => {
  // only apply on small screens
  if (window.innerWidth < 992 && sidebar.classList.contains("show")) {
    const clickedInsideSidebar = sidebar.contains(e.target);
    const clickedToggleBtn = toggleBtn && toggleBtn.contains(e.target);

    // close sidebar only if clicked outside both sidebar and toggle button
    if (!clickedInsideSidebar && !clickedToggleBtn) {
      sidebar.classList.remove("show");
    }
  }
});
function handleResize() {
  if (window.innerWidth < 992) {
    sidebar.classList.remove("collapsed");
  } else {
    sidebar.classList.remove("show");
  }
}

toggleBtn.addEventListener("click", toggleSidebar);
window.addEventListener("resize", handleResize);
handleResize();

// menuLinks.forEach((link) => {
//   link.addEventListener("click", function () {
//     menuLinks.forEach((l) => l.classList.remove("active"));
//     this.classList.add("active");
//   });
// });
