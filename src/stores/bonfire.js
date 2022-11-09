import { defineStore } from "pinia";
import axios from "axios";
import Swal from "sweetalert2";

const baseUrl = `http://localhost:3000`;

export const useBonfireStore = defineStore("bonfire", {
  state: () => ({
    isLoggedIn: false,
    isVerified: "",
    games: [],
    gameDetail: {},
    explore: [],
  }),
  actions: {
    async postLogin(payload) {
      try {
        const { data } = await axios.post(`${baseUrl}/users/login`, {
          email: payload.email,
          password: payload.password,
        });
        localStorage.setItem(`access_token`, data.access_token);
        localStorage.setItem(`username`, data.username);
        localStorage.setItem(`verified`, data.verified);
        this.isLoggedIn = true;
        this.isVerified = localStorage.getItem(`verified`)
        Swal.fire({
          title: "Success!",
          icon: "success",
          text: `Welcome back, ${data.username}!`,
        });
        this.router.push("/");
      } catch (error) {
        Swal.fire({
          title: "An Error has occured...",
          icon: "error",
          text: err.response.data.message,
        });
      }
    },
    async postregister(payload) {
      try {
        await axios.post(`${baseUrl}/users/register`, {
          username: payload.username,
          email: payload.email,
          password: payload.password,
        });

        let result = await Swal.fire({
          icon: "success",
          title: "Register successful!",
          text: "Do you want to login immediately?",
          showCancelButton: true,
          confirmButtonText: "Login",
        });

        if (result.isConfirmed) {
          const loginForm = {
            email: payload.email,
            password: payload.password,
          };
          await this.postLogin(loginForm);
        }
      } catch (error) {
        Swal.fire({
          title: "An Error has occured...",
          icon: "error",
          html: error.response.data.message.join("<br>"),
        });
      }
    },
    logout() {
      localStorage.clear();
      Swal.fire({
        title: "Success!",
        icon: "success",
        text: `Logged out successfully!`,
      });
      this.isLoggedIn = false;
      this.router.push("/");
    },
    async fetchGames() {
      try {
        let { data } = await axios.get(`${baseUrl}/games`, {});
        this.games = data;
      } catch (error) {
        Swal.fire({
            title: "An Error has occured...",
            icon: "error",
            text: err.response.data.message,
          });
      }
    },
    async fetchGameById(id) {
      try {
        let { data } = await axios.get(`${baseUrl}/games/${id}`, {});
        this.gameDetail = data;
      } catch (error) {
        Swal.fire({
            title: "An Error has occured...",
            icon: "error",
            text: err.response.data.message,
          });
      }
    },
    async exploreGames() {
      try {
        const current = Math.floor(this.explore.length / 10);
        let url = `${baseUrl}/games/explore`;

        url = current >= 1 ? url + `?page=${current + 1}` : url;

        let access_token = localStorage.getItem("access_token");
        let { data } = await axios.get(url, {
          headers: {
            access_token,
          },
        });
        data.games.forEach((el) => {
          this.explore.push(el);
        });
      } catch (error) {
        Swal.fire({
            title: "An Error has occured...",
            icon: "error",
            text: err.response.data.message,
          });
      }
    },
    async postReview(payload) {
      try {
        let access_token = localStorage.getItem("access_token");
        let { data } = await axios.post(
          `${baseUrl}/reviews/${this.gameDetail.id}`,
          {
            review: payload.review,
            score: payload.score,
          },
          {
            headers: {
              access_token,
            },
          }
        );
        Swal.fire({
          title: "Success!",
          icon: "success",
          text: data.message,
        });
        this.router.push(`/games/${this.gameDetail.id}`);
      } catch (error) {
        Swal.fire({
            title: "An Error has occured...",
            icon: "error",
            text: err.response.data.message,
          });
      }
    },
  },
  getters: {},
});