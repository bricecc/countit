import { Counter, UserProfile, AuthResponse } from '../types';

const STORAGE_KEY = 'countit_data_v1';
const USER_KEY = 'countit_user_v1';
const TOKEN_KEY = 'countit_token_v1';

// Mock DB Keys for Preview Mode (Simulates a server DB in LocalStorage)
const MOCK_USERS_KEY = 'countit_mock_users_db';
const MOCK_REMOTE_DATA_KEY = 'countit_mock_remote_data_db';

const API_URL = 'http://localhost:3001/api';

// --- Auth Helpers ---

export const getStoredUser = (): { user: UserProfile | null, token: string | null } => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token: token || null
    };
  } catch {
    return { user: null, token: null };
  }
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

const storeAuth = (data: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

// --- Mock Helpers ---

const getUserIdFromMockToken = (token: string) => {
  if (!token || !token.startsWith('mock-token-')) return null;
  return token.split('mock-token-')[1];
};

const mockRegister = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network delay
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.username === username)) {
    throw new Error('Username already exists (Demo Mode)');
  }

  const newUser = { id: Date.now(), username, email, password }; 
  users.push(newUser);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

  const token = `mock-token-${newUser.id}`;
  const response = { token, user: { id: newUser.id, username, email } };
  storeAuth(response);
  return response;
};

const mockLogin = async (username: string, password: string): Promise<AuthResponse> => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network delay
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const user = users.find((u: any) => u.username === username && u.password === password);

  if (!user) {
    throw new Error('Invalid credentials (Demo Mode)');
  }

  const token = `mock-token-${user.id}`;
  const response = { token, user: { id: user.id, username: user.username, email: user.email } };
  storeAuth(response);
  return response;
};

// --- Data Operations ---

export const loadCounters = async (token?: string | null): Promise<Counter[]> => {
  // 1. Try Real Server
  if (token && !token.startsWith('mock-token-')) {
    try {
      const res = await fetch(`${API_URL}/counters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn('Server unreachable, falling back to local or mock.');
    }
  }

  // 2. Try Mock Cloud (if using mock token)
  if (token && token.startsWith('mock-token-')) {
    const userId = getUserIdFromMockToken(token);
    if (userId) {
      const allRemoteData = JSON.parse(localStorage.getItem(MOCK_REMOTE_DATA_KEY) || '{}');
      const userCounters = allRemoteData[userId] || [];
      // Sync Mock Remote -> Local Cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userCounters));
      return userCounters;
    }
  }
  
  // 3. Fallback to local storage (Guest or Offline)
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load local counters', error);
    return [];
  }
};

export const saveCounters = async (counters: Counter[], token?: string | null): Promise<void> => {
  // Always save locally first (optimistic UI)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
  } catch (error) {
    console.error('Failed to save local counters', error);
  }

  // If logged in
  if (token) {
    // 1. Try Real Server
    if (!token.startsWith('mock-token-')) {
      try {
        await fetch(`${API_URL}/counters/sync`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(counters)
        });
        return;
      } catch (error) {
        console.warn('Server unreachable for sync.');
        // Fallthrough to mock if server fails? 
        // For this demo, if real token fails, we can't easily fallback to mock DB without re-login.
        // But if we are in this block, we likely have a real token.
      }
    }

    // 2. Mock Cloud Sync (Preview Mode)
    if (token.startsWith('mock-token-')) {
      const userId = getUserIdFromMockToken(token);
      if(userId) {
         const allRemoteData = JSON.parse(localStorage.getItem(MOCK_REMOTE_DATA_KEY) || '{}');
         allRemoteData[userId] = counters;
         localStorage.setItem(MOCK_REMOTE_DATA_KEY, JSON.stringify(allRemoteData));
         // Simulate network delay
         await new Promise(r => setTimeout(r, 300));
      }
    }
  }
};

// --- Auth API ---

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    storeAuth(data);
    return data;
  } catch (e) {
    console.warn("Server unavailable, trying mock login...");
    return mockLogin(username, password);
  }
};

export const registerUser = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    storeAuth(data);
    return data;
  } catch (e) {
    console.warn("Server unavailable, trying mock register...");
    return mockRegister(username, email, password);
  }
};

// --- Portable Database Logic (JSON) ---

export const exportData = (counters: Counter[]): string => {
  const data = {
    version: 1,
    timestamp: Date.now(),
    counters
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): Counter[] => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.counters || !Array.isArray(data.counters)) {
      throw new Error("Invalid data format");
    }
    const validCounters = data.counters.filter((c: any) => c.id && typeof c.count === 'number');
    return validCounters;
  } catch (error) {
    throw new Error("Failed to parse import file");
  }
};

export const downloadBackup = (counters: Counter[]) => {
  const json = exportData(counters);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `countit_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};