import { Injectable, signal } from '@angular/core';



export interface Toast{
  id : number;
  message : string;
  type : 'success' | 'error' | 'info';
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts = signal<Toast[]>([]);
  private nextId = 0;
  show(message : string , type: Toast['type'] = 'info'):void{
    const id = this.nextId++;
    this.toasts.update(list => [...list,{id,message,type}]);
    setTimeout(() =>this.dismiss(id),3500);
  }dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }



  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
  constructor() { }
}
