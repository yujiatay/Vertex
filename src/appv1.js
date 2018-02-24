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


  import VueResource from 'vue-resource'
  Vue.use(VueResource);