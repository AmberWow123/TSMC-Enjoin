import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";
const apiUrl = "https://tsmc-enjoin.herokuapp.com";
//const apiUrl = `http://127.0.0.1:5000`;

let productModal = null;
let orderModal = null;
let closeOrderModal = null;
let delProductModal = null;
let delOrderModal = null;
//let token = null;
const token = document.cookie.replace(
  /(?:(?:^|.*;\s*)Token\s*=\s*([^;]*).*$)|^.*$/,
  "$1"
);
const url = new URL(window.location.href);
const param = url.searchParams.get("id");

createApp({
  data() {
    return {
      followList : [],
      defaultFollowList:[

      ],
      ownList : [],
      defaultList: [{
        "_id": "6100c77a668482b3ac89b8c9",
        "comment": "邊緣人急需人QQQ",
        "creator_id": "2266555",
        "drink": "美式咖啡",
        "hashtag": [
            "FAB7",
            "starbucks",
            "美式咖啡"
        ],
        "join_people": 2,
        "join_people_bound": 2,
        "join_people_id": [
            "123456",
            "167345"
        ],
        "meet_factory": "FAB7",
        "meet_time": [
            "2021-07-28T18:00:00.000Z",
            "2021-07-28T18:15:00.000Z"
        ],
        "status": "COMPLETED",
        "store": "starbucks",
        "title": "美式咖啡買三送二"
    }],
      products: [],
      isNew: false,
      tempProduct: {
        imagesUrl: [],
      },
      tempOrder: {
      },
    };
  },
  mounted() {
    
    productModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
      }
    );
    orderModal = new bootstrap.Modal(
      document.getElementById("orderModal"),
      {
        keyboard: false,
      }
    );
    closeOrderModal = new bootstrap.Modal(
      document.getElementById("closeOrderModal"),
      {
        keyboard: false,
      }
    );
    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
      }
    );
    delOrderModal = new bootstrap.Modal(
      document.getElementById("delOrderModal"),
      {
        keyboard: false,
      }
    );
    
   /*
    token = document.cookie.replace(
      /(?:(?:^|.*;\s*)Token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    */

    /*
    if (token === "") {
      alert("請重新登入");
      window.location = "../LoginRegister";
    }
    axios.defaults.headers.common.Authorization = token;
    */
   
    /*
    const url = new URL(window.location.href);
    param = url.searchParams.get("id");
    */
    this.getOwnerGroupOrder();
  },
  methods: {
    getOwnerGroupOrder(){
      //getData(page = 1) {
        console.log(token)
        axios
          .get(`${apiUrl}/Account/ListOwnerCreatedGroupOrder/${param}`,{
            headers: {
            'x-access-token': token
            }
          })
          //.get(`${apiUrl}/${apiPath}/admin/products?page=${page}`)
          .then((res) => {
            console.log(res);
            console.log(res.data);
            console.log(res.data.data[0])
            if (res.data.message==='success') {
              this.ownList = res.data.data;
            } else {
              console.log(res.data.message);
            }
          })
          .catch((err) => {
            console.log(err);
          });
    },
    getAllGroupOrder(){
    //getData(page = 1) {
      console.log(token)
      axios
        .get(`${apiUrl}/Account/ListOwnerGroupOrder/${param}`,{
          headers: {
          'x-access-token': token
          }
        })
        //.get(`${apiUrl}/${apiPath}/admin/products?page=${page}`)
        .then((res) => {
          console.log(res);
          console.log(res.data);
          console.log(res.data.data[0])
          if (res.data.message==='success') {
            this.followList = res.data.data;
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    
    updateProduct() {
      let url = `${apiUrl}/${apiPath}/admin/product`;
      let http = "post";
      if (!this.isNew) {
        url = `${apiUrl}/${apiPath}/admin/product/${this.tempProduct.id}`;
        http = "put";
      }
      axios[http](url, { data: this.tempProduct })
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            productModal.hide();
            this.getData();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      
      // if (this.isNew) {
      //   //當產品不存在，新增至產品列表
      //   this.products.push({
      //     id: Date.now(),
      //     ...this.tempProduct,
      //   });
      //   this.tempProduct = {
      //     imagesUrl: [], //清空 tempProduct
      //   };
      //   productModal.hide();
      // } else {
      //   const index = this.products.findIndex(
      //     (item) => item.id === this.tempProduct.id
      //   );
      //   this.products[index] = this.tempProduct;
      //   productModal.hide();
      // }
    },

    updateOrder() {
      let url = `${apiUrl}/Account/CreateOrder/${param}`;
      let http = "post";
      if (!this.isNew) {
        url = `${apiUrl}/Account/UpdateOrder/${param}/${this.tempOrder._id}`;
        http = "post";
      }

      const formData = new FormData();
      //formData.append('meet_factory', this.tempOrder)
      //formData.append('store', this.tempOrder.store)
      
      formData.append('meet_factory', this.tempOrder.meet_factory);
      formData.append('store', this.tempOrder.store);
      formData.append('drink', this.tempOrder.drink);
      formData.append('meet_time_start', this.tempOrder.meet_time_start);
      formData.append('meet_time_end',this.tempOrder.meet_time_end);
      formData.append('comment', this.tempOrder.comment);
      formData.append('title', this.tempOrder.title);
      //formData.append('hashtag', this.tempOrder.hashtag);
      formData.append('join_people_bound', this.tempOrder.join_people_bound);

      axios[http](url,
          formData,
          {headers: {'x-access-token': token}},
        )
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            orderModal.hide();
            this.getOwnerGroupOrder();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    closeOrder(){
      axios
        .post(`${this.apiUrl}/Account/CloseOrder/${param}/${this.tempOrder._id}`,{
          headers: {'x-access-token': token}
        })
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            this.getOwnerGroupOrder();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    delOrder() {
      axios
        .delete(`${apiUrl}/Account/DeleteCreatedOrder/${param}/${this.tempOrder._id}`,{
          headers: {'x-access-token': token}
        })
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            delOrderModal.hide();
            this.getOwnerGroupOrder();
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
   
    delProduct() {
      axios
        .delete(`${apiUrl}/${apiPath}/admin/product/${this.tempProduct.id}`)
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            delProductModal.hide();
            this.getData();
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      
      //   this.products.splice(
      //     this.products.findIndex((item) => item.id === this.tempProduct.id),
      //     1
      //   );
      //   delProductModal.hide();
      // },
    },


    openModal(status, item) {
      if (status === "new") 
      {
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } 
      else if(status === "newOrder")
      {
        this.tempOrder = {
          id: param,
        };
        this.isNew = true;
        orderModal.show();
      }
      else if (status === "edit") 
      {
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      }
      else if(status === "editOrder")
      {
        this.tempOrder = { ...item };
        this.isNew = false;
        orderModal.show();
      }
      else if(status === "closeOrder")
      {
        this.tempOrder = {...item};
        closeOrderModal.show();
      }
      else if (status === "delete") {
        this.tempProduct = { ...item };
        delProductModal.show();
      }
      else if (status === "deleteOrder") {
        this.tempOrder = { ...item };
        delOrderModal.show();
      }
    },
    
    
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push("");
    },
    
    logout() {
      alert("請重新登入");
      window.location = "../LoginRegister";
    },
  },
}).mount("#app");
