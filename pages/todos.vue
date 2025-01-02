<script setup lang="ts">
import { useUserStore } from "~/store/user";
import { useTodoStore } from "~/store/todos";
import { storeToRefs } from "pinia";
import { TodoStatus } from "~/types/types";
import { ref, computed, onBeforeMount } from 'vue';

const userStore = useUserStore();
const todoStore = useTodoStore();
const user = userStore.user;
const { favorites, filteredTodos, todos, filters, loading } = storeToRefs(todoStore);

const newTodoUserId = ref<number>();
const newTodoTitle = ref('');

const userIds = computed(() => Array.from(new Set(todos.value.map(todo => todo.userId))));

const page = ref(1);
const itemsPerPage = 5;

const paginatedTodos = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredTodos.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredTodos.value.length / itemsPerPage));

const onSubmit = () => {
  todoStore.addTodo(newTodoUserId.value!, newTodoTitle.value);

  // Очищення форми
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
          <input v-model="filters.search" placeholder="Search by title" class="todos__input"/>
        </div>

        <template v-if="paginatedTodos.length > 0">
          <ul class="todos__list">
            <li v-for="todo in paginatedTodos" :key="todo.id" class="todos__item-wrapper">
              <div class="todos__item">
                <h2 class="todos__item-title">{{ todo.title }}</h2>
                <button
                  @click="todoStore.toggleFavorite(todo.id)"
                  class="todos__favorite-button"
                >
                  <Icon name="mdi-heart" :class="favorites.includes(todo.id) ? 'todos__favorite' : 'todos__not-favorite'"/>
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
            @click="page--"
            class="todos__pagination-button"
          >
            Previous
          </button>
          <span class="todos__pagination-info">Page {{ page }} of {{ totalPages }}</span>
          <button
            :disabled="page >= totalPages"
            @click="page++"
            class="todos__pagination-button"
          >
            Next
          </button>
        </div>
      </section>

      <section class="todos__section">
        <h2 class="todos__section-title">Create Todo</h2>
        <form @submit.prevent="onSubmit" class="todos__form">
          <input
            v-model.number="newTodoUserId"
            placeholder="User ID"
            class="todos__input"
            required
          />
          <input
            v-model="newTodoTitle"
            placeholder="Title"
            class="todos__input"
            required
          />
          <button
            type="submit"
            class="todos__submit-button"
            :disabled="isSubmitDisabled"
          >
            Add
          </button>
        </form>
      </section>
    </div>
  </template>
</template>

<style scoped lang="scss">
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
