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
              <switches v-on:input="profileHandler" v-model="profileEnabled" theme="bootstrap" color="primary"></switches>
              Display on Map
            </li>
            <li class="nav-item">
              <h5>Target Demographics</h5>
              Age Group:
              <vue-slider v-on:input="activateTarget" ref="slider" v-bind="ageRange" v-model="ageRange.value"></vue-slider>

              Gender:<br/>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="male">M</p-check>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="female">F</p-check>
              <br/>
              Race:<br/>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="chinese">Chinese</p-check>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="malay">Malay</p-check>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="indian">Indian</p-check>
              <p-check v-on:change="activateTarget" class="p-default p-smooth" color="primary" v-model="eurasian">Eurasian</p-check>
            </li>
            <li class="nav-item">
              <h5>Shop Selector</h5>
              <button v-on:click="addShop">Add Shop</button>
            </li>
            <li class="nav-item">
              <h5>Customer Coverage</h5>
              <switches v-on:input="customerCoverage" v-model="coverageEnabled" theme="bootstrap" color="primary"></switches>
              Display on Map
            </li>

          </ul>
        </div>
      </nav>

      <div id="map" style="width: 100%; height: 100%">
      </div>
    </div>


    <div id="map" style="width: 100%; height: 100%">
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import vueSlider from "vue-slider-component";
import Switches from "vue-switches";
import subZones from "./assets/subzones.json";
import staycount from "./assets/processedStayCount";
import historicalData from "./assets/historicalData.json";
import leafletPip from "@mapbox/leaflet-pip";

