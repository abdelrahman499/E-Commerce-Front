const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const spinner = document.getElementById("btnSpinner");
const btnText = submitBtn.querySelector(".btn-text");

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();
  event.stopPropagation();

  if (!contactForm.checkValidity()) {
    contactForm.classList.add("was-validated");
    return;
  }

  submitBtn.disabled = true;
  spinner.classList.remove("d-none");
  btnText.textContent = "Sending...";

  setTimeout(() => {
    submitBtn.disabled = false;
    spinner.classList.add("d-none");
    btnText.textContent = "Send Message";

    const toastEl = document.getElementById("messageToast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    contactForm.reset();
    contactForm.classList.remove("was-validated");
  }, 2000);
});
