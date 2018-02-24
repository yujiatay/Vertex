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
                <h5>Customer Profile</h5>
                <switches v-model="profileEnabled" theme="bootstrap" color="primary"></switches>
                Display on Map
              </li>
              <li class="nav-item">
                <h5>Target Demographics</h5>
                Age Group: 
                <vue-slider ref="slider" v-bind="demo4" v-model="demo4.value"></vue-slider>
              
                Gender:<br/>
                <p-check class="p-default p-smooth" color="primary">M</p-check>
                <p-check class="p-default p-smooth" color="primary">F</p-check>
                <br/>
                Race:<br/>
                <p-check class="p-default p-smooth" color="primary">Chinese</p-check>
                <p-check class="p-default p-smooth" color="primary">Malay</p-check>
                <p-check class="p-default p-smooth" color="primary">Indian</p-check>
                <p-check class="p-default p-smooth" color="primary">Others</p-check>
              </li>
              <li class="nav-item">
                <h5>Shop Selector</h5>
                <button v-on:click="addShop">Add Shop</button>
              </li>
              <li class="nav-item">
                <h5>Customer Coverage</h5>
                <switches v-model="coverageEnabled" theme="bootstrap" color="primary"></switches>
                Display on Map
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
import L from "leaflet";
import vueSlider from "vue-slider-component";
import Switches from "vue-switches";
import subZones from "./assets/subzones.json";

export default {
  name: "app",
  components: {
    vueSlider,
    Switches
  },
  data() {
    return {
      map: false,
      demo4: {
        value: ["20", "30"],
        width: "100%",
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
        data: ["<10", "10", "20", "30", "40", "50", "60", "70", "80", ">80"]
      },
      profileEnabled: false,
      coverageEnabled: false
    };
  },
  mounted() {
    var basemap = L.tileLayer(
      "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 15
      }
    );
    this.markers = L.layerGroup();

    this.map = L.map("map", {
      center: [1.3521, 103.8198],
      zoom: 12,
      layers: [basemap, this.markers]
    });

    L.geoJSON(subZones, {
      style: polygonStyle
    }).addTo(this.map);

    var baseMaps = {
      "Base map": basemap
    };
    var overlayMaps = {
      Shops: this.markers
    };
    L.control.layers(baseMaps, overlayMaps).addTo(this.map);

    function polygonStyle(feature) {
      return {
        fillColor: "#ffffff",
        fillOpacity: 0,
        color: "#909eb5",
        weight: 1,
        opacity: 1
      };
    }
  },
  methods: {
    addShop() {
      console.log("listen to click");
      var self = this;
      this.map.on("click", function(e) {
        console.log(e.latlng);
        var shop = L.marker(e.latlng, { draggable: "true" });
        self.markers.addLayer(shop);
        self.map.off("click");
      });
    },
    customerCoverage: function() {
      // Get authorization token to query API
      var consumerKey = "ihOcCn39Jsz8l9E9pvegjfYfKHka";
      var consumerSecret = "8NZFxflAoDjEU0J_jLuyZfJghZ0a";

      var keySecret = encodeURI(consumerKey + ":" + consumerSecret);
      var consumerKeySecretB64 = btoa(decodeURI(keySecret));

      var token;
      //   var tokenResponse = $.ajax({
      //     type: "POST",
      //     url: "https://apistore.datasparkanalytics.com:443/token",
      //     data: { grant_type: "client_credentials" },
      //     headers: {
      //       Authorization: "Basic " + consumerKeySecretB64
      //     },
      //     success: result => {
      //       token = result["access_token"];
      //     }
      //   });
      var tokenResponse = this.$http.post(
        "https://apistore.datasparkanalytics.com:443/token",
        { grant_type: "client_credentials" },
        {
          headers: {
            Authorization: "Basic " + consumerKeySecretB64
          },
          emulateJSON: true
        }
      );
      // Assign the access token to token
      tokenResponse.then(function(value) {
        token = value.body.access_token;
      });

      // Initialize query fields
      var queryBody = function(eachDate, destination_subzone_id) {
        return {
          date: eachDate,
          timeSeriesReference: "destination",
          location: {
            locationType: "locationHierarchyLevel",
            levelType: "destination_subzone",
            id: destination_subzone_id
          },
          queryGranularity: {
            type: "period",
            period: "P1D"
          },
          filter: {
            type: "bound",
            dimension: "agent_year_of_birth",
            lower: 1980,
            upper: 2000
          },
          dimensionFacets: ["origin_subzone"],
          aggregations: [
            {
              metric: "unique_agents",
              type: "hyperUnique"
            }
          ]
        };
      };

      // Get current date
      var currDate = new Date();
      // Set previous date to the last day of the previous month
      var prevDate = currDate;
      prevDate.setDate(0);
      // Debug print number of days of previous month
      console.log(prevDate.getDate());

      var aggregatedResponse = this.$http.post(
        "https://apistore.datasparkanalytics.com:443/odmatrix/v3/query",
        JSON.stringify(
          queryBody(
            prevDate.getFullYear() + "-" + prevDate.getMonth() + 1 + "-" + 1,
            "OR" // PADDED DUMMY, REPLACE WITH ACTUAL DESTINATION
          )
        ),
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          emulateJSON: true
        }
      );
      setTimeout(1000);
      console.log(aggregatedResponse);

      // Query API for all the days in the previous month
      //   for (var i = 2; i <= prevDate.getDate(); i++) {
      //     // token variable is a valid access token (see Getting Started)
      //     var queryResponse = this.$http.post(
      //       "https://apistore.datasparkanalytics.com:443/odmatrix/v3/query",
      //       {
      //         data: JSON.stringify(
      //           queryBody(
      //             prevDate.getFullYear() +
      //               "-" +
      //               prevDate.getMonth() +
      //               1 +
      //               "-" +
      //               1,
      //             "OR" // PADDED DUMMY, REPLACE WITH ACTUAL DESTINATION
      //           )
      //         )
      //       },
      //       {
      //         headers: {
      //           Authorization: "Bearer " + token,
      //           "Content-Type": "application/json"
      //         },
      //         emulateJSON: true
      //       }
      //     );
      //     setTimeout(1000);
      //     queryResponse.forEach(origin => {
      //       if (
      //         aggregatedResponse.event.origin_subzone ===
      //         origin.event.origin_subzone
      //       ) {
      //         aggregatedResponse.event.hyperUnique_unique_agents +=
      //           origin.event.hyperUnique_unique_agents;
      //       }
      //     });
      //   }
    }
  }
};
</script>

<style>
@import "../node_modules/leaflet/dist/leaflet.css";
/* @import '../node_modules/pretty-checkbox/src/pretty-checkbox.scss'; */

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
