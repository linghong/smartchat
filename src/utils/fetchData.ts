const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchData = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}/api/${endpoint}`)

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint}: ${response.statusText}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return {
      props: {
        error: "Failed to fetch data."
      }
    }
  }
}