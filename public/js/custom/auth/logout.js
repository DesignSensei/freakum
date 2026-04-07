// public/js/custom/auth/logout.js

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtns = document.querySelectorAll(".logout-button");

  if (!logoutBtns.length) return;

  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await fetch("/logout", {
          method: "POST",
          credentials: "include",
          headers: { "X-CSRF-Token": token || "" },
        });
      } catch (err) {
        console.error("Logout error:", err);
      }

      window.location.replace("/login");
    });
  });
});
