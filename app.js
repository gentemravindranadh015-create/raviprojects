const $ = (id) => document.getElementById(id);
const money = (value) => "₹" + Number(value || 0).toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
function showNotice(message, type = "success") {
  const el = $("notice");
  if (!el) { alert(message); return; }
  el.textContent = message; el.className = `notice show ${type}`;
}
function productRow(p) {
  const low = Number(p.quantity) <= Number(p.reorder_level);
  return `<tr>
    <td><div class="product-name">${escapeHtml(p.product_name)}</div><div class="product-id">ID: ${p.product_id}</div></td>
    <td><span class="category">${escapeHtml(p.category)}</span></td>
    <td><strong>${money(p.price)}</strong></td>
    <td><span class="stock ${low ? "low" : "good"}">${p.quantity} units</span></td>
    <td>${p.reorder_level} units</td>
    <td><div class="actions"><button class="icon-btn" title="Edit" onclick="location.href='update.html?id=${p.product_id}'">✎</button><button class="icon-btn" title="Delete" onclick="deleteProduct(${p.product_id})">⌫</button></div></td>
  </tr>`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
async function loadDashboard() {
  try {
    const products = await api("/api/products");
    const totalUnits = products.reduce((sum, p) => sum + Number(p.quantity), 0);
    const low = products.filter(p => Number(p.quantity) <= Number(p.reorder_level));
    const value = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);
    if ($("stat-products")) $("stat-products").textContent = products.length;
    if ($("stat-units")) $("stat-units").textContent = totalUnits.toLocaleString("en-IN");
    if ($("stat-low")) $("stat-low").textContent = low.length;
    if ($("stat-value")) $("stat-value").textContent = money(value);
    if ($("recent-products")) $("recent-products").innerHTML = products.slice(0, 5).map(productRow).join("") || `<tr><td colspan="6" class="empty">No products yet. Add your first product.</td></tr>`;
    if ($("low-count")) $("low-count").textContent = low.length;
  } catch (e) { showNotice("Could not load products. Check server and MySQL connection. " + e.message, "error"); }
}
async function loadProducts() {
  const tbody = $("product-rows"); if (!tbody) return;
  try {
    const products = await api("/api/products");
    const draw = (list) => tbody.innerHTML = list.map(productRow).join("") || `<tr><td colspan="6" class="empty">No matching products found.</td></tr>`;
    draw(products);
    const applyFilters = () => {
      const term = ($("product-search")?.value || "").toLowerCase();
      const category = $("category-filter")?.value || "";
      draw(products.filter(p =>
        (!category || p.category === category) &&
        [p.product_name, p.category, String(p.product_id)].some(v => String(v).toLowerCase().includes(term))
      ));
    };
    if ($("product-search")) $("product-search").addEventListener("input", applyFilters);
    if ($("category-filter")) $("category-filter").addEventListener("change", applyFilters);
  } catch (e) { tbody.innerHTML = `<tr><td colspan="6" class="empty">Unable to load products: ${escapeHtml(e.message)}</td></tr>`; }
}
async function saveProduct(event) {
  event.preventDefault();
  const form = $("product-form");
  const payload = {
    product_id: Number($("product_id").value),
    product_name: $("product_name").value.trim(),
    category: $("category").value.trim(),
    price: Number($("price").value),
    quantity: Number($("quantity").value),
    reorder_level: Number($("reorder_level").value)
  };
  const isUpdatePage = location.pathname.toLowerCase().endsWith("update.html");
  const id = isUpdatePage ? String(payload.product_id) : new URLSearchParams(location.search).get("id");
  try {
    const result = await api(id && isUpdatePage ? `/api/products/${encodeURIComponent(id)}` : (id ? `/api/products/${encodeURIComponent(id)}` : "/api/products"), { method: id && isUpdatePage ? "PUT" : (id ? "PUT" : "POST"), body: JSON.stringify(payload) });
    showNotice(id && isUpdatePage ? "Product updated successfully!" : (id ? "Product updated successfully!" : "Product added successfully!"));
    setTimeout(() => location.href = "list.html", 650);
  } catch (e) { showNotice(e.message, "error"); }
}
async function populateProductIdDropdown(selectId, selectedId = "") {
  const select = $(selectId);
  if (!select) return [];
  try {
    const products = await api("/api/products");
    select.innerHTML = '<option value="">Select a product ID</option>' + products.map(p =>
      `<option value="${Number(p.product_id)}">${Number(p.product_id)} — ${escapeHtml(p.product_name)}</option>`
    ).join("");
    if (selectedId && products.some(p => String(p.product_id) === String(selectedId))) select.value = String(selectedId);
    if (!products.length) select.innerHTML = '<option value="">No products found in database</option>';
    return products;
  } catch (e) {
    select.innerHTML = '<option value="">Could not load product IDs</option>';
    showNotice("Could not load product IDs from database. " + e.message, "error");
    return [];
  }
}
async function fillProductForm(id) {
  if (!id) return;
  try {
    const rows = await api(`/api/products/${encodeURIComponent(id)}`);
    if (!rows.length) return showNotice("Product ID not found.", "error");
    const p = rows[0];
    ["product_id","product_name","category","price","quantity","reorder_level"].forEach(k => { if ($(k)) $(k).value = p[k] ?? ""; });
    if ($("product_id")) $("product_id").value = String(p.product_id);
    if ($("form-heading")) $("form-heading").textContent = "Update product details";
    if ($("form-description")) $("form-description").textContent = "The selected product details were loaded from your database.";
    if ($("submit-btn")) $("submit-btn").textContent = "Save Changes";
  } catch (e) { showNotice(e.message, "error"); }
}
async function loadProductForEdit() {
  const selectedId = new URLSearchParams(location.search).get("id") || "";
  await populateProductIdDropdown("product_id", selectedId);
  if ($("product_id")) {
    $("product_id").addEventListener("change", () => fillProductForm($("product_id").value));
    if (selectedId) await fillProductForm(selectedId);
  }
}

