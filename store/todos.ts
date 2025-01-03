import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useUserStore } from "~/store/user";
import type { Todo } from "~/types/types";
import { TodoStatus } from "~/types/types";

export const useTodoStore = defineStore('todo', () => {
	const todos = ref<Todo[]>([]);
	const favorites = ref<Record<number, number[]>>(JSON.parse(localStorage.getItem('favorites') || '{}'));
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

	const toggleFavorite = (userId: number, todoId: number) => {
		if (!favorites.value[userId]) {
			favorites.value[userId] = [];
		}

		if (favorites.value[userId].includes(todoId)) {
			favorites.value[userId] = favorites.value[userId].filter((id) => id !== todoId);
		} else {
			favorites.value[userId].push(todoId);
		}

		localStorage.setItem('favorites', JSON.stringify(favorites.value));
	};

	const loadFavorites = () => {
		const storedFavorites = localStorage.getItem('favorites');
		if (storedFavorites) {
			favorites.value = JSON.parse(storedFavorites);
		}
	};

	const getUserFavorites = (userId: number): number[] => {
		return favorites.value[userId] || [];
	};

	const filteredTodos = computed(() => {
		return todos.value.filter((todo: Todo) => {
			const statusConditions: Record<TodoStatus, (todo: Todo) => boolean> = {
				[TodoStatus.All]: () => true,
				[TodoStatus.Completed]: (todo) => todo.completed,
				[TodoStatus.Uncompleted]: (todo) => !todo.completed,
				[TodoStatus.Favorites]: (todo) => {
					const user = useUserStore().user
					if(user) {
						return favorites.value[user.id].includes(todo.id);
					} else {
						return false
					}
				}
			};

			const matchesStatus = statusConditions[filters.status](todo);

			const matchesFilter = filters.search
				? todo.title.toLowerCase().includes(filters.search.toLowerCase())
				: true;

			const matchesId = filters.id !== "All users"
				? todo.userId === filters.id
				: true;

			return matchesStatus && matchesFilter && matchesId;
		});
	});
	
	return { favorites, toggleFavorite, fetchTodos, loadFavorites, filteredTodos, todos, filters, loading, addTodo, getUserFavorites };
});