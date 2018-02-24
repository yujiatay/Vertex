<template>
  <div>
    <div id="map" style="width: 100%; height: 100%">
    </div>
  </div>
</template>

<script>
// import Vue2Leaflet from 'vue2-leaflet';
import L from 'leaflet';
import subZones from '../assets/subzones.json';

export default {
  name: 'map',
  data () {
    return {
        map: false
    }
  },
  mounted () {
      this.map = L.map('map').setView([1.3521, 103.8198], 12);
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 15,
      }).addTo(this.map);

      L.geoJSON(subZones, {
          style: polygonStyle
      }).addTo(this.map);

      function polygonStyle (feature) {
          return {
              fillColor: '#ffffff', 
              fillOpacity: 0,
              color: '#909eb5',
              weight: 1,
              opacity: 1,
          };
      }
  }
}
</script>