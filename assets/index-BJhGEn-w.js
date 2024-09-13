import{a as c}from"./axios-C-FzUDax.js";console.clear();const l="https://livejs-api.hexschool.io/api/livejs/v1",s="ryanc3",f=document.querySelector(".orderInfo-form");let u=[],m=[];const v=t=>t.toLocaleString("en-IN");function q(){c.get(`${l}/customer/${s}/products`).then(t=>{u=t.data.products,g(u)}).then(t=>{console.log(t)})}const y=document.querySelector(".productWrap");function g(t){let e=t.map(r=>{const{images:a,title:d,origin_price:n,price:o,id:h}=r;return`
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${a}" alt="">
        <a href="#" class="addCardBtn" data-id="${h}">加入購物車</a>
        <h3>${d}</h3>
        <del class="originPrice">NT$${n}</del>
        <p class="nowPrice">NT$${o}</p>
      </li>
    `});y.innerHTML=e.join("")}y.addEventListener("click",t=>{if(t.preventDefault(),t.target.getAttribute("class")!=="addCardBtn")return;let r=t.target.dataset.id;E(r)});function i(){c.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${s}/carts`).then(function(t){m=t.data.carts,S(m)})}const $=document.querySelector(".shoppingCart-table");function S(t){if(t.length==0){$.innerHTML="<tr><td>購物車裡面目前沒有東西</td></tr>";return}let e="";e+=`<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>`;let r=0;t.forEach(a=>{const{id:d,quantity:n}=a,{images:o,title:h,price:p}=a.product;r+=p*n,e+=`
       <tr>
          <td>
              <div class="cardItem-title">
                  <img src="${o}" alt="">
                  <p>${h}</p>
              </div>
          </td>
          <td>NT$${p}</td>
          <td>${n}</td>
          <td>NT$${v(p*n)}</td>
          <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${a.id}">
                  clear
              </a>
          </td>
      </tr>
    `}),e+=`
    <tr>
        <td>
            <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td><p>總金額</p></td>
        <td>NT$${v(r)}</td>
    </tr>
  `,$.innerHTML=e}function E(t){let e=1;m.forEach(r=>{r.product.id===t&&(e=r.quantity+=1)}),c.post(`${l}/customer/${s}/carts`,{data:{productId:t,quantity:e}}).then(function(r){console.log(r.data),alert("加入購物車成功"),i()}).catch(function(r){console.log(r)})}function L(t){c.delete(`${l}/customer/${s}/carts/${t}`).then(function(e){alert("刪除單筆購物車成功！"),i()})}function N(){c.delete(`${l}/customer/${s}/carts`).then(function(t){alert("刪除全部購物車成功！"),i()}).catch(function(t){alert("購物車已清空！")})}$.addEventListener("click",function(t){t.preventDefault();let e=t.target.getAttribute("data-id");if(e){L(e);return}t.target.classList.contains("discardAllBtn")&&N()});function T(){if(m.length===0){alert("購物車內沒有商品，請先添加商品！");return}let t={data:{user:{name:document.querySelector("#customerName").value.trim(),tel:document.querySelector("#customerPhone").value.trim(),email:document.querySelector("#customerEmail").value.trim(),address:document.querySelector("#customerAddress").value.trim(),payment:document.querySelector("#tradeWay").value.trim()}}};c.post(`${l}/customer/${s}/orders`,t).then(function(e){console.log("addOrder",e.data),t={},f.reset(),i(),alert("送出訂單成功!")}).catch(function(e){console.log(e)})}const A=document.querySelector(".productSelect");A.addEventListener("change",w);function w(t){let e=t.target.value;if(e==="全部"){g(u);return}let r=[];u.forEach(function(a){a.category===e&&r.push(a)}),g(r)}const C={姓名:{presence:{message:"是必填欄位"}},電話:{presence:{message:"是必填欄位"},length:{minimum:8,message:"號碼需超過 8 碼"}},Email:{presence:{message:"是必填欄位"},email:{message:"格式有誤"}},寄送地址:{presence:{message:"是必填欄位"}}},x=document.querySelectorAll("[data-message]");f.addEventListener("submit",function(t){t.preventDefault();const e=validate(f,C);e?(B(e),console.log(e)):T()});function B(t){x.forEach(e=>{e.textContent="",e.textContent=t[e.dataset.message]})}document.querySelectorAll(".orderInfo-value").forEach(t=>{t.addEventListener("change",function(e){let r=t.name,a=t.value,d={};d[r]=a;let n=validate(d,C);console.log("error",n);let o=document.querySelector(`[data-message="${r}"]`);n?o.textContent=n[r]:o.textContent=""})});function D(){q(),i()}D();
