document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll(".otp-input"));

  inputs.forEach((input, idx) => {
    // When you type a digit, auto‑move to the next box
    input.addEventListener("input", () => {
      if (input.value.match(/^[0-9]$/) && inputs[idx + 1]) {
        inputs[idx + 1].focus();
      }
    });

    // On backspace in an empty box, go back
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && inputs[idx - 1]) {
        inputs[idx - 1].focus();
      }
    });

    // Handle paste & fills all boxes
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData("text");
      paste
        .split("")
        .filter((ch) => /\d/.test(ch))
        .slice(0, inputs.length)
        .forEach((ch, i) => {
          inputs[i].value = ch;
        });

      // Focus next empty or last
      const nextEmpty = inputs.find((i) => !i.value);
      (nextEmpty || inputs[inputs.length - 1]).focus();
    });
  });
});
