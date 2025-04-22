import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditArrayService<T> {
  private array: T[] = []; // Массив для хранения объектов

  /**
   * Добавление элемента в массив.
   * @param obj Объект, который нужно добавить.
   * @returns `true`, если добавление прошло успешно, иначе `false`.
   */
  addItem(obj: T): boolean {
    if (!obj) {
      console.error('Add operation failed: object is undefined or null.');
      return false;
    }
    this.array.push(obj);
    console.log('Item added successfully:', obj);
    return true;
  }

  /**
   * Редактирование элемента в массиве.
   * @param obj Новый объект для замены.
   * @param index Индекс объекта в массиве.
   * @returns `true`, если редактирование прошло успешно, иначе `false`.
   */
  editItem(obj: T, index: number): boolean {
    if (!obj) {
      console.error('Edit operation failed: object is undefined or null.');
      return false;
    }
    if (index < 0 || index >= this.array.length) {
      console.error(`Edit operation failed: index ${index} is out of bounds.`);
      return false;
    }
    this.array[index] = obj;
    console.log(`Item at index ${index} edited successfully:`, obj);
    return true;
  }

  /**
   * Удаление элемента из массива.
   * @param index Индекс объекта в массиве.
   * @returns `true`, если удаление прошло успешно, иначе `false`.
   */
  removeItem(index: number): boolean {
    if (index < 0 || index >= this.array.length) {
      console.error(`Remove operation failed: index ${index} is out of bounds.`);
      return false;
    }
    const removedItem = this.array.splice(index, 1)[0];
    console.log(`Item removed successfully at index ${index}:`, removedItem);
    return true;
  }

  /**
   * Получение копии массива.
   * @returns Копия массива.
   */
  getArray(): T[] {
    console.log('Array retrieved:', this.array);
    return [...this.array];
  }

  /**
   * Установка нового массива.
   * @param arr Новый массив объектов.
   * @returns `true`, если массив был успешно установлен, иначе `false`.
   */
  setArray(arr: T[]): boolean {
    if (!Array.isArray(arr)) {
      console.error('Set array operation failed: input is not a valid array.');
      return false;
    }
    this.array = [...arr];
    console.log('Array replaced successfully:', arr);
    return true;
  }

  /**
   * Получение элемента по индексу.
   * @param index Индекс объекта в массиве.
   * @returns Объект или `null`, если индекс некорректен.
   */
  getItem(index: number): T | null {
    if (index < 0 || index >= this.array.length) {
      console.error(`Get item operation failed: index ${index} is out of bounds.`);
      return null;
    }
    const item = this.array[index];
    console.log(`Item retrieved at index ${index}:`, item);
    return item;
  }

  /**
   * Очистка массива.
   */
  clearArray(): void {
    this.array = [];
    console.log('Array cleared successfully.');
  }

  /**
   * Проверка наличия объекта в массиве.
   * @param predicate Функция-предикат для проверки.
   * @returns `true`, если объект найден, иначе `false`.
   */
  contains(predicate: (item: T) => boolean): boolean {
    const result = this.array.some(predicate);
    console.log('Contains operation result:', result);
    return result;
  }

  /**
   * Добавление уникального объекта в массив.
   * @param obj Объект, который нужно добавить.
   * @param predicate Функция-предикат для проверки уникальности.
   * @returns `true`, если объект был успешно добавлен, иначе `false`.
   */
  addUniqueItem(obj: T, predicate: (item: T) => boolean): boolean {
    if (this.contains(predicate)) {
      console.error('Add unique operation failed: duplicate item detected.', obj);
      return false;
    }
    return this.addItem(obj);
  }
}
