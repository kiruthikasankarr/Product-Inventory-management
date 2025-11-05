const productTableBody = document.querySelector("#productTable tbody");
const productForm = document.querySelector("#productForm");
const productModal = new bootstrap.Modal(document.querySelector("#productModal"));
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const exportBtn = document.getElementById("exportCSV");

let products = JSON.parse(localStorage.getItem("products")) || [];

function renderTable() {
  productTableBody.innerHTML = "";
  const filtered = filterProducts();

  filtered.forEach((p, index) => {
    const stockClass = p.quantity < 10 ? "text-danger fw-bold" : "text-success fw-bold";
    const stockText = p.quantity < 10 ? "Low Stock" : "In Stock";

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${p.manualId}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.quantity}</td>
        <td>₹${p.price.toFixed(2)}</td>
        <td class="${stockClass}">${stockText}</td>
        <td>
          <button class="btn btn-warning btn-sm me-2" onclick="editProduct(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`;
    productTableBody.insertAdjacentHTML("beforeend", row);
  });
  updateSummary();
}

function updateSummary(){
  const totalProducts = products.length;
  let lowStock = 0;
  let totalValue = 0;
  for (const p of products) {
    if (p.quantity < 10) lowStock++;
    totalValue += p.price * p.quantity;
  }
  document.getElementById("total-products").textContent = totalProducts;
  document.getElementById("low-stock").textContent = lowStock;
  document.getElementById("total-value").textContent = `₹${totalValue.toFixed(2)}`;
}

function filterProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  return products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
}

productForm.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("productIdHidden").value;
  const manualId = document.getElementById("manualProductId").value.trim();
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("category").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("unitPrice").value);

  if (!manualId || !name || quantity < 0 || price < 0) {
    alert("Please fill all fields correctly!");
    return;
  }

  var duplicate = products.find(function(p) {
    return p.manualId.toLowerCase() === manualId.toLowerCase() && p.id != id;
  });
  
  if (duplicate) {
    alert("Product ID already exists!");
    return;
  }
  
  if (id) {
    var product = products.find(function(p) {
      return p.id == id;
    });
    product.manualId = manualId;
    product.name = name;
    product.category = category;
    product.quantity = quantity;
    product.price = price;
  } else {
    products.push({ id: Date.now(), manualId: manualId, name: name, category: category, quantity: quantity, price: price });
  }

  localStorage.setItem("products", JSON.stringify(products));
  productForm.reset();
  productModal.hide();
  updateCategoryFilter();
  renderTable();
});

function editProduct(id) {
  const p = products.find(p => p.id == id);
  document.getElementById("productIdHidden").value = p.id;
  document.getElementById("manualProductId").value = p.manualId;
  document.getElementById("productName").value = p.name;
  document.getElementById("category").value = p.category;
  document.getElementById("quantity").value = p.quantity;
  document.getElementById("unitPrice").value = p.price;
  productModal.show();
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    updateCategoryFilter();
    renderTable();
  }
}

function updateCategoryFilter() {
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    if (cat) categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

exportBtn.addEventListener("click", () => {
  if (products.length === 0) {
    alert("No products to export!");
    return;
  }

  const csvRows = [
    ["Product ID", "Product Name", "Category", "Quantity", "Unit Price"],
    ...products.map(p => [p.manualId, p.name, p.category, p.quantity, p.price])
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(r => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "product_inventory.csv";
  link.click();
});

document.getElementById("reportBtn").addEventListener("click", () => {
  window.location.href = "report.html";
});

searchInput.addEventListener("input", renderTable);
categoryFilter.addEventListener("change", renderTable);

updateCategoryFilter();
renderTable();