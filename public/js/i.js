function iceCream() {
  const icedCream = document.querySelector(".w-webflow-badge");
  if (icedCream) {
    icedCream.remove();
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", iceCream);
[25, 50, 100, 200, 300, 400, 500, 600, 700, 1000].forEach((delay) =>
  setTimeout(iceCream, delay)
);
