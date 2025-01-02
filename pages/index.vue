<script setup lang="ts">
import { useUserStore } from "~/store/user";
import { storeToRefs } from "pinia";
import { useRouter } from "#vue-router";

const name = ref<string>('Bret');
const phone = ref<string>('1-770-736-8031 x56442');

const router = useRouter();

const userStore = useUserStore();
const {error} = storeToRefs(useUserStore())

onMounted(() => {
  if (userStore.user) {
    router.push('/todos');
  }
});

onBeforeMount(() => {
  userStore.initializeUser()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <form @submit.prevent="userStore.login(name, phone)" class="w-1/3 p-4 border rounded">
      <div class="mb-4">
        <label for="username" class="block text-sm font-bold mb-2">Username</label>
        <input id="username" v-model="name" type="text" class="w-full p-2 border rounded" pattern="[A-Za-z]+" required/>
      </div>
      <div class="mb-4">
        <label for="phone" class="block text-sm font-bold mb-2">Phone Number</label>
        <input id="phone" v-model="phone" type="text" class="w-full p-2 border rounded" required/>
      </div>
      <button type="submit" class="w-full p-2 text-white bg-blue-500 rounded">Login</button>
    </form>
    <p v-if="error" class="mt-4 text-red-500">Login error</p>
  </div>
</template>

