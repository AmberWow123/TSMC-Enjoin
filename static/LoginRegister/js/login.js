import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";

createApp({
  data() {
    return {
      apiUrl: `https://5000-maroon-koala-8klosyxm.ws-us11.gitpod.io`,
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
            document.cookie = `hexToken=${token};expires=${new Date(
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
          if (res.data.success) {
            const { token, expired } = res.data;
            document.cookie = `hexToken=${token};expires=${new Date(
              expired
            )}; path=/`;
            window.location = "../profile";
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
            document.cookie = `hexToken=${token};expires=${new Date(
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