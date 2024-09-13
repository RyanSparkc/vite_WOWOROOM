console.clear();
import axios from 'axios';


const baseUrl = 'https://livejs-api.hexschool.io/api/livejs/v1';
const api_path = 'ryanc3';
const form = document.querySelector('.orderInfo-form');
let productData = [];
let cartData = [];

//工具
const formatNum = (num) => num.toLocaleString('en-IN');

function getProduct() {
  axios
    .get(`${baseUrl}/customer/${api_path}/products`)
    .then((res) => {
      productData = res.data.products;
      // console.log(res.data.products);
      renderProduct(productData);
    })
    .then((err) => {
      console.log(err);
    });
}

const productWrap = document.querySelector('.productWrap');
function renderProduct(data) {
  let productData = data.map((product) => {
    const { images, title, origin_price, price, id } = product;
    return `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${images}" alt="">
        <a href="#" class="addCardBtn" data-id="${id}">加入購物車</a>
        <h3>${title}</h3>
        <del class="originPrice">NT$${origin_price}</del>
        <p class="nowPrice">NT$${price}</p>
      </li>
    `;
  });
  productWrap.innerHTML = productData.join('');
}

// 加入購物車列表
productWrap.addEventListener('click', (e) => {
  e.preventDefault();
  let addCartBtn = e.target.getAttribute('class');
  // console.log(addCartBtn)
  if (addCartBtn !== 'addCardBtn') {
    return;
  }

  let productId = e.target.dataset.id;
  addCartItem(productId);
});

// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      // console.log("cartlists", response.data.carts);
      cartData = response.data.carts;
      renderCart(cartData);
    });
}

const shoppingCarTtable = document.querySelector('.shoppingCart-table');
function renderCart(data) {
  if (data.length == 0) {
    shoppingCarTtable.innerHTML = `<tr><td>購物車裡面目前沒有東西</td></tr>`;
    return;
  }

  let shoppingCartList = '';
  shoppingCartList += `<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>`;
  let total = 0;
  // console.log('renderCart', data)
  data.forEach((cartItem) => {
    const { id, quantity } = cartItem;
    const { images, title, price } = cartItem.product;
    total += price * quantity;
    shoppingCartList += `
       <tr>
          <td>
              <div class="cardItem-title">
                  <img src="${images}" alt="">
                  <p>${title}</p>
              </div>
          </td>
          <td>NT$${price}</td>
          <td>${quantity}</td>
          <td>NT$${formatNum(price * quantity)}</td>
          <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${cartItem.id}">
                  clear
              </a>
          </td>
      </tr>
    `;
  });

  // 添加總計行
  shoppingCartList += `
    <tr>
        <td>
            <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td><p>總金額</p></td>
        <td>NT$${formatNum(total)}</td>
    </tr>
  `;
  // console.log('cartdata116', data.length)
  shoppingCarTtable.innerHTML = shoppingCartList;
}

// 新增商品到購物車
function addCartItem(id) {
  let productNum = 1;
  cartData.forEach((cartItem) => {
    if (cartItem.product.id === id) {
      productNum = cartItem.quantity += 1;
    }
  });
  axios
    .post(`${baseUrl}/customer/${api_path}/carts`, {
      data: {
        productId: id,
        quantity: productNum,
      },
    })
    .then(function (response) {
      console.log(response.data);
      alert('加入購物車成功');
      getCartList();
    })
    .catch(function (error) {
      console.log(error);
    });
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios
    .delete(`${baseUrl}/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      alert('刪除單筆購物車成功！');
      getCartList();
    });
}

// 清除購物車內全部產品
function deleteAllCartList() {
  axios
    .delete(`${baseUrl}/customer/${api_path}/carts`)
    .then(function (response) {
      alert('刪除全部購物車成功！');
      getCartList();
    })
    .catch(function (response) {
      alert('購物車已清空！');
    });
}

// 刪除購物車內特定產品
shoppingCarTtable.addEventListener('click', function (e) {
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  // 刪除特定品項
  if (cartId) {
    deleteCartItem(cartId);
    return;
  }

  // 刪除所有品項
  if (e.target.classList.contains('discardAllBtn')) {
    deleteAllCartList();
  }
});

// 新增訂單
function addOrder() {
  // 檢查購物車是否為空
  if (cartData.length === 0) {
    alert('購物車內沒有商品，請先添加商品！');
    return; // 阻止進一步執行
  }
  let data = {
    data: {
      user: {
        name: document.querySelector('#customerName').value.trim(),
        tel: document.querySelector('#customerPhone').value.trim(),
        email: document.querySelector('#customerEmail').value.trim(),
        address: document.querySelector('#customerAddress').value.trim(),
        payment: document.querySelector('#tradeWay').value.trim(),
      },
    },
  };

  axios
    .post(`${baseUrl}/customer/${api_path}/orders`, data)
    .then(function (res) {
      // 顯示訂單結果
      console.log('addOrder', res.data);
      data = {};
      form.reset();
      getCartList();
      alert('送出訂單成功!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

// 商品篩選功能
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', selectFilter);
function selectFilter(e) {
  let category = e.target.value;
  if (category === '全部') {
    renderProduct(productData);
    return;
  }
  let targetProducts = [];
  productData.forEach(function (item) {
    if (item.category === category) {
      targetProducts.push(item);
    }
  });
  renderProduct(targetProducts);
}

// 篩選 select 欄位
function getCategories() {
  let unSort = productData.map(function (item) {
    return item.category;
  });
  console.log(unSort);
  let sorted = unSort.filter(function (item, i) {
    return unSort.indexOf(item) === i;
  });
  console.log(sorted);
  renderCategories(sorted);
}

function renderCategories(sorted) {
  let str = '<option value="全部" selected>全部</option>';
  sorted.forEach(function (item) {
    str += `<option value="${item}">${item}</option>`;
  });
  productSelect.innerHTML = str;
}

//  validate.js 驗證
const constraints = {
  姓名: {
    presence: {
      message: '是必填欄位',
    },
  },
  電話: {
    presence: {
      message: '是必填欄位',
    },
    length: {
      minimum: 8,
      message: '號碼需超過 8 碼',
    },
  },
  Email: {
    presence: {
      message: '是必填欄位',
    },
    email: {
      message: '格式有誤',
    },
  },
  寄送地址: {
    presence: {
      message: '是必填欄位',
    },
  },
};

const messages = document.querySelectorAll('[data-message]');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const errors = validate(form, constraints);

  if (errors) {
    // 處理錯誤，例如顯示錯誤信息
    showErrors(errors);
    console.log(errors);
  } else {
    // 沒有錯誤，進行表單提交

    addOrder();
  }
});

function showErrors(errors) {
  messages.forEach((item) => {
    item.textContent = '';
    item.textContent = errors[item.dataset.message];
  });
}

// 監聽表單中所有輸入欄位的 'change' 事件
document.querySelectorAll('.orderInfo-value').forEach((input) => {
  input.addEventListener('change', function (e) {
    let fieldName = input.name; // 使用輸入欄位的 'name' 屬性
    let fieldValue = input.value;

    // 準備驗證的數據對象
    let validationData = {};
    validationData[fieldName] = fieldValue;

    // 執行驗證
    let error = validate(validationData, constraints);
    console.log('error', error);

    let messageElement = document.querySelector(
      `[data-message="${fieldName}"]`
    );
    if (error) {
      messageElement.textContent = error[fieldName];
    } else {
      messageElement.textContent = '';
    }
  });
});

// 初始渲染
function init() {
  getProduct();
  getCartList();
}

init();
