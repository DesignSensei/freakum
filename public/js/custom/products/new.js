// public/js/custom/products/new.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ new.js DOMContentLoaded fired");
  let dropzoneInstance = null;
  let variationCounter = 1;

  // ====================== HELPERS ======================
  function initSelect2(select) {
    $(select).select2({
      placeholder: "Select size",
      minimumResultsForSearch: Infinity,
      allowClear: true,
    });
  }

  function destroySelect2(select) {
    if (select && $(select).data("select2")) {
      $(select).select2("destroy");
    }
  }

  function attachDeleteHandler(button) {
    button.addEventListener("click", function () {
      const item = button.closest("[data-repeater-item]");
      $(item).slideUp(300, function () {
        destroySelect2(item.querySelector("select"));
        item.remove();
      });
    });
  }

  // Bootstrap existing rows
  document
    .querySelectorAll(
      '[data-repeater-list="kt_ecommerce_add_product_options"] > [data-repeater-item]'
    )
    .forEach((item) => {
      if (item.closest("[data-repeater-template]")) return;
      const select = item.querySelector("select");
      if (select) initSelect2(select);
      const deleteBtn = item.querySelector(".delete-variation");
      if (deleteBtn) attachDeleteHandler(deleteBtn);
    });

  // Add variation
  document.getElementById("add-variation").addEventListener("click", () => {
    const list = document.querySelector('[data-repeater-list="kt_ecommerce_add_product_options"]');
    const template = list.querySelector("[data-repeater-template]");
    if (!template) return;

    const newItem = template.querySelector("[data-repeater-item]").cloneNode(true);

    newItem
      .querySelectorAll("[name]")
      .forEach((el) =>
        el.setAttribute("name", el.getAttribute("name").replace(/__index__/g, variationCounter))
      );

    newItem.querySelectorAll("[disabled]").forEach((el) => el.removeAttribute("disabled"));

    const clonedSelect = newItem.querySelector("select");
    if (clonedSelect) {
      // Remove any leftover Select2 wrapper from cloning
      newItem.querySelector(".select2")?.remove();

      // Restore visibility and reset state
      clonedSelect.style.display = "";
      clonedSelect.classList.remove("select2-hidden-accessible");
      clonedSelect.removeAttribute("data-select2-id");
      clonedSelect.selectedIndex = 0;

      initSelect2(clonedSelect);
    }

    const deleteBtn = newItem.querySelector(".delete-variation");
    if (deleteBtn) attachDeleteHandler(deleteBtn);

    list.appendChild(newItem);
    $(newItem).hide().slideDown(300);

    variationCounter++;
  });

  // ====================== STATUS + DATE PICKER ======================
  const $statusSelect = $("#kt_ecommerce_add_product_status_select");
  const dateWrapper = document.getElementById("kt_ecommerce_add_product_publish_date_wrapper");

  function toggleDateWrapper(value) {
    dateWrapper?.classList.toggle("d-none", value !== "scheduled");
  }

  if ($statusSelect.length) {
    $statusSelect.on("select2:select", (e) => toggleDateWrapper(e.params.data.id));
    toggleDateWrapper($statusSelect.val());
  }

  // Flatpickr — lazy init on focus (this was the missing part)
  const dateInput = document.getElementById("kt_ecommerce_add_product_status_datepicker");
  if (dateInput) {
    dateInput.addEventListener(
      "focus",
      function () {
        flatpickr(this, {
          enableTime: true,
          dateFormat: "d/m/Y H:i",
          minDate: "today",
          time_24hr: false,
        });
      },
      { once: true }
    );
  }

  // ====================== noUiSlider, Discount Radios, Dropzone, Tags, Quill ======================

  const sliderEl = document.getElementById("kt_ecommerce_add_product_discount_slider");
  const discountLabel = document.getElementById("kt_ecommerce_add_product_discount_label");
  let sliderHiddenInput = document.getElementById("hidden_discount_percentage");
  if (sliderEl && !sliderHiddenInput) {
    sliderHiddenInput = document.createElement("input");
    sliderHiddenInput.type = "hidden";
    sliderHiddenInput.name = "discount_percentage";
    sliderHiddenInput.id = "hidden_discount_percentage";
    sliderHiddenInput.value = "0";
    sliderEl.parentNode.insertBefore(sliderHiddenInput, sliderEl.nextSibling);
  }

  const POLL_INTERVAL = 100;
  const POLL_LIMIT = 50;

  let sliderPollCount = 0;
  const sliderPoll = setInterval(() => {
    if (!sliderEl?.noUiSlider) {
      if (++sliderPollCount >= POLL_LIMIT) clearInterval(sliderPoll);
      return;
    }
    clearInterval(sliderPoll);
    sliderEl.noUiSlider.on("update", (values) => {
      const val = Math.round(parseFloat(values[0]));
      if (discountLabel) discountLabel.textContent = val;
      if (sliderHiddenInput) sliderHiddenInput.value = val;
    });
  }, POLL_INTERVAL);

  // Discount radio toggle
  const discountPercentagePanel = document.getElementById(
    "kt_ecommerce_add_product_discount_percentage"
  );
  const discountFixedPanel = document.getElementById("kt_ecommerce_add_product_discount_fixed");

  document.querySelectorAll('input[name="discount_option"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      switch (this.value) {
        case "percentage":
          discountPercentagePanel?.classList.remove("d-none");
          discountFixedPanel?.classList.add("d-none");
          break;
        case "fixed":
          discountPercentagePanel?.classList.add("d-none");
          discountFixedPanel?.classList.remove("d-none");
          break;
        default:
          discountPercentagePanel?.classList.add("d-none");
          discountFixedPanel?.classList.add("d-none");
      }
    });
  });

  const dzEl = document.getElementById("kt_ecommerce_add_product_media");
  if (dzEl) {
    dropzoneInstance = new Dropzone(dzEl, {
      url: "/",
      paramName: "media_images",
      maxFiles: 10,
      maxFilesize: 10,
      acceptedFiles: "image/jpeg,image/png,image/webp,image/gif",
      addRemoveLinks: true,
      autoProcessQueue: false,
      autoDiscover: false,
    });
  }

  const hiddenDescField = document.getElementById("hidden_product_description");
  let quillPollCount = 0;
  const quillPoll = setInterval(() => {
    const editorEl = document.querySelector("#kt_ecommerce_add_product_description");
    if (!editorEl) return;
    const quill = Quill.find(editorEl);
    if (!quill) {
      if (++quillPollCount >= POLL_LIMIT) clearInterval(quillPoll);
      return;
    }
    clearInterval(quillPoll);
    if (hiddenDescField) {
      hiddenDescField.value = quill.root.innerHTML.trim();
      quill.on("text-change", () => {
        hiddenDescField.value = quill.root.innerHTML.trim();
      });
    }
  }, POLL_INTERVAL);

  // ====================== IMPROVED SUBMIT HANDLER (with SweetAlert + Loading) ======================
  const form = document.getElementById("kt_ecommerce_add_product_form");
  const submitBtn = document.getElementById("kt_ecommerce_add_product_submit");
  const tagsInput = document.getElementById("kt_ecommerce_add_product_tags");

  console.log("✅ Reached submit listener attachment");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    console.log("✅ Submit button clicked");

    const errors = [];

    // ─── Required text/select/number fields ────────────────────────────────
    const requiredChecks = [
      {
        field: form.querySelector('[name="name"]'),
        label: "Product Name",
        rule: (val) => val.trim() !== "",
      },
      {
        field: form.querySelector('[name="price"]'),
        label: "Base Price",
        rule: (val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
      },
      {
        field: form.querySelector('[name="status"]'),
        label: "Status",
        rule: (val) => val !== "",
      },
      {
        field: form.querySelector('[name="categories"]'),
        label: "At least one Category",
        rule: () => {
          const selected = Array.from(
            form.querySelectorAll('[name="categories"] option:checked')
          ).length;
          return selected > 0;
        },
      },
    ];

    requiredChecks.forEach((check) => {
      if (!check.field) return; // skip if no field is found

      let isValid;

      if (check.label === "At least one Category") {
        isValid = check.rule();
      } else {
        const value = check.field.value?.trim() || "";
        isValid = check.rule(value);
      }

      if (!isValid) {
        errors.push(check.label);
        check.field.classList.add("is-invalid");
        // Focus first invalid field
        if (errors.length === 1) check.field.focus();
      } else {
        check.field.classList.remove("is-invalid");
      }
    });

    // ─── Thumbnail (file input) ────────────────────────────────────────────
    const thumbnailInput = form.querySelector('input[name="avatar"]');
    const imageWrapper = form.querySelector(".image-input");
    const dropzoneEl = document.getElementById("kt_ecommerce_add_product_media");

    if (!thumbnailInput?.files?.length) {
      errors.push("Thumbnail Image (main preview)");
      if (imageWrapper) imageWrapper.classList.add("border-danger");
    } else {
      if (imageWrapper) imageWrapper.classList.remove("border-danger");
    }

    // ─── Optional: At least one gallery image (Dropzone) ───────────────────
    if (dropzoneInstance && dropzoneInstance.getAcceptedFiles().length === 0) {
      errors.push("At least one gallery image");
      if (dropzoneEl) dropzoneEl.classList.add("border-danger");
    } else {
      if (dropzoneEl) dropzoneEl.classList.remove("border-danger");
    }

    // ─── Variations (strict: size + color + stock > 0) ─────────────────────
    const variationRows = form.querySelectorAll("[data-repeater-item]");
    let hasValidVariation = false;

    variationRows.forEach((row) => {
      const size = row.querySelector('[name$="[size]"]')?.value?.trim();
      const color = row.querySelector('[name$="[color]"]')?.value?.trim();
      const stock = Number(row.querySelector('[name$="[stock]"]')?.value) || 0;

      // Require size and color + positive stock
      if (size && color && stock > 0) {
        hasValidVariation = true;
      }
    });

    if (variationRows.length > 0 && !hasValidVariation) {
      errors.push("At least one complete variation (size + color with stock > 0)");
    }

    // ─── Optional: Description length (if you want it required) ─────────────
    const descriptionHidden = form.querySelector("#hidden_product_description");
    const plainText = descriptionHidden.value.replace(/<[^>]*>/g, "").trim();

    if (plainText.length < 20) {
      errors.push("Description (at least 20 characters)");
      const editorEl = document.querySelector("#kt_ecommerce_add_product_description");
      if (editorEl) editorEl.classList.add("border-danger");
    } else {
      const editorEl = document.querySelector("#kt_ecommerce_add_product_description");
      if (editorEl) editorEl.classList.remove("border-danger");
    }

    console.log("Validation errors:", errors);

    // ─── Show all errors in one alert ──────────────────────────────────────
    if (errors.length > 0) {
      await Swal.fire({
        icon: "error",
        title: "Missing or invalid fields",
        text: "Please make sure all required fields are filled out.",
        confirmButtonText: "Okay, got it",
        allowOutsideClick: false,
        customClass: {
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      });
      return;
    }

    // ─── Proceed with loading & fetch ──────────────────────────────────────
    const label = submitBtn.querySelector(".indicator-label");
    const progress = submitBtn.querySelector(".indicator-progress");
    if (label) label.style.display = "none";
    if (progress) progress.style.display = "inline-block";
    submitBtn.disabled = true;

    try {
      // Create the FormData first
      const formData = new FormData(form);

      if (tagsInput?.value) {
        try {
          const parsed = JSON.parse(tagsInput.value);

          if (Array.isArray(parsed)) {
            const cleanTags = parsed.map((t) => t.value).join(",");

            formData.set("kt_ecommerce_add_product_tags", cleanTags);
          }
        } catch (e) {
          console.error("Tagify parsing failed:", e);
        }
      }

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      if (csrfToken) formData.append("_csrf", csrfToken);

      if (dropzoneInstance) {
        dropzoneInstance.getAcceptedFiles().forEach((file) => {
          formData.append("media_images", file, file.name);
        });
      }

      console.log("🚀 About to fetch to:", form.action);

      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      console.log("✅ Fetch response received", res.status, res.redirected, res.url);

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (data.success !== false) {
        await Swal.fire({
          icon: "success",
          title: "Product saved successfully!",
          text: data.message || "Redirecting...",
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        window.location.href = data.redirect || "/admin/products";
      } else {
        throw new Error(data.message || "Save failed");
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.message || "Please try again.",
        confirmButtonText: "Try again",
      });
    } finally {
      if (label) label.style.display = "inline-block";
      if (progress) progress.style.display = "none";
      submitBtn.disabled = false;
    }
  });
});
