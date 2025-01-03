import { defineStore } from 'pinia';
import type { Todo } from "~/types/types";
import { TodoStatus } from "~/types/types";
import { reactive, ref } from 'vue'

export const useTodoStore = defineStore('todo', () => {
	const todos = ref<Todo[]>([]);
	const favorites = ref<number[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
	const filters= reactive<{status: TodoStatus, search: string, id: number | string}>({ status: TodoStatus.All, search: '', id: "All users"})
	const loading = ref(true);
	
	const addTodo = (userId: number, title: string) => {
		const newTodo: Todo = {
			id: userId,
			userId,
			title,
			completed: false,
		};
		todos.value = [newTodo, ...todos.value];
	};
	
	const fetchTodos = async () => {
		loading.value = true;
		try {
			const { data } = await useFetch<Todo[]>(`${useRuntimeConfig().public.apiBase}/todos`);
			todos.value = data.value || [];
		} finally {
			loading.value = false;
		}
	};
	
	const toggleFavorite = (todoId: number) => {
		if (favorites.value.includes(todoId)) {
			favorites.value = favorites.value.filter((id) => id !== todoId)
		} else {
			favorites.value.push(todoId)
		}
		localStorage.setItem('favorites', JSON.stringify(favorites.value))
	}
	
	const loadFavorites = () => {
		const storedFavorites = localStorage.getItem('favorites')
		if (storedFavorites) {
			favorites.value = JSON.parse(storedFavorites)
		}
	}
	
	const filteredTodos = computed(() => {
		return todos.value.filter((todo: Todo) => {
			const statusConditions: Record<TodoStatus, (todo: Todo) => boolean> = {
				[TodoStatus.All]: () => true,
				[TodoStatus.Completed]: (todo) => todo.completed,
				[TodoStatus.Uncompleted]: (todo) => !todo.completed,
				[TodoStatus.Favorites]: (todo) => favorites.value.includes(todo.id),
			};
			
			const matchesStatus = statusConditions[filters.status](todo);
			
			const matchesFilter = filters.search
				? todo.title.toLowerCase().includes(filters.search.toLowerCase())
				: true;
			
		
			const matchesId = filters.id !== "All users"
				? todo.id === filters.id
				: true;
			
			return matchesStatus && matchesFilter && matchesId;
		});
	});
	
	return { favorites, toggleFavorite, fetchTodos, loadFavorites, filteredTodos, filters, loading, addTodo };
});