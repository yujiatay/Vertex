<template>
  <div id="app">
    <div class="d-flex flex-column flex-md-row align-items-center p-2 px-md-4 bg-dark border-bottom box-shadow">
      <h5 class="my-0 mr-md-auto font-weight-normal text-light">VERTEX</h5>
      <nav class="my-2 my-md-0 mr-md-3">
        <a class="p-2 text-light" href="#">Home</a>
        <a class="p-2 text-light" href="#">About</a>
      </nav>
      <a class="btn btn-outline-primary" href="#">Sign out</a>
    </div>

    <div id="section" class="container-fluid">
        <nav class="col-md-3 d-none d-md-block sidebar">
          <div class="sidebar-sticky">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link active" href="#">
                  Customer Profile
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Target Demographics
                </a>
                Age Group:
                <vue-slider ref="slider" v-bind="demo4" v-model="demo4.value"></vue-slider>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Shop Selector
                </a>
                <button v-on:click="addShop">Add Shop</button>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Customer Coverage
                </a>
              </li>
            </ul>
            </div>
        </nav>
      
        <div id="map" style="width: 100%; height: 100%">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import vueSlider from 'vue-slider-component'
import subZones from './assets/subzones.json';

export default {
  name: 'app',
  components: {
    vueSlider,
  },
  data () {
    return {
      map: false,
      demo4: {
        value: ['20', '30'],
        width: '100%',
        height: 4,
        dotSize: 14,
        min: 1,
        max: 100,
        interval: 3,
        disabled: false,
        show: true,
        tooltip: false,
        piecewise: true,
        piecewiseLabel: true,
        data: [
          '<10',
          '10',
          '20',
          '30',
          '40',
          '50',
          '60',
          '70',
          '80',
          '>80',
        ]
      },
    }
  }, 
  mounted () {
      var basemap = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 15,
      });
      this.markers = L.layerGroup();

      this.map = L.map('map', {
        center: [1.3521, 103.8198],
        zoom: 12,
        layers: [basemap, this.markers]
      });


      L.geoJSON(subZones, {
          style: polygonStyle
      }).addTo(this.map);

      var baseMaps = {
        "Base map": basemap,
      }
      var overlayMaps = {
        "Shops": this.markers,
      }
      L.control.layers(baseMaps, overlayMaps).addTo(this.map);

      function polygonStyle (feature) {
          return {
              fillColor: '#ffffff', 
              fillOpacity: 0,
              color: '#909eb5',
              weight: 1,
              opacity: 1,
          };
      }
  },
  methods: {
    addShop () {
      console.log('listen to click')
      var self = this;
      this.map.on('click', function(e) {
        console.log(e.latlng)
        var shop = L.marker(e.latlng, { draggable: 'true' })
        self.markers.addLayer(shop);
        self.map.off('click')
      })
    },
    createMarker (latitude, longitude) {
      L.marker([latitude, longitude]).addTo(map)
    }
  }
}
</script>

<style>
@import "../node_modules/leaflet/dist/leaflet.css";

#section {
  display: flex;
  flex-flow: row;
  /* top: 50px; */
  width: 100%;
  height: 90vh;
  margin: 0;
  padding: 0;
}

#full_div {
  /* position: absolute; */
  flex: 1;
  /* overflow: auto; */
  /* top: 55px;
  right: 0;
  left: 300px;
  bottom: 0; */
  /* padding-left: 8px; */
  /* border-left: 1px solid #ccc; */
}

</style>
