const APP_ID = '5bb8dd0f-cc69-4f05-8920-f6cc4fd6dad7';
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://holy8jauyk.lastapp.dev';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function initializeUser() {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'users',
      data: {
        provider: 'anonymous',
      },
    }),
  });
}

export async function getDocuments(userId: string) {
  return apiRequest(`/data?app_id=${APP_ID}&table_name=documents&user_id=${userId}`, {
    method: 'GET',
  });
}

export async function createDocument(document: any) {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'documents',
      data: document,
    }),
  });
}

export async function updateDocument(document: any) {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'documents',
      data: document,
    }),
  });
}

export async function getVariables(documentId: string) {
  return apiRequest(`/data?app_id=${APP_ID}&table_name=variables&document_id=${documentId}`, {
    method: 'GET',
  });
}

export async function createVariable(variable: any) {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'variables',
      data: variable,
    }),
  });
}

export async function updateVariable(variable: any) {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'variables',
      data: variable,
    }),
  });
}

export async function createAIInteraction(interaction: any) {
  return apiRequest('/data', {
    method: 'POST',
    body: JSON.stringify({
      app_id: APP_ID,
      table_name: 'ai_interactions',
      data: interaction,
    }),
  });
}

export async function queryAI(query: string) {
  const formData = new URLSearchParams();
  formData.append('app_id', APP_ID);
  formData.append('query', query);

  const response = await fetch(`${BASE_URL}/aiapi/answertext`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`AI query failed: ${response.statusText}`);
  }

  return await response.json();
}