async function searchProduct() {
  const id = $("search-id").value.trim();
  if (!id) return showNotice("Enter a product ID first.", "error");
  try {
    const rows = await api(`/api/products/${encodeURIComponent(id)}`);
    const target = $("search-result");
    if (!rows.length) { target.innerHTML = `<div class="empty">No product found with ID ${escapeHtml(id)}.</div>`; return; }
    const p = rows[0];
    target.innerHTML = `<div class="result-card"><div class="section-head"><div><h2>${escapeHtml(p.product_name)}</h2><p>Product ID: ${p.product_id}</p></div><span class="category">${escapeHtml(p.category)}</span></div><div class="result-grid"><div class="result-item"><small>Price</small><strong>${money(p.price)}</strong></div><div class="result-item"><small>Quantity</small><strong>${p.quantity} units</strong></div><div class="result-item"><small>Reorder level</small><strong>${p.reorder_level} units</strong></div></div><div class="form-actions"><a class="btn btn-primary" href="update.html?id=${p.product_id}">✎ Edit product</a><button class="btn btn-danger" onclick="deleteProduct(${p.product_id})">⌫ Delete product</button></div></div>`;
  } catch (e) { showNotice(e.message, "error"); }
}
async function deleteProduct(idFromButton) {
  const id = idFromButton ?? ($("delete-id") && $("delete-id").value.trim());
  if (!id) return showNotice("Enter a product ID first.", "error");
  if (!confirm(`Delete product ${id}? This cannot be undone.`)) return;
  try {
    const result = await api(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if ($("delete-result")) showNotice(result.message); else alert(result.message);
    if ($("delete-id")) $("delete-id").value = "";
    if ($("product-rows")) loadProducts();
    if ($("recent-products")) loadDashboard();
    if ($("search-result")) $("search-result").innerHTML = "";
  } catch (e) { showNotice(e.message, "error"); }
}
document.addEventListener("DOMContentLoaded", () => {
  if ($("stat-products")) loadDashboard();
  if ($("product-rows")) loadProducts();
  if ($("product-form")) { $("product-form").addEventListener("submit", saveProduct); loadProductForEdit(); }
  if ($("delete-id")) populateProductIdDropdown("delete-id");
  if ($("search-id")) populateProductIdDropdown("search-id");
});
