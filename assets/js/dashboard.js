import axios from 'axios';
import c3 from 'c3';


console.clear();

const baseUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin';
const api_path = 'ryanc3';
const token = '';
const header = {
  headers: {
    Authorization: token,
  },
};

let orderData = [];

// 取得訂單列表
function getOrderList() {
  axios
    .get(`${baseUrl}/${api_path}/orders`, header)
    .then(function (response) {
      orderData = response.data.orders;
      // console.log('orderData - 20', response.data.orders);
      renderOrderList(orderData);
      // 圓餅圖
      processChartData(orderData);
    })
    .catch((err) => {
      console.log(err);
    });
}

getOrderList();

const orderPageTable = document.querySelector('.orderPage-table');

function renderOrderList(data) {
  let str = '';
  str += `
    <thead>
      <tr>
          <th>訂單編號</th>
          <th>聯絡人</th>
          <th>聯絡地址</th>
          <th>電子郵件</th>
          <th>訂單品項</th>
          <th>訂單日期</th>
          <th>訂單狀態</th>
          <th>操作</th>
      </tr>
  </thead>
  `;
  data.forEach((order) => {
    let productItems = order.products
      .map((item) => `<p>${item.title} * ${item.quantity}</p>`)
      .join('');
    str += `
       <tr>
        <td>${order.id}</td>
        <td>
          <p>${order.user.name}</p>
          <p>${order.user.tel}</p>
        </td>
        <td>${order.user.address}</td>
        <td>${order.user.email}</td>
        <td>${productItems}</td> 
        <td>${formatDate(order.createdAt)}</td>
        <td class="orderStatus">
          <a href="#" data-status='${order.paid}' data-id="${order.id}">${
      order.paid ? '已處理' : '未處理'
    }</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${
            order.id
          }" value="刪除">
        </td>
    </tr>
    `;
  });

  orderPageTable.innerHTML = str;
}

function formatDate(timestamp) {
  // 將時間戳轉換為毫秒（如果原本是秒為單位）
  const date = new Date(timestamp * 1000);
  // 獲取年、月、日
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 加 1 因為月份是從 0 開始的
  const day = date.getDate().toString().padStart(2, '0');

  // 返回格式化的日期
  return `${year}/${month}/${day}`;
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios
    .delete(`${baseUrl}/${api_path}/orders/${orderId}`, header)
    .then(function (response) {
      // console.log(response.data);
      alert('刪除特定訂單成功');
      getOrderList(orderData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 刪除全部訂單
function deleteAllOrder() {
  axios
    .delete(`${baseUrl}/${api_path}/orders/`, header)
    .then(function (response) {
      // console.log(response.data);
      alert('刪除全部訂單成功');
      getOrderList(orderData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 修改訂單狀態

function editOrderList(orderId) {
  // 從 orderData 中找到對應的訂單
  let order = orderData.find((order) => order.id === orderId);
  if (!order) {
    console.log('訂單未找到');
    return;
  }
  let orderStatus = !order.paid;
  let data = {
    data: {
      id: orderId,
      paid: orderStatus,
    },
  };
  axios
    .put(`${baseUrl}/${api_path}/orders/`, data, header)
    .then(function (response) {
      getOrderList();
      alert('訂單狀態已修改!');
    })
    .catch((err) => {
      console.log(err);
    });
}

const orderPageList = document.querySelector('.orderPage-list');
const orderStatus = document.querySelectorAll('.orderStatus > a');
console.log(orderStatus.length);

orderPageList.addEventListener('click', (e) => {
  e.preventDefault();
  // 刪除單筆訂單
  let orderId = e.target.dataset.id;

  if (e.target.classList.contains('delSingleOrder-Btn')) {
    deleteOrderItem(orderId);
  }

  // 刪除所有訂單
  if (e.target.classList.contains('discardAllBtn')) {
    deleteAllOrder();
  }

  // 修改訂單狀態
  if (
    e.target.tagName === 'A' &&
    e.target.parentElement.classList.contains('orderStatus')
  ) {
    console.log(orderId);
    editOrderList(orderId);
  }
});

// 圓餅圖資料整理
function processChartData(data) {
  let productCount = {};

  data.forEach((order) => {
    order.products.forEach((product) => {
      if (productCount[product.title]) {
        productCount[product.title] += product.quantity;
      } else {
        productCount[product.title] = product.quantity;
      }
    });
  });

  let productCountArray = Object.entries(productCount).sort(
    (a, b) => b[1] - a[1]
  );
  let topProducts = productCountArray.slice(0, 3);
  let otherCount = productCountArray
    .slice(3)
    .reduce((acc, item) => acc + item[1], 0);
  if (otherCount > 0) {
    topProducts.push(['其他', otherCount]);
  }
  // console.log('productCountArray', productCountArray);
  console.log('topProducts', topProducts);
  // console.log('otherCount', otherCount);

  // 更新圓餅圖
  updateChart(topProducts);
}

// C3.js
function updateChart(chartData) {
  // 前三名及「其他」的顏色
  const predefinedColors = ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F'];
  let chartColors = {};

  chartData.forEach((item, index) => {
    // 分配顏色
    chartColors[item[0]] = predefinedColors[index];
  });

  // console.log('chartColors', chartColors);
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: chartData,
      // columns: [
      //   ["Louvre 雙人床架", 1],
      //   ["Antony 雙人床架", 2],
      //   ["Anty 雙人床架", 3],
      //   ["其他", 4]
      // ],
      colors: chartColors,
    },
  });
}