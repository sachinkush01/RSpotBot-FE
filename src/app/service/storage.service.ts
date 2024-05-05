import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  async setPreference(dataKey: string, dataValue: string) {
    try {
      await Preferences.set({ key: dataKey, value: dataValue });
    } catch (error) {
      console.error('Error setting preference:', error);
      throw error;
    }
  }

  async getPreference(dataKey: string): Promise<any> {
    try {
      const result = await Preferences.get({ key: dataKey });
      return result.value;
    } catch (error) {
      console.error('Error getting preference:', error);
      throw error;
    }
  }

  async removePreference(dataKey: string): Promise<any> {
    try {
      await Preferences.remove({ key: dataKey });
    } catch (error) {
      console.error('Error getting preference:', error);
      throw error;
    }
  }

  async clearPreference() {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error setting preference:', error);
      throw error;
    }
  }
}
