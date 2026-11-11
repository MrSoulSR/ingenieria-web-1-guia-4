const TABLES_KEY = "restaurapp-tables";
const ORDERS_KEY = "restaurapp-orders";
const START_ACTIVE_ORDERS = 3;
const START_SALES = 256000;

const menuButton = document.getElementById("menuToggle");
const menu = document.getElementById("mainNav");
const toast = document.getElementById("toast");

function formatPrice(value) {
  return "$" + value.toLocaleString("es-CO");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2500);
}

function getTables() {
  const saved = localStorage.getItem(TABLES_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  return { 1: true, 2: true, 3: false, 4: false, 5: true, 6: false, 7: true, 8: false };
}

function saveTables(tables) {
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
}

function getOrders() {
  const saved = localStorage.getItem(ORDERS_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  return [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

menuButton.addEventListener("click", function () {
  menu.classList.toggle("is-open");

  if (menu.classList.contains("is-open")) {
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú");
  } else {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  }
});

const statFree = document.getElementById("statFree");

if (statFree) {
  showHomeStats();
}

function showHomeStats() {
  const tables = getTables();
  const orders = getOrders();

  let freeTables = 0;
  let occupiedTables = 0;

  for (const number in tables) {
    if (tables[number]) {
      occupiedTables++;
    } else {
      freeTables++;
    }
  }

  let sales = START_SALES;

  for (let i = 0; i < orders.length; i++) {
    sales = sales + orders[i].total;
  }

  statFree.textContent = freeTables;
  document.getElementById("statOccupied").textContent = occupiedTables;
  document.getElementById("statOrders").textContent = START_ACTIVE_ORDERS + orders.length;
  document.getElementById("statSales").textContent = formatPrice(sales);
}

const tableCards = document.querySelectorAll(".table-card");

if (tableCards.length > 0) {
  setupTables();
}

function paintTable(card, isOccupied) {
  const state = card.querySelector(".table-card__state");

  if (isOccupied) {
    card.classList.add("is-occupied");
    state.textContent = "Ocupada";
  } else {
    card.classList.remove("is-occupied");
    state.textContent = "Libre";
  }
}

function setupTables() {
  const tables = getTables();

  for (let i = 0; i < tableCards.length; i++) {
    const card = tableCards[i];
    const number = card.dataset.table;

    paintTable(card, tables[number]);

    card.addEventListener("click", function () {
      tables[number] = !tables[number];
      saveTables(tables);
      paintTable(card, tables[number]);

      if (tables[number]) {
        showToast("Mesa " + number + " ahora está ocupada");
      } else {
        showToast("Mesa " + number + " ahora está libre");
      }
    });
  }
}

const ordersList = document.getElementById("ordersList");

if (ordersList) {
  showSavedOrders();
}

function createOrderElement(order) {
  let itemsHtml = "";

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    itemsHtml += "<li><span>" + item.quantity + " x " + item.name + "</span><span>" + formatPrice(item.quantity * item.price) + "</span></li>";
  }

  const element = document.createElement("details");
  element.className = "order";
  element.dataset.status = order.status;
  element.innerHTML =
    '<summary class="order__summary">' +
    '<span class="order__id">#' + order.id + "</span>" +
    '<span class="order__table">Mesa ' + order.table + "</span>" +
    '<span class="badge badge--preparing">Preparando</span>' +
    '<span class="order__total">' + formatPrice(order.total) + "</span>" +
    "</summary>" +
    '<ul class="order__items">' + itemsHtml + "</ul>";

  if (order.note !== "") {
    const noteItem = document.createElement("li");
    noteItem.className = "order__note";
    noteItem.textContent = "Nota: " + order.note;
    element.querySelector(".order__items").appendChild(noteItem);
  }

  return element;
}

function showSavedOrders() {
  const orders = getOrders();

  for (let i = 0; i < orders.length; i++) {
    ordersList.prepend(createOrderElement(orders[i]));
  }
}

const filterButtons = document.querySelectorAll(".filter");

for (let i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener("click", function () {
    filterOrders(filterButtons[i]);
  });
}

function filterOrders(selectedButton) {
  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].classList.remove("is-active");
  }
  selectedButton.classList.add("is-active");

  const status = selectedButton.dataset.filter;
  const orders = document.querySelectorAll(".order");

  for (let i = 0; i < orders.length; i++) {
    if (status === "all" || orders[i].dataset.status === status) {
      orders[i].classList.remove("is-hidden");
    } else {
      orders[i].classList.add("is-hidden");
    }
  }
}

const orderForm = document.getElementById("orderForm");
const tableSelect = document.getElementById("table");
const itemsGroup = document.getElementById("itemsGroup");
const quantityInputs = document.querySelectorAll(".item__qty");
const orderTotal = document.getElementById("orderTotal");
const formMessage = document.getElementById("formSuccess");

if (orderForm) {
  setupOrderForm();
}

function getSelectedItems() {
  const items = [];

  for (let i = 0; i < quantityInputs.length; i++) {
    const input = quantityInputs[i];
    const quantity = Number(input.value);

    if (quantity > 0) {
      items.push({
        name: input.dataset.name,
        price: Number(input.dataset.price),
        quantity: quantity,
      });
    }
  }

  return items;
}

function getTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
  }

  return total;
}

function updateTotal() {
  const items = getSelectedItems();
  orderTotal.textContent = formatPrice(getTotal(items));
}

function setError(group, message) {
  group.querySelector(".form__error").textContent = message;

  if (message === "") {
    group.classList.remove("has-error");
  } else {
    group.classList.add("has-error");
  }
}

function validateTable() {
  const group = tableSelect.closest(".form__group");

  if (tableSelect.value === "") {
    setError(group, "Selecciona una mesa");
    return false;
  }

  setError(group, "");
  return true;
}

function validateItems() {
  for (let i = 0; i < quantityInputs.length; i++) {
    const quantity = Number(quantityInputs[i].value);

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) {
      setError(itemsGroup, "Las cantidades deben ser números enteros entre 0 y 20");
      return false;
    }
  }

  if (getSelectedItems().length === 0) {
    setError(itemsGroup, "Agrega al menos un producto");
    return false;
  }

  setError(itemsGroup, "");
  return true;
}

function selectDishFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const dish = params.get("dish");

  if (dish) {
    const input = document.getElementById("qty-" + dish);

    if (input) {
      input.value = 1;
    }
  }
}

function saveOrder() {
  const orders = getOrders();
  const items = getSelectedItems();

  const order = {
    id: 105 + orders.length,
    table: tableSelect.value,
    items: items,
    note: document.getElementById("note").value.trim(),
    total: getTotal(items),
    status: "preparing",
  };

  orders.push(order);
  saveOrders(orders);

  const tables = getTables();
  tables[order.table] = true;
  saveTables(tables);

  return order;
}

function setupOrderForm() {
  selectDishFromUrl();
  updateTotal();

  tableSelect.addEventListener("change", validateTable);

  for (let i = 0; i < quantityInputs.length; i++) {
    quantityInputs[i].addEventListener("input", function () {
      updateTotal();
      validateItems();
    });
  }

  orderForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const isTableValid = validateTable();
    const areItemsValid = validateItems();

    if (!isTableValid || !areItemsValid) {
      formMessage.textContent = "";
      return;
    }

    const order = saveOrder();

    formMessage.innerHTML =
      "Orden #" + order.id + " registrada para la mesa " + order.table + " por " + formatPrice(order.total) +
      '. <a href="ordenes.html">Ver órdenes</a>';

    orderForm.reset();
    updateTotal();
  });
}
