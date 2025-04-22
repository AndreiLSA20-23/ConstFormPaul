export class ProfileDatabase {
  private db: IDBDatabase | null = null;

  constructor(private dbName: string = "StepsDB", private storeName: string = "profiles") {
    this.openDatabase();
  }

  // Открытие базы данных
  private openDatabase(): void {
    const openRequest = indexedDB.open(this.dbName, 1);

    openRequest.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      const objectStore = db.createObjectStore(this.storeName, { keyPath: ["ssn", "bday"] });
      objectStore.createIndex("ssn_bday", ["ssn", "bday"], { unique: true });
    };

    openRequest.onsuccess = (event: any) => {
      this.db = event.target.result as IDBDatabase;
    };

    openRequest.onerror = (event: any) => {
      console.error("Database error:", event.target.error);
    };
  }

  // Сохранение статуса шага в базе данных
  saveStepStatus(ssn: string, bday: string, stepKey: string, isFilled: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);

      const profile = { ssn, bday, stepKey, isFilled };
      const request = objectStore.put(profile); // Добавляем или обновляем профиль

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(`Error saving step status: ${event.target.error}`);
    });
  }

  // Чтение статуса шага из базы данных
  checkStepStatus(ssn: string, bday: string, stepKey: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);

      const request = objectStore.get([ssn, bday]);

      request.onsuccess = (event: any) => {
        const profile = event.target.result;
        if (profile && profile.stepKey === stepKey) {
          resolve(profile.isFilled); // Возвращаем статус шага
        } else {
          resolve(false); // Шаг не найден или не заполнен
        }
      };

      request.onerror = (event: any) => reject(`Error fetching step status: ${event.target.error}`);
    });
  }

  // Проверка существования профиля в базе данных
  checkProfileExistence(ssn: string, bday: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Database not initialized");
        return;
      }

      const transaction = this.db.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);

      const request = objectStore.get([ssn, bday]);

      request.onsuccess = (event: any) => {
        const profile = event.target.result;
        resolve(!!profile); // Если профиль найден, возвращаем true
      };

      request.onerror = (event: any) => reject(`Error fetching profile: ${event.target.error}`);
    });
  }
}
