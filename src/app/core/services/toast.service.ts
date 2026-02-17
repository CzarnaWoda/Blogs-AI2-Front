import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  get toasts() {
    return this.toastsSignal.asReadonly();
  }

  show(title: string, message: string, type: ToastType = 'info', duration: number = 3000): void {
    const toast: Toast = {
      id: this.nextId++,
      title,
      message,
      type,
      duration
    };

    this.toastsSignal.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show('Sukces', message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show('Błąd', message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show('Info', message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show('Uwaga', message, 'warning', duration);
  }

  remove(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
