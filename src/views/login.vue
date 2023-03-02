<template>
  <div class="login-container" @keydown="keyLogin">
    <div class="login-main">
      <div class="login-form">
        <div class="login-font">
          <div>
            <img
              style="width: 120px; height: 120px; object-fit: cover"
              src="../assets/imgs/logo_black.png"
            />
          </div>
          <div class="font-02">账单管理系统</div>
        </div>
        <div class="username">
          <input
            class="user-input"
            type="text"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-s-custom"
            tabindex="1"
            auto-complete="on"
          />
        </div>
        <div class="password">
          <input
            class="pass-input"
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            tabindex="2"
            auto-complete="on"
          />
        </div>
        <div class="login-btn">
          <div class="btn-self" @click="handleLogin">登录</div>
        </div>
      </div>
      <div class="right-img">
        <img src="../assets/imgs/bg.png" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    handleLogin() {
      if (this.loginForm.username == "" || this.loginForm.password == "") {
        this.$message.warning({
          message: "用户名或密码不能为空 !",
          showClose: true,
          duration: 2000,
        });
      } else {
        const loading = this.$loading({
          lock: true,
          text: "登录中...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });

        this.$axios
          .post(this.$store.state.baseUrl + "/api/account/login", {
            username: this.loginForm.username,
            password: this.loginForm.password,
          })
          .then((res) => {
            console.log("登录啦~");
            console.log(res);
            loading.close();
            if (res.data.data.token) {
              this.$message.success({
                message: "登录成功",
                showClose: true,
                duration: 2000,
              });
              sessionStorage.setItem("userId", res.data.data.id);
              sessionStorage.setItem("token", res.data.data.token);
              sessionStorage.setItem(
                "currencyGlobal",
                res.data.data.settleCurrency
              );
              sessionStorage.setItem("username", res.data.data.username);

              this.$router.push("/home");
            } else {
              this.$message.error({
                message: "啊哦，登录失败，请检查用户名或密码输入是否正确",
                showClose: true,
                duration: 2000,
              });
              this.loginForm.password = "";

              sessionStorage.setItem("token", "");
            }
          })
          .catch((err) => {
            loading.close();
            this.$message.error({
              message: "啊偶，登录失败，请检查用户名或密码输入是否正确",
              showClose: true,
              duration: 2000,
            });
            sessionStorage.setItem("token", "");
            this.loginForm.password = "";
          });
      }
    },
    keyLogin() {
      if (event.keyCode == 13) {
        this.handleLogin();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  /*定义body的元素垂直居中*/
  justify-content: center;
  background: url("../assets/imgs/bgc01.png") no-repeat 100%;

  .login-main {
    display: flex;
    box-shadow: 20px 20px 30px -10px rgba(0, 0, 0, 0.4);

    .login-form {
      width: 540px;
      height: 720px;
      background-color: #fff;
      text-align: center;

      .login-font {
        margin-top: 60px;
        font-family: "Arial";

        .font-01 {
          font-size: 30px;
        }

        .font-02 {
          font-size: 20px;
          color: #26303c;
          font-style: italic;
        }
      }

      .user-input,
      .pass-input {
        width: 372px;
        height: 50px;
        padding-left: 20px;
        border: 0;
        background-color: #f8f8f8;
        outline: none;
        font-size: 16px;
        color: #797979;
      }

      .username {
        margin-top: 50px;
      }

      .password {
        margin-top: 26px;
      }

      .login-btn {
        margin-top: 60px;

        img {
          width: 372px;
          height: 50px;
        }

        .btn-self {
          width: 372px;
          height: 50px;
          line-height: 50px;
          margin: 0 auto;
          font-size: 16px;
          color: #fff;
          background: url("../assets/imgs/aside.png") no-repeat;
          background-size: 100% 100%;
          border: 0;
          outline: none;
          cursor: pointer;
        }
      }
    }

    .right-img {
      width: auto;
      height: 720px;
    }
  }
}

input:focus {
  outline: none;
}
</style>
