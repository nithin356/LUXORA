
import { Car } from '../types';

const API_BASE = '/api';

export class FleetService {
  private static instance: FleetService;

  private constructor() {}

  public static getInstance(): FleetService {
    if (!FleetService.instance) {
      FleetService.instance = new FleetService();
    }
    return FleetService.instance;
  }

  public async getFleet(): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE}/fleet?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch fleet');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async addCar(formData: FormData): Promise<Car | null> {
    try {
      const response = await fetch(`${API_BASE}/fleet`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to add car');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async updateCar(id: string, formData: FormData): Promise<Car | null> {
    try {
      const response = await fetch(`${API_BASE}/fleet/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to update car');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async deleteCar(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/fleet/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async resetFleet(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/fleet/reset`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const fleetService = FleetService.getInstance();
