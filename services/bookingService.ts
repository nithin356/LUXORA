
export interface BookingEnquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  carId: string;
  carModel: string;
  pickupDate: string;
  duration: string;
  message?: string;
  status: 'pending' | 'viewed' | 'contacted';
  timestamp: number;
}

const API_BASE = '/api';

export class BookingService {
  private static instance: BookingService;

  private constructor() {}

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  public async getEnquiries(): Promise<BookingEnquiry[]> {
    try {
      const response = await fetch(`${API_BASE}/enquiries`);
      if (!response.ok) throw new Error('Failed to fetch enquiries');
      const data = await response.json();
      return data.sort((a: BookingEnquiry, b: BookingEnquiry) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async addEnquiry(data: Omit<BookingEnquiry, 'id' | 'status' | 'timestamp'> | FormData): Promise<BookingEnquiry | null> {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add enquiry');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async updateStatus(id: string, status: BookingEnquiry['status']): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deleteEnquiry(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/enquiries/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const bookingService = BookingService.getInstance();
