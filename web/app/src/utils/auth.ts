import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'Client-Token';

let memoryToken = '';

export function getToken(): string {
  return memoryToken;
}

export async function hydrateToken(): Promise<string> {
  memoryToken = (await AsyncStorage.getItem(TOKEN_KEY)) || '';
  return memoryToken;
}

export async function setToken(token: string): Promise<void> {
  memoryToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  memoryToken = '';
  await AsyncStorage.removeItem(TOKEN_KEY);
}
