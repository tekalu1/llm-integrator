import type { ApiItem } from "~/types/item/api"

export async function executeStep(apiItem: ApiItem) {
  console.log("apiItem", apiItem)
  try {
    const response = await fetch('/api/execute-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiItem })
    })
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      result: data,
      error: "",
    }
  } catch (e: any) {
    return {
      result: {},
      error: e.message
    }
  }
}
