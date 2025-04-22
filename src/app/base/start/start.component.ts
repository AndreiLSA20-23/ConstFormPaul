import { Component, OnInit } from '@angular/core';
import { IStartData } from '../../models/data.model'; // Импорт интерфейса IStartData
import { START_DATA_1 } from '../../models/start-data';

// Импорт данных

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./start.component.scss']
})
export class StartComponent {
  public storage: IStartData = START_DATA_1;


}
