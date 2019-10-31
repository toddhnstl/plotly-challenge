function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(function(sampleResult) {
    //console.log(sampleResult);
    
    // Use d3 to select the panel with id of `#sample-metadata`
    smplRsltsHtml = d3.select("#sample-metadata");
    
    // Use `.html("") to clear any existing metadata
    smplRsltsHtml.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    // sampleResult.forEach(function(sampleResult) {
    //   console.log(sampleResult);
    //   //var row = tbody.append("tr");
    
      Object.entries(sampleResult).forEach(function([key, value]) {
        //console.log(key, value);
        // Append a cell to the row for each value
        // in the weather report object
        var p = smplRsltsHtml.append("p");
        p.text(`${key}: ${value}`)
      });
    


    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    //console.log(`WFEQ: ${sampleResult["WFREQ"]}`);

    // var data = [
    //   {
    //     domain: { x: [0, 1], y: [0, 1] },
    //     value: sampleResult["WFREQ"],
    //     title: { text: "Wash Frequency" },
    //     type: "indicator",
    //     mode: "gauge+number",
    //     gauge: {
    //       axis: { range: [null, 9]}
    //     }
    //   }
    // ];

    
    //var layout = { width: 300, height: 250, margin: { t: 0, b: 0 } };
    //Plotly.newPlot(gauge, data, layout);
    //Plotly.newPlot(gauge, data)

    var data = [
      {
        domain: { x: [0, 1], y: [0, 1]},
        value: sampleResult["WFREQ"],
        title: { text: "Wash Frequency" },
        type: "indicator",
        mode: "gauge+number+delta",
        //delta: { reference: 7 },
        gauge: {
          axis: { range: [null, 9], tickwidth: 3, tickcolor: "red" },
          steps: [
            { range: [0, 1], color: "#FFF8DC" },
            { range: [1, 2], color: '#FFF8DC' },
            { range: [2, 3], color: "#FFEBCD" },
            { range: [3, 4], color: "#FFDEAD" },
            { range: [4, 5], color: "#90EE90" },
            { range: [5, 6], color: "#32CD32" },
            { range: [6, 7], color: "#8FBC8F" },
            { range: [7, 8], color: '#3CB371' }, 
            { range: [8, 9], color: '#2E8B57' },
          ]
          // threshold: {
          //   line: { color: "red", width: 4 },
          //   thickness: 0.75,
          //   value: 8
          // }
        }
      }
    ];
    
    var layout = { width: 600, height: 450, margin: { t: 0, b: 0 } };
    Plotly.newPlot(gauge, data, layout);

  }); // end d3.json(`/metadata/${sample}`).then(function(sampleResult)
   
}

function buildCharts(sample) {
  ///  @app.route("/samples/<sample>")
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function(samples) {
    console.log(samples);
    // @TODO: Build a Bubble Chart using the sample data

    // Scale the out_ids to 0-256 for color


    // Load a new array with the scaled values
    // var tmpArray = samples["out_ids"].map(function(item) {
    //   return item;
    // });
    // console.log(`temp array: ${tmpArray}`);
    // scaledOut_Ids = tmpArray.map(function(value){
    //   console.log(`before scaling: ${value}`);
    //   console.log(`after scaling: ${grnScale(value)}`);
    //   return grnScale(value);
    // });
      
    var tmpArray = samples["otu_ids"];
    var grnScale = d3.scaleLinear()
      .domain(d3.extent(tmpArray)) // The extents of my samples
      //.domain(1,100)
      .range([0, 256]);


    console.log(`labels in temp array?: ${tmpArray}`)
    scaledOut_Ids = tmpArray.map(function(value){
      return grnScale(value);
    }); 
    
    var myColors = scaledOut_Ids.map(function(value){
      return `rgb(0, ${value}, 0)`
    })

    //console.log(`myColors is: ${myColors}`);

    var trace1 = {
      x: samples["otu_ids"],
      y: samples["sample_values"],
      mode: 'markers',
      text: samples["otu_labels"],
      marker: {
        size: samples["sample_values"],
        color: myColors
      }
    };
    
    var data = [trace1];
    
    var layout = {
      title: '',
      showlegend: false,
      height: 600,
      width: 800
    };
    
    Plotly.newPlot('bubble', data, layout);


    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var trace1 = {
      labels: samples["otu_ids"].slice(0, 10),
      values: samples["sample_values"].slice(0, 10),
      hoverinfo: samples["otu_labels"].slice(0,10),
      textinfo: 'none',
      type: 'pie'
    };

    var data = [trace1];

    var layout = {
      title: "Top Ten",
    };

    Plotly.newPlot("pie", data, layout);


  }); // End of d3.json(`/samples/${sample}`).then(function(samples)
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
