// public/js/custom/products/save-product.js

"use strict";
var KTAppEcommerceSaveProduct = (function () {
  return {
    init: function () {
      // Quill editor
      let descEl = document.querySelector("#kt_ecommerce_add_product_description");
      if (descEl) {
        new Quill("#kt_ecommerce_add_product_description", {
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              ["image", "code-block"],
            ],
          },
          placeholder: "Type your text here...",
          theme: "snow",
        });
      }

      ["#kt_ecommerce_add_product_category", "#kt_ecommerce_add_product_tags"].forEach((e) => {
        const t = document.querySelector(e);
        t &&
          new Tagify(t, {
            whitelist: [
              "new",
              "trending",
              "sale",
              "discounted",
              "selling fast",
              "bestseller",
              "limited edition",
              "summer",
              "winter",
              "streetwear",
              "casual",
              "oversized",
              "graphic",
              "unisex",
              "cotton",
              "fleece",
              "premium",
              "eco-friendly",
              "minimalist",
              "urban",
              "athleisure",
            ],
            dropdown: {
              maxItems: 20,
              classname: "tagify__inline__suggestions",
              enabled: 0,
              closeOnSelect: !1,
            },
          });
      });

      // noUiSlider
      const sliderEl = document.querySelector("#kt_ecommerce_add_product_discount_slider");
      const sliderLabel = document.querySelector("#kt_ecommerce_add_product_discount_label");
      if (sliderEl && sliderLabel) {
        noUiSlider.create(sliderEl, {
          start: [0],
          connect: true,
          range: { min: 0, max: 100 },
        });
        sliderEl.noUiSlider.on("update", function (values) {
          sliderLabel.innerHTML = Math.round(values[0]);
        });
      }
    },
  };
})();
KTUtil.onDOMContentLoaded(function () {
  KTAppEcommerceSaveProduct.init();
});
