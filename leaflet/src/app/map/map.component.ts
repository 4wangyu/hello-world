import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';

const SingaporeLatLng: L.LatLngExpression = [ 1.3521, 103.8198 ];
const customIcon = L.icon({
  iconUrl: 'https://cdn4.iconfinder.com/data/icons/vehicle-and-transporter-4/64/Cargo-ship-boat-cruise-transport-marine-vessel-512.png',

  iconSize:     [38, 95], // size of the icon
  shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  map: L.Map;

  get zoom(): number {
    return this.map?.getZoom() ?? 10;
  }

  get lat(): number {
    return this.map?.getCenter().lat ?? 1.3521;
  }

  get lng(): number {
    return this.map?.getCenter().lng ?? 103.8198;
  }

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
  }


  private initMap(): void {
    this.map = L.map('map', {
      center: SingaporeLatLng,
      zoom: 10,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxZoom: 12,
      attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    L.marker(SingaporeLatLng).addTo(this.map).bindTooltip('I am a marker.');

    L.marker([ 1.2021, 103.9198 ], {icon: customIcon}).addTo(this.map).bindTooltip('I am a custom marker.');

    L.circle([ 1.3021, 103.8198 ], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 1,
        radius: 1000
    }).addTo(this.map).bindTooltip('I am a circle.');

    L.polyline([
      [ 1.1, 103 ],
      [ 1.15, 103.8 ],
      [ 1.25, 104 ],
      [ 1.5, 105 ]]).addTo(this.map);
  }

  setZoom(x: number) {
    this.map.setZoom(x);
  }

  setLat(x: number) {
    this.map.flyTo([x, this.lng], 10);
  }

  setLng(x: number) {
    this.map.flyTo([this.lat, x], 10);
  }

  reset() {
    this.map.flyTo(SingaporeLatLng, 10);
  }
}
