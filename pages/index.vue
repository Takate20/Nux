<script lang="ts" setup>
  import { storeToRefs } from "pinia";
  import { computed, onBeforeMount, ref } from 'vue';
  import { useTodoStore } from "~/store/todos";
  import { useUserStore } from "~/store/user";
  import { TodoStatus, type User } from "~/types/types";

  const userStore = useUserStore();
  const todoStore = useTodoStore();

  const user = userStore.user;
  const { filteredTodos, filters, loading } = storeToRefs(todoStore);

  const newTodoUserId = ref<number>();
  const newTodoTitle = ref('');

  const userIds = await $fetch<Array<User>>(`${ useRuntimeConfig().public.apiBase }/users`)
  .then(users => users.map(user => user.id))
  .catch(() => {
    return [];
  });

  const page = ref(1);
  const itemsPerPage = 5;

  const paginatedTodos = computed(() => {
    const start = (page.value - 1) * itemsPerPage;
    return filteredTodos.value.slice(start, start + itemsPerPage);
  });

  const totalPages = computed(() => Math.ceil(filteredTodos.value.length / itemsPerPage));

  const onSubmit = () => {
    todoStore.addTodo(newTodoUserId.value!, newTodoTitle.value);

    newTodoUserId.value = undefined;
    newTodoTitle.value = "";
  };

  const isSubmitDisabled = computed(() => {
    return !newTodoUserId.value || !newTodoTitle.value.trim();
  });

  onBeforeMount(async () => {
    await todoStore.fetchTodos();
  });
</script>

<template>
  <template v-if="loading">
    loading...
  </template>
  <template v-if="user && !loading">
    <div class="todos">
      <header class="todos__header">
        <h1 class="todos__title">Welcome, {{ user?.name }}</h1>
        <button @click="userStore.logout()">Logout</button>
      </header>

      <section class="todos__section">
        <div class="todos__filters">
          <select v-model="filters.status" class="todos__select">
            <option disabled selected>Status</option>
            <option v-for="filter in Object.values(TodoStatus)" :value="filter">{{ filter }}</option>
          </select> <select v-model="filters.id" class="todos__select">
          <option disabled selected>User Id</option>
          <option value="All users">All Users</option>
          <option v-for="id in userIds" :value="id">User {{ id }}</option>
        </select> <input v-model="filters.search" class="todos__input" placeholder="Search by title"/>
        </div>

        <template v-if="paginatedTodos.length > 0">
          <ul class="todos__list">
            <li v-for="todo in paginatedTodos" :key="todo.id" class="todos__item-wrapper">
              <div class="todos__item">
                <h2 class="todos__item-title">{{ todo.title }}</h2>
                <button class="todos__favorite-button" @click="todoStore.toggleFavorite(user.id, todo.id)">
                  <Icon :class="todoStore.getUserFavorites(user.id).includes(todo.id) ? 'todos__favorite' : 'todos__not-favorite'" name="mdi-heart" />
                </button>
              </div>
              <p class="todos__item-status">Status: {{ todo.completed ? 'Completed' : 'Uncompleted' }}</p>
            </li>
          </ul>
        </template>
        <template v-else>
          No result for the specified filters
        </template>

        <div class="todos__pagination">
          <button :disabled="page <= 1" class="todos__pagination-button" @click="page--">
            Previous
          </button>
          <span class="todos__pagination-info">Page {{ page }} of {{ totalPages }}</span>
          <button :disabled="page >= totalPages" class="todos__pagination-button" @click="page++">
            Next
          </button>
        </div>
      </section>

      <section class="todos__section">
        <h2 class="todos__section-title">Create Todo</h2>
        <form class="todos__form" @submit.prevent="onSubmit">
          <input v-model.number="newTodoUserId" class="todos__input" placeholder="User ID" required/> <input v-model="newTodoTitle" class="todos__input" placeholder="Title" required/>
          <button :disabled="isSubmitDisabled" class="todos__submit-button" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  </template>
</template>

<style lang="scss" scoped>
  .todos {
    &__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__header {
      padding: 16px;
      border-bottom: 1px solid #ccc;
    }

    &__title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 7px;
    }

    &__section {
      padding: 16px;
    }

    &__filters {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }

    &__select,
    &__input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    &__item-wrapper {
      padding: 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__item-title {
      font-size: 18px;
      font-weight: bold;
    }

    &__item-status {
      font-size: 16px;
      color: #6b7280;
    }

    &__favorite-button {
      margin-left: 6px;
      border: none;
      border-radius: 9999px;
      background-color: transparent;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #fef2f2;
      }
    }

    &__favorite {
      margin-bottom: -2px;
      color: #f87171;
    }

    &__not-favorite {
      margin-bottom: -2px;
      color: #6b7280;
    }

    &__pagination {
      display: flex;
      margin-top: 16px;
      justify-content: center;
      align-items: center;
      gap: 16px;

      &-button {
        padding: 8px 16px;
        background-color: #3b82f6;
        color: white;
        border-radius: 6px;

        &:disabled {
          background-color: #e5e7eb;
        }
      }
    }

    &__pagination-info {
      padding: 0 16px;
    }

    &__form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
    }

    &__submit-button {
      padding: 8px 16px;
      background-color: #3b82f6;
      color: white;
      border-radius: 6px;

      &:disabled {
        background-color: #e5e7eb;
      }
    }
  }
</style>