export default {
  name: "app",
  components: {
    vueSlider,
    Switches
  },
  data() {
    return {
      map: false,
      ageRange: {
        value: ["20", "30"],
        width: "100%",
        height: 4,
        dotSize: 14,
        min: 1,
        max: 100,
        interval: 50,
        disabled: false,
        show: true,
        tooltip: false,
        piecewise: true,
        piecewiseLabel: true,
        data: ["<15", "20", "30", "40", "50", "60", "70", ">75"]
      },
      male: false,
      female: false,
      chinese: false,
      malay: false,
      indian: false,
      eurasian: false,
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

    function getStats(subzoneID) {
      var rawSubzoneStats = staycount[subzoneID];
      console.log(rawSubzoneStats);
      var result = {};
      var sum = 0;
      for (var i = 0; i < rawSubzoneStats["weekday"].length; i++) {
        sum += rawSubzoneStats["weekday"][i];
      }
      result["average"] = Math.floor(sum / rawSubzoneStats["weekday"].length);
      // k-greatest traffic
      // Returns topThree indexes
      function topThree(arr) {
        var first = { id: -1, value: 0 };
        var second = { id: -1, value: 0 };
        var third = { id: -1, value: 0 };
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] > first.value) {
            first.id = i;
            first.value = arr[i];
          } else if (arr[i] > second.value) {
            second.id = i;
            second.value = arr[i];
          } else if (arr[i] > third.value) {
            third.id = i;
            third.value = arr[i];
          }
        }
        return [first, second, third];
      }

      // average daily traffic
      var bestDays = topThree(rawSubzoneStats["weekday"]).map(function(obj) {
        switch (obj.id) {
          case 0:
            return { MON: obj.value };
            break;
          case 1:
            return { TUE: obj.value };
            break;
          case 2:
            return { WED: obj.value };
            break;
          case 3:
            return { THU: obj.value };
            break;
          case 4:
            return { FRI: obj.value };
            break;
          case 5:
            return { SAT: obj.value };
            break;
          case 6:
            return { SUN: obj.value };
            break;
        }
      });
      var bestHours = topThree(rawSubzoneStats["daily"]).map(function(obj) {
        var timeIndex = obj.id;
        var timeName = "";
        var result = {};
        if (timeIndex === 0) {
          timeName = "12am";
        } else if (timeIndex <= 11) {
          timeName = timeIndex + "am";
        } else if ((timeIndex = 12)) {
          timeName = timeIndex + "pm";
        } else {
          timeName = timeIndex + "pm";
        }
        result[timeName] = obj.value;
        return result;
      });

      function entryToString(full, current) {
        return (
          full +
          "  " +
          Object.keys(current)[0] +
          " (" +
          Math.floor(Object.values(current)[0]) +
          ")"
        );
      }

      console.log(result["bestDay"]);
      console.log(result["bestHour"]);
      result["bestDay"] = bestDays.reduce(entryToString, "");
      result["bestHour"] = bestHours.reduce(entryToString, "");

      return result;
    }

    this.info = L.control();

    this.info.onAdd = function(map) {
      this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
      this.update();
      return this._div;
    };
    this.info.onRemove = function(map) {
      console.log(this._div);
      this._div.remove();
    };
    // method that we will use to update the control based on feature properties passed
    this.info.update = function(subzoneName, subzoneID) {
      if (subzoneID == undefined) {
        this._div.innerHTML = "<h4>Subzone Data</h4>" + "Hover over a subzone";
      } else {
        var stats = getStats(subzoneID);
        this._div.innerHTML =
          "<h4>Subzone Data</h4>" +
          "<b>" +
          subzoneName +
          "</b><br />" +
          "<b>Daily Average:</b> " +
          stats.average +
          "<br />" +
          "<b>Peak Day:</b> " +
          stats.bestDay +
          "<br />" +
          "<b>Peak Hours:</b> " +
          stats.bestHour +
          "<br />" +
          "<i>Unit for numbers is unique visitors per day</i> <br/>";
      }
    };
  },
  methods: {
    profileHandler(value) {
      var self = this;

      function profileActivated() {
        function highlightFeature(e) {
          var layer = e.target;
          layer.setStyle({
            weight: 5,
            color: "#777",
            fillOpacity: 0.7
          });
          self.info.update(layer.feature.properties.name, layer.feature.id);
        }

        function resetHighlight(e) {
          self.profileLayer.resetStyle(e.target);
          // info.update();
        }

        function onEachSubzone(feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
          });
        }

        self.info.addTo(self.map);
        self.profileLayer = L.geoJSON(subZones, {
          style: {
            fillOpacity: 0,
            opacity: 0
          },
          onEachFeature: onEachSubzone
        }).addTo(self.map);
      }

      function profileDeactivated() {
        self.map.removeLayer(self.profileLayer);
        self.info.remove();
      }

      if (value) {
        profileActivated();
      } else {
        profileDeactivated();
      }
    },
    activateTarget(dummy) {
      var self = this;
      var processedAgeRange = self.ageRange.value.map(processAgeRange);
      var uniqueByAge = [0, 0, 0, 0, 0, 0, 0, 0]; //8-values

      function getColor(d) {
        return d > 5000 ? '#800026' :
               d > 4000 ? '#BD0026' :
               d > 3000 ? '#E31A1C' :
               d > 2000 ? '#FC4E2A' :
               d > 1000  ? '#FD8D3C' :
               d > 500   ? '#FEB24C' :
               d > 40    ? '#FFEDA0' :
                           '#ffffff'
      }

      // Return corresponding ageGroup code from age range string
      function processAgeRange(ageStr) {
        var firstChar = ageStr.charAt(0);
        switch (firstChar) {
          case "<":
            return 0;
          case ">":
            return 7;
            break;
          default:
            return parseInt(firstChar);
        }
      }

      function processGender(res) {
        if (res == undefined) {
          return;
        }

        if (!self.male && !self.female) {
          processRaces(res["F"]);
          processRaces(res["M"]);
        } else {
          if (self.male) {
            processRaces(res["M"]);
          }
          if (self.female) {
            processRaces(res["F"]);
          }
        }
      }

      function processRaces(res) {
        if (res == undefined) {
          return;
        }
        if (!self.chinese && !self.malay && !self.indian && !self.eurasian) {
          processAgeGroup(res["CHINESE"]);
          processAgeGroup(res["MALAY"]);
          processAgeGroup(res["INDIAN"]);
          processAgeGroup(res["EURASIAN"]);
        } else {
          if (self.chinese) {
            processAgeGroup(res["CHINESE"]);
          }
          if (self.malay) {
            processAgeGroup(res["MALAY"]);
          }
          if (self.indian) {
            processAgeGroup(res["INDIAN"]);
          }
          if (self.eurasian) {
            processAgeGroup(res["EURASIAN"]);
          }
        }
      }

      function processAgeGroup(res) {
        if (res == undefined) {
          return;
        }

        var len = res.length;
        for (var i = 0; i < len; i++) {
          uniqueByAge[res[i].ageGroup] +=
            res[i].uniqueAgents == 40 ? 10 : res[i].uniqueAgents;
        }
      }
      function resetUnique(){
        uniqueByAge = [0,0,0,0,0,0,0,0]
      }

      function process(res) {
        processGender(res);
        // Accumulate
        return uniqueByAge.reduce(function(a, b) {
          return a + b;
        }, 0);
      }

      function style(feature) {
        var sum = 0;
        if(feature.id in historicalData){
          resetUnique()
          sum = process(historicalData[feature.id])
          console.log(feature.id)
          console.log(sum)
        }
        return {
          fillColor: getColor(sum),
          weight: 1,
          opacity: 1,
          color: "#909eb5",
          fillOpacity: 0.7
        };
      }

      L.geoJSON(subZones, { style: style }).addTo(self.map);

      var legend = L.control({ position: "bottomright" });

      legend.onAdd = function(map) {
          var div = L.DomUtil.create('div', 'info legend'),
              grades = [40, 500, 1000, 2000, 3000, 4000, 5000],
              labels = [];

          function reduceNum(num){
            if(num >= 1000){
              return num/1000 + 'k'
            } else {
              return num;
            }
          }

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' +
            reduceNum(grades[i]) +
            (grades[i + 1]
              ? "&ndash;" + reduceNum(grades[i + 1]) + "<br>"
              : "+");
        }

        return div;
      };

      legend.addTo(self.map);
    },
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
    coverageHandler: function(toggled) {
        if (toggled) {
            customerCoverage();
        } else {

        }
    },
    customerCoverage: function() {
      /**
       * Find coverage area based on shop markers.
       * this.markers is a collection of markers, each representing one
       * layer.
       */
      var destinations = [];
      var markers = this.markers.getLayers();
      for (let marker of markers) {
        var subzones = L.geoJson(subZones);
        var latlng = marker.getLatLng();
        var subzone = leafletPip.pointInLayer(
          [latlng.lng, latlng.lat],
          subzones,
          true
        );
        destinations.push(subzone[0].feature.id);
      }

      // Get authorization token to query API
      var consumerKey = "ihOcCn39Jsz8l9E9pvegjfYfKHka";
      var consumerSecret = "8NZFxflAoDjEU0J_jLuyZfJghZ0a";

      var keySecret = encodeURI(consumerKey + ":" + consumerSecret);
      var consumerKeySecretB64 = btoa(decodeURI(keySecret));

      var token = "4d10fa99-6da1-357a-8bbb-82c3b00aeaa0";
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
      //   tokenResponse.then(function(value) {
      //     return value.body.access_token;
      //   });

      // Initialize query fields
      var queryBody = function(
        eachDate,
        destination_type,
        destination_subzone_id
      ) {
        return {
          date: eachDate,
          timeSeriesReference: "destination",
          location: {
            locationType: "locationHierarchyLevel",
            levelType: destination_type,
            id: destination_subzone_id
          },
          queryGranularity: {
            type: "period",
            period: "P1D"
          },
          //   filter: {
          //     type: "bound",
          //     dimension: "agent_year_of_birth",
          //     lower: 1980,
          //     upper: 2000
          //   },
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

      // Initalize all sampling dates in the beginning.
      var samplingDates = [];
      for (let num = 1; num <= prevDate.getDate(); num++) {
        samplingDates.push(num);
      }

      /**
       * Random sampling.
       * Randomly removes certains dates of the month from the array prevDate.
       * Number of dates to remove depend on the number of markers (i.e. shops)
       * that were placed on the map.
       *
       * Pre-condition: Max no. of shops = 3.
       * Post-condition: Number of days of sampled data will be
       * (num of days in month) / (no. of shops)
       */
      for (
        let days = samplingDates.length * (1 - 1 / destinations.length);
        days >= 0;
        days--
      ) {
        samplingDates.splice(
          Math.floor(Math.random() * samplingDates.length),
          1
        );
      }

      // Function to send query to ODmatrix API and get back a promise
      var self = this;
      function queryResponse(day, destination) {
        return self.$http.post(
          "https://apistore.datasparkanalytics.com:443/odmatrix/v3/query",
          JSON.stringify(
            queryBody(
              prevDate.getFullYear() +
                "-" +
                prevDate.getMonth() +
                1 +
                "-" +
                day,
              "destination_subzone",
              destination // based on destinations from markers
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
      }

      /**
       * Constructor for aggregated response.
       */
      function aggregated_response(destination) {
        this.origin_subzones = {};
        this.destination_subzone = destination;
        this.month = prevDate.getMonth();
        this.promises = [];
        this.numDays = samplingDates.length;
      }

      // Initialize aggregatedResponse with the 1st day statistics
      //   var firstResponse = queryResponse(1);
      function origin_subzone_constructor(subzone_id, unique_agents, name) {
        this.id = subzone_id;
        this.unique_agents = unique_agents;
        this.name = name;
      }

      /**
       * Constructs aggregatedResponses hash object for storing multiple
       * aggregatedResponses.
       */
      var aggregatedResponses = {};
      for (let destination of destinations) {
        aggregatedResponses[destination] = new aggregated_response(destination);
      }

      // Query API for all the days in the previous month
      var promises = [];
      for (let destination of destinations) {
        for (var i = 1; i <= prevDate.getDate(); i++) {
          var response = queryResponse(i, destination);
          aggregatedResponses[destination].promises.push(response);
        }
      }

      /**
       * Pre-condition: No useless NA data
       * Post-condition: aggregatedResponse is fully stocked with statistics
       * for the previous month
       */
      for (let destination of destinations) {
        Promise.all(aggregatedResponses[destination].promises).then(function(
          responses
        ) {
          for (let response of responses) {
            for (let origin of response.body) {
              if (
                typeof aggregatedResponses[destination].origin_subzones[
                  origin.event.origin_subzone
                ] === "undefined"
              ) {
                aggregatedResponses[destination].origin_subzones[
                  origin.event.origin_subzone
                ] = new origin_subzone_constructor(
                  origin.event.origin_subzone,
                  origin.event.hyperUnique_unique_agents,
                  "" // PADDED DUMMY, REPLACE WITH ACTUAL NAME OF ORIGIN SUBZONE WHEN AVAIL
                );
              } else {
                aggregatedResponses[destination].origin_subzones[
                  origin.event.origin_subzone
                ].unique_agents +=
                  origin.event.hyperUnique_unique_agents;
              }
            }
          }
          console.log(aggregatedResponses[destination]);
        });
      }
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
.legend {
    vertical-align: top;
    line-height: 20px;
    color: #555;
}
.legend i {
    vertical-align: top;
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.7;
}
.info {
    padding: 6px 8px;
    /* font: 14px/16px Arial, Helvetica, sans-serif; */
    background: white;
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    border-radius: 5px;
}

.info h4 {
  margin: 0 0 5px;
  color: #777;
}
</style>
