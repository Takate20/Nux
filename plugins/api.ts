export default defineNuxtPlugin(() => {
	const fetchApi = async (url: string) => {
		const response = await fetch(url)
		return response.json()
	}
	return { provide: { api: fetchApi } }
})
