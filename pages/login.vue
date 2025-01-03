<script lang="ts" setup>
  import { useRouter } from "#vue-router";
  import { storeToRefs } from "pinia";
  import { useUserStore } from "~/store/user";

  const name = ref<string>('Bret');
  const phone = ref<string>('1-770-736-8031 x56442');

  const router = useRouter();

  const userStore = useUserStore();
  const { error } = storeToRefs(useUserStore());

  onMounted(() => {
    if (userStore.user) {
      router.push('/');
    }
  });

  onBeforeMount(() => {
    userStore.initializeUser();
  });

  watchEffect(() => {
    if (name.value || phone.value) {
      error.value = ''
    }
  })
</script>

<template>
  <div class="form-container">
    <div class="form-container__box">
      <div class="form-container__header">Login form</div>
      <form @submit.prevent="userStore.login(name, phone)" class="form-container__form">
        <label for="username" class="form-container__label">Username</label>
        <input id="username" v-model="name" type="text" pattern="[A-Za-z]+" required class="form-container__input" />

        <label for="phone" class="form-container__label">Phone Number</label>
        <input id="phone" v-model="phone" type="text" required class="form-container__input" />
        <span class="form-container__input--error">{{error}}</span>

        <button type="submit" class="form-container__button">Login</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #dcdcdc;

    &__box {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      border-radius: 10px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
    }

    &__header {
      margin-bottom: 20px;
      color: #666666;
      text-align: center;
      font-size: 14px;
    }

    &__form {
      display: flex;
      flex-direction: column;
    }

    &__label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #666666;
    }

    &__input {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-sizing: border-box;

      &--error {
        margin-bottom: 15px;
        height: 15px;
      }
    }

    &__button {
      width: 100%;
      padding: 10px;
      background-color: #4caf50;
      color: white;
      font-size: 14px;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background-color: #45a049;
      }
    }
  }
</style>
