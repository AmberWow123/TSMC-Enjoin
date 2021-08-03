import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";

createApp({
  data() {
    return {
      apiUrl: `https://tsmc-enjoin.herokuapp.com`,
      //apiUrl: `http://127.0.0.1:5000`,
      user: {
        id: "",
        password: "",
        fab: ""
      },
    };
  },
  methods: {
    login() {
      axios
        .post(`${this.apiUrl}/account/create`, this.user)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            const { token, expired } = res.data;
            document.cookie = `Token=${token};expires=${new Date(
              expired
            )}; path=/`;
            //window.location = "group.html";
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    create() {
      axios
        .post(`${this.apiUrl}/Account/Create`, this.user)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            const { token, expired } = res.data;
            document.cookie = `Token=${token};expires=${new Date(
              expired
            )}; path=/`;
            //window.location = "group.html";
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    loginForm() {
      const formData = new FormData()
      formData.append('id', this.user.id)
      formData.append('password', this.user.password)
      formData.append('fab',this.user.fab)

      axios
        .post(`${this.apiUrl}/Account/Login`, formData)
        .then((res) => {
          console.log(res);
          if (res.data.message==="成功登入") {
            const { token, expired, _id, id } = res.data;
            // Warn!
            // console.log('expired:',expired) // gives 'undefined'
            document.cookie = `Token=${token};expires=${new Date(
              expired
            )}; path=/`;
            document.cookie = `_id=${_id}; path=/`
            document.cookie = `id=${id}; path=/`
            window.location.href = `../profile?id=${this.user.id}`;
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    createForm() {
      const formData = new FormData()
      formData.append('id', this.user.id)
      formData.append('password', this.user.password)
      formData.append('fab',this.user.fab)

      axios
        .post(`${this.apiUrl}/Account/Create`, formData)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            const { token, expired } = res.data;
            document.cookie = `Token=${token};expires=${new Date(
              expired
            )}; path=/`;
            //window.location = "group.html";
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
}).mount("#app");
