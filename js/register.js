if (!localStorage.getItem("ecommerceData")) {
  localStorage.setItem("ecommerceData", JSON.stringify({
    users: [{
      id: Date.now(),
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      status: "active",
      joinDate: new Date().toISOString()
    }],
  }));
}

const togglePassword = (inputId, iconId) => {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  }
};

document.getElementById("togglePassword").addEventListener("click", () => togglePassword("password", "passwordIcon"));
document.getElementById("toggleConfirmPassword").addEventListener("click", () => togglePassword("confirmPassword", "confirmPasswordIcon"));

const successToast = new bootstrap.Toast(document.getElementById('toastSuccess'));
const errorToast = new bootstrap.Toast(document.getElementById('toastError'));

document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const role = document.getElementById("role");
  
  // Reset validation
  [name, email, password, confirmPassword, role].forEach(input => {
    input.classList.remove("is-invalid");
  });

  let isValid = true;
  
  if (name.value.trim().length < 2) {
    name.classList.add("is-invalid");
    isValid = false;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    email.classList.add("is-invalid");
    isValid = false;
  }
  
  if (password.value.trim().length < 6) {
    password.classList.add("is-invalid");
    isValid = false;
  }
  
  if (password.value.trim() !== confirmPassword.value.trim()) {
    confirmPassword.classList.add("is-invalid");
    isValid = false;
  }
  
  if (!role.value) {
    role.classList.add("is-invalid");
    isValid = false;
  }
  
  if (!isValid) return;

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Registering...';

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  const users = ecommerceData.users || [];

  if (users.some(user => user.email === email.value.trim())) {
    email.classList.add("is-invalid");
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Register";
    
    document.getElementById('toastError').querySelector('.toast-body').textContent = "Email already exists!";
    errorToast.show();
    return;
  }

  setTimeout(() => {
    const newUser = {
      id: Date.now(),
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
      role: role.value,
      status: "active",
      joinedDate: new Date().toISOString()
    };

    users.push(newUser);
    ecommerceData.users = users;
    ecommerceData.lastUserId = newUser.id;
    localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

    submitBtn.disabled = false;
    submitBtn.innerHTML = "Register";

    document.getElementById('toastSuccess').querySelector('.toast-body').textContent = "✅ Registration successful!";
    successToast.show();
    
    setTimeout(() => {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser) {
        window.location.href = "../../index.html";
      } else {
        window.location.href = "login.html";
      }
    }, 2000);
  }, 1000);
});

if (localStorage.getItem("loggedInUser")) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  switch(user.role) {
    case "admin": window.location.href = "/Dashboard/dashboard.html"; break;
    case "seller": window.location.href = "../seller/dashboard.html"; break;
    default: window.location.href = "../../index.html";
  }
}     