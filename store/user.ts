import { defineStore } from 'pinia';
import type { User } from "~/types/types";
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
	const user = ref<User | null>(null);
	const error = ref<string | null>(null);
	
	const router = useRouter();
	
	const initializeUser = () => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			user.value = JSON.parse(storedUser);
		}
	};
	
	const login = async (username: string, phone: string) => {
		const users: User[] = await $fetch(`${useRuntimeConfig().public.apiBase}/users`);
		const foundUser = users.find((u) => u.username === username && u.phone === phone);
		
		if (foundUser) {
			localStorage.setItem('user', JSON.stringify(foundUser));
			user.value = foundUser;

			await router.push('/');
		} else {
			error.value = 'login error'
		}
	};
	
	const logout = async () => {
		user.value = null;
		localStorage.removeItem('user')
		await router.push('/login');
	};
	
	return { user, login, logout, error, initializeUser };
});
