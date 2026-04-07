// public/js/custom/products/listing.js

document.addEventListener("DOMContentLoaded", function () {
  const productTable = document.getElementById("productTable");

  // Initialize DataTables with vanilla JS
  const dataTable = new DataTable(productTable, {
    info: true,
    ajax: {
      url: "/admin/api/products",
      dataSrc: "products",
    },

    deferRender: true,

    serverSide: false,

    searching: true,
    paging: true,
    pagingType: "full_numbers",
    ordering: true,
    order: [],
    columnDefs: [{ targets: [0, 6], orderable: false }],
    lengthMenu: [10, 25, 50, 100],
    pageLength: 100,
    language: {
      emptyTable:
        '<div style="text-align: center; font-weight: 600; font-size: 1.1rem; padding: 2rem;">No products yet.</div>',
      zeroRecords:
        '<div style="text-align: center; font-weight: 600; font-size: 1.1rem; padding: 2rem;">No matching products found.</div>',
    },
    columns: [
      { data: "checkbox" },
      { data: "name" },
      { data: "categories" },
      { data: "quantity" },
      { data: "price" },
      { data: "status" },
      { data: "actions" },
    ],
  });

  // Search Input Handler (using vanilla JS)
  const searchInput = document.getElementById("searchProduct");
  let timeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      dataTable.search(this.value).draw();
    }, 300); // 300ms delay
  });

  // Status Filter Change Handler
  const statusFilter = document.getElementById("statusFilter");
  statusFilter.addEventListener("change", function () {
    dataTable.draw();
  });

  // Select All Checkboxes
  const selectAllCheckbox = document.getElementById("selectAll");
  selectAllCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    const checkboxes = document.querySelectorAll(".product-checkbox");
    checkboxes.forEach((checkbox) => (checkbox.checked = isChecked));
  });
});
