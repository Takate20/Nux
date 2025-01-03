<script lang="ts" setup>
import { useUserStore } from "~/store/user";
import { useTodoStore } from "~/store/todos";
import { storeToRefs } from "pinia";
import { TodoStatus, type User } from "~/types/types";
import { computed, onBeforeMount, ref } from 'vue';

const userStore = useUserStore();
const todoStore = useTodoStore();

const user = userStore.user;
const { favorites, filteredTodos, filters, loading } = storeToRefs(todoStore);

const newTodoUserId = ref<number>();
const newTodoTitle = ref('');

const userIds = await $fetch<Array<User>>(`${ useRuntimeConfig().public.apiBase }/users`)
.then(users => users.map(user => user.id))
.catch(error => {
  console.error('Error fetching users:', error);
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
  <template v-else>
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
          </select>
          <select v-model="filters.id" class="todos__select">
            <option disabled selected>User Id</option>
            <option value="All users">All Users</option>
            <option v-for="id in userIds" :value="id">User {{ id }}</option>
          </select>
          <input v-model="filters.search" class="todos__input" placeholder="Search by title"/>
        </div>

        <template v-if="paginatedTodos.length > 0">
          <ul class="todos__list">
            <li v-for="todo in paginatedTodos" :key="todo.id" class="todos__item-wrapper">
              <div class="todos__item">
                <h2 class="todos__item-title">{{ todo.title }}</h2>
                <button
                  class="todos__favorite-button"
                  @click="todoStore.toggleFavorite(todo.id)"
                >
                  <Icon :class="favorites.includes(todo.id) ? 'todos__favorite' : 'todos__not-favorite'" name="mdi-heart"/>
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
          <button
            :disabled="page <= 1"
            class="todos__pagination-button"
            @click="page--"
          >
            Previous
          </button>
          <span class="todos__pagination-info">Page {{ page }} of {{ totalPages }}</span>
          <button
            :disabled="page >= totalPages"
            class="todos__pagination-button"
            @click="page++"
          >
            Next
          </button>
        </div>
      </section>

      <section class="todos__section">
        <h2 class="todos__section-title">Create Todo</h2>
        <form class="todos__form" @submit.prevent="onSubmit">
          <input
            v-model.number="newTodoUserId"
            class="todos__input"
            placeholder="User ID"
            required
          />
          <input
            v-model="newTodoTitle"
            class="todos__input"
            placeholder="Title"
            required
          />
          <button
            :disabled="isSubmitDisabled"
            class="todos__submit-button"
            type="submit"
          >
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
  }

  &__header {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: bold;
  }

  &__section {
    padding: 1rem;
  }

  &__filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__select,
  &__input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  &__item {
    display: flex;

    &-wrapper {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 0.375rem;
    }

    &-title {
      font-size: 1.125rem;
      font-weight: bold;
    }

    &-status {
      font-size: 1rem;
      color: #6b7280;
    }
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
    margin-top: 1rem;
    justify-content: center;
    align-items: center;

    &-button {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border-radius: 0.375rem;

      &:disabled {
        background-color: #e5e7eb;
      }
    }
  }

  &__pagination-info {
    padding: 0 1rem;
  }

  &__form {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  &__submit-button {
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.375rem;

    &:disabled {
      background-color: #e5e7eb;
    }
  }
}
</style>
