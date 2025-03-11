document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      // Redirect based on the template number
      window.location.href = `template${index + 1}.html`;
    });
  });
});
