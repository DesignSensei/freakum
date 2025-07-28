document.addEventListener("DOMContentLoaded", () => {
  //—––– Password toggle –––—
  const pwd = document.getElementById("password");
  const toggle = document.getElementById("togglePassword");

  if (pwd && toggle) {
    let visible = false;

    toggle.innerHTML = feather.icons["eye-off"].toSvg();
    toggle.addEventListener("click", () => {
      visible = !visible;
      pwd.type = visible ? "text" : "password";
      toggle.innerHTML = feather.icons[visible ? "eye" : "eye-off"].toSvg();
      toggle.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
      );
    });
  }

  //—––– Form submit + SweetAlert –––—
  const form = document.getElementById("auth-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        const firstInvalid = form.querySelector(":invalid");
        Swal.fire({
          icon: "warning",
          text: firstInvalid.validationMessage,
          confirmButtonColor: "#D25782",
        }).then(() => firstInvalid.focus());
      } else {
        e.preventDefault();
        Swal.fire({
          icon: "success",
          text: "Welcome back",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => form.submit());
      }
    });
  }
});
