import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://cfjymjyeaobrglvybrwn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmanltanllYW9icmdsdnlicnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MjczOTksImV4cCI6MjA1ODUwMzM5OX0.DiRv-MGLA9HCeFpafdG1vvIoPx7GA9T4cbdXinZ-32M';

// Crear un almacenamiento personalizado que funcione tanto en web como en Node.js
const customStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined') {
        return AsyncStorage.getItem(key);
      }
      return Promise.resolve(null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        return AsyncStorage.setItem(key, value);
      }
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        return AsyncStorage.removeItem(key);
      }
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
