import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import 'rxjs/add/operator/map';


/**
 * Generated class for the MapComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'map',
  templateUrl: 'map.html'
})
export class MapDirective implements OnInit {

  private loading: any;
  public service: any;
  public map: google.maps.Map;
  public isMapIdle: boolean;
  public currentLocation: google.maps.LatLng;
  public markers = [];

  constructor(public loadingController: LoadingController,
    public nav: NavController, private geolocation: Geolocation,
    private toastCtrl: ToastController) {

  }

  createMap() {
    const mapOptions = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };


    const mapEl = document.getElementById('map_div');
    const map = new google.maps.Map(mapEl, mapOptions);
    return map;

  }

  private async presentLoading() {
    this.loading = await this.loadingController.create({
    });
    return this.loading.present();
  }

  private dismissLoading() {
    this.loading.dismiss();
  }



  ngOnInit() {
    this.map = this.createMap();
    this.getCurrentLocation().subscribe(l => {
      this.map.panTo(l);
      this.currentLocation = l;
      var marker = new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(l.lat(), l.lng())
      });
    });
    this.service = new google.maps.places.PlacesService(this.map);

    /*
        this.service = new google.maps.places.PlacesService(this.map);
        */


  }


  searchPlace(radius, tipo) {
    //https://developers.google.com/places/supported_types
    let types = ['restaurant', 'amusement_park', 'casino', 'church', 'restaurant', 'shopping_mall', 'supermarket', 'night_club', 'bar'];
    if (tipo == 'sanitario') {
      types = ['supermarket', 'airport', 'hospital', 'gas_station', 'shopping_mall'];
    }

    if (tipo == 'lavarapido') {
      types = ['car_wash'];
    }

    if (tipo == 'gnv') {
      types = ['gas_station'];
    }

    this.service.nearbySearch({
      location: this.currentLocation,
      radius: radius,
      type: types,
      rankby: 'distance',
      opennow: 'true'
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        let places = [];
        for (var x = 0, place; place = results[x]; x++) {
          if (place.opening_hours) {
            if (place.opening_hours.open_now)
              places.push(place);
          }
        }

        this.createMarkerWithDetail(places);
      }
    });
  }

  async createMarkerWithDetail(places) {
    var bounds = new google.maps.LatLngBounds();
    let toast = this.toastCtrl.create({
      message: 'Carregando lugares abertos, isso pode levar um tempo...',
      position: 'top'
    });

  
    var placeErrors = [];
    console.log(places);
    if (places.length == 0) {
      alert("Nenhum local encontrado. Atenção nosso sistema lista apenas locais abertos");
      return;
    }
    toast.present();

    for (i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }

   
    for (var i = 0, place; place = places[i]; i++) {

      var request = {
        placeId: place.place_id
      };
      await this.delay(1000);
      this.service.getDetails(request, (placeDetail, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          //Logica
          var img = '../../assets/icon/circular-notime.png';
          try {
            let date = new Date();

            var minutes = date.getMinutes();
            var hour = date.getHours();
            var dayOfWeek = date.getDay();
            var timePlaceOpen = new Date(date.getFullYear(), date.getMonth(), date.getDay(),
              placeDetail.opening_hours.periods[dayOfWeek].open.hour,
              placeDetail.opening_hours.periods[dayOfWeek].open.minutes, 0, 0);

            var timePlaceClose = new Date(date.getFullYear(), date.getMonth(), date.getDay(),
              placeDetail.opening_hours.periods[dayOfWeek].close.hour,
              placeDetail.opening_hours.periods[dayOfWeek].close.minutes, 0, 0);

            timePlaceOpen.setHours(timePlaceOpen.getHours() - 2);

            if (timePlaceOpen.getTime() >= date.getTime()) {
              img = '../../assets/icon/circular-verde.png';
              // abriu MENOS que duas horas
            } else {
              img = '../../assets/icon/circular-laranja.png';
              // abriu MAIS de duas horas
            }

            date.setHours(date.getHours() + 2);
            if (date.getTime() >= timePlaceClose.getTime()) {
              img = '../../assets/icon/circular-red.png';
              // falta 2 horas para fechar
            }
          }
          catch (err) {

          }

          var marker = new google.maps.Marker({
            map: this.map,
            icon: img,
            title: placeDetail.name,
            position: placeDetail.geometry.location
          });
          this.markers.push(marker);

        } else {
          // placeErrors.push(place.place_id);
        }
      });

      //bounds.extend(place.geometry.location);
    }

    toast.dismiss();
    //this.map.fitBounds(bounds);

  }




  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  centerLocation(location) {
    if (location) {
      this.map.panTo(location);
    } else {
      this.getCurrentLocation().subscribe(l => {
        this.map.panTo(l);
      });
    }
  }

  getCurrentLocation() {

    const options = { timeout: 10000, enableHighAccuracy: true };

    const locationObs = Observable.create(oserv => {

      this.presentLoading().then(A => {
        this.geolocation.getCurrentPosition(options).then((resp) => {
          const lat = resp.coords.latitude;
          const lng = resp.coords.longitude;

          const location = new google.maps.LatLng(lat, lng);

          this.map.panTo(location);

          oserv.next(location);

          this.dismissLoading();

        }).catch((error) => {
          this.dismissLoading();
          console.log('Geolocation error err: ' + error);
        });

      });

    });


    return locationObs;

  }



}
