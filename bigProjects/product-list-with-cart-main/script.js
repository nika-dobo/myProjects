document.addEventListener("DOMContentLoaded", function () {
  const boxes = document.querySelectorAll(".main .box");
  const cartEmpty = document.getElementById("cart-empty");
  const cartFilled = document.getElementById("cart-filled");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const orderTotalPriceEl = document.getElementById("order-total-price");
  const confirmOrderBtn = document.getElementById("confirm-order-btn");
  const orderModal = document.getElementById("order-modal");
  const modalItemsContainer = document.getElementById("modal-items");
  const modalTotalPriceEl = document.getElementById("modal-total-price");
  const startNewOrderBtn = document.getElementById("start-new-order-btn");

  // State: { [productName]: { name, price, quantity, thumbnail, boxIndex } }
  let cart = {};

  boxes.forEach((box, index) => {
    const mainImg = box.querySelector(".main-img");
    const addCartBtn = box.querySelector(".add-to-cart");
    const addSection = box.querySelector(".add");
    const addedSection = box.querySelector(".added");
    const countP = box.querySelector(".count");
    const plusBtn = box.querySelector(".plus");
    const minusBtn = box.querySelector(".minus");
    const title = box.querySelector("h3").textContent.trim();
    const priceText = box.querySelector("h4").textContent.trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const imgSrc = mainImg.getAttribute("src");
    const thumbSrc = imgSrc.replace("desktop.jpg", "thumbnail.jpg");

    // Click Add To Cart
    addCartBtn.addEventListener("click", function (e) {
      if (!cart[title] || cart[title].quantity === 0) {
        cart[title] = {
          name: title,
          price: price,
          quantity: 1,
          thumbnail: thumbSrc,
          boxIndex: index
        };
        updateCardUI(index, 1);
        renderCart();
      }
    });

    // Click Plus
    plusBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!cart[title]) {
        cart[title] = { name: title, price: price, quantity: 1, thumbnail: thumbSrc, boxIndex: index };
      } else {
        cart[title].quantity++;
      }
      updateCardUI(index, cart[title].quantity);
      renderCart();
    });

    // Click Minus
    minusBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (cart[title]) {
        cart[title].quantity--;
        if (cart[title].quantity <= 0) {
          delete cart[title];
          updateCardUI(index, 0);
        } else {
          updateCardUI(index, cart[title].quantity);
        }
        renderCart();
      }
    });
  });

  function updateCardUI(boxIndex, qty) {
    const box = boxes[boxIndex];
    if (!box) return;
    const mainImg = box.querySelector(".main-img");
    const addCartBtn = box.querySelector(".add-to-cart");
    const addSection = box.querySelector(".add");
    const addedSection = box.querySelector(".added");
    const countP = box.querySelector(".count");

    if (qty > 0) {
      mainImg.style.border = "2px solid #c83b0e";
      addCartBtn.style.backgroundColor = "#c83b0e";
      addCartBtn.style.borderColor = "#c83b0e";
      addSection.style.display = "none";
      addedSection.style.display = "flex";
      countP.textContent = qty;
    } else {
      mainImg.style.border = "none";
      addCartBtn.style.backgroundColor = "white";
      addCartBtn.style.borderColor = "#ad8985";
      addSection.style.display = "flex";
      addedSection.style.display = "none";
      countP.textContent = "";
    }
  }

  function renderCart() {
    const items = Object.values(cart);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    cartCountEl.textContent = totalQty;

    if (totalQty === 0) {
      cartEmpty.style.display = "flex";
      cartFilled.style.display = "none";
      return;
    }

    cartEmpty.style.display = "none";
    cartFilled.style.display = "block";
    cartItemsContainer.innerHTML = "";

    items.forEach((item) => {
      const itemRow = document.createElement("div");
      itemRow.className = "cart-item";
      itemRow.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-pricing">
            <span class="cart-item-qty">${item.quantity}x</span>
            <span class="cart-item-unit">@ $${item.price.toFixed(2)}</span>
            <span class="cart-item-total">$${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        </div>
        <button class="cart-remove-btn" type="button" aria-label="Remove item" data-title="${item.name}">
          <img src="assets/images/icon-remove-item.svg" alt="Remove" />
        </button>
      `;

      itemRow.querySelector(".cart-remove-btn").addEventListener("click", function () {
        const itemTitle = this.getAttribute("data-title");
        if (cart[itemTitle]) {
          const bIndex = cart[itemTitle].boxIndex;
          delete cart[itemTitle];
          updateCardUI(bIndex, 0);
          renderCart();
        }
      });

      cartItemsContainer.appendChild(itemRow);
    });

    orderTotalPriceEl.textContent = `$${grandTotal.toFixed(2)}`;
  }

  // Confirm Order Modal
  confirmOrderBtn.addEventListener("click", function () {
    const items = Object.values(cart);
    if (items.length === 0) return;

    modalItemsContainer.innerHTML = "";
    const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "modal-item-row";
      row.innerHTML = `
        <div class="modal-item-left">
          <img src="${item.thumbnail}" alt="${item.name}" class="modal-item-thumb" />
          <div class="modal-item-details">
            <div class="modal-item-name">${item.name}</div>
            <div class="modal-item-pricing">
              <span class="modal-item-qty">${item.quantity}x</span>
              <span class="modal-item-unit">@ $${item.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div class="modal-item-total">$${(item.quantity * item.price).toFixed(2)}</div>
      `;
      modalItemsContainer.appendChild(row);
    });

    modalTotalPriceEl.textContent = `$${grandTotal.toFixed(2)}`;
    orderModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Start New Order (Reset)
  startNewOrderBtn.addEventListener("click", function () {
    Object.values(cart).forEach((item) => {
      updateCardUI(item.boxIndex, 0);
    });
    cart = {};
    renderCart();
    orderModal.style.display = "none";
    document.body.style.overflow = "auto";
  });
});
