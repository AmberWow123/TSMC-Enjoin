import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";

createApp({
  data() {
    return {
      apiUrl: `https://tsmc-enjoin.herokuapp.com`,
      //apiUrl: `http://127.0.0.1:5000`,
      user: {
        id: "",
        password: "",
      },
      register: {
        id: "",
        password: "",
        epidemic_prevention_group: ""
      },
    };
  },
  methods: {
    login() {
      axios
        .post(`${this.apiUrl}/Account/Login`, this.user)
        .then((res) => {
          console.log(res);
          if (res.data.message === "成功登入") {
            const { token, expired, _id, id } = res.data;
            // Warn!
            // console.log('expired:',expired) // gives 'undefined'
            document.cookie = `Token=${token};expires=${new Date(
              expired
            )}; path=/`;
            document.cookie = `_id=${_id}; path=/`
            document.cookie = `id=${id}; path=/`
            window.location.href = `/`;
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
}).mount("#app");
