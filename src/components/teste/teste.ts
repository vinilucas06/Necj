import { Component } from '@angular/core';

/**
 * Generated class for the TesteComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'teste',
  templateUrl: 'teste.html'
})
export class TesteComponent {

  text: string;

  constructor() {
    console.log('Hello TesteComponent Component');
    this.text = 'Hello World';
    /* var date = new Date;    //location = new google.maps.LatLng(-25.4289541, -49.267137)
        //  center: location,
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hour = date.getHours();

    var year = date.getFullYear();
    var month = date.getMonth(); // beware: January = 0; February = 1, etc.
    var day = date.getDate();
    var dayOfWeek = date.getDay();

    console.log(hour);
    console.log(minutes);
    console.log(day);
    console.log(dayOfWeek);*/
  }

}
