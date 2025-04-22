import { Component, OnInit } from '@angular/core';
import { IStartData } from '../../models/data.model'; // Импорт интерфейса IStartData
import { START_DATA_1 } from '../../models/start-data';


@Component({
  selector: 'app-req',
  imports: [],
  templateUrl: './req.component.html',
  standalone: true,
  styleUrls: ['./req.component.scss']
})
export class ReqComponent  {
  public storage: IStartData = START_DATA_1;

}
