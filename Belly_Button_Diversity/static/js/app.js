function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`/metadata/${sample}`).then(function (sampleResult) {
    //console.log(sampleResult);

    // Use d3 to select the panel with id of `#sample-metadata`
    smplRsltsHtml = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    smplRsltsHtml.html("");

    Object.entries(sampleResult).forEach(function ([key, value]) {
      //console.log(key, value);
      // Append a cell to the row for each value
      // in the weather report object
      var p = smplRsltsHtml.append("p");
      p.text(`${key}: ${value}`)
    });



    // BONUS: Build the Gauge Chart
    var data = [
      {
        domain: { x: [0, 9], y: [0, 9] },
        value: sampleResult["WFREQ"],
        title: { text: "Scrubs per Week" },
        type: "indicator",
        mode: "gauge+number",
        //delta: { reference: 7 },
        gauge: {
          axis: {
            range: [null, 9], tickwidth: 3,
            tickcolor: "black", tick0: 1, dtick: 1
          },
          bar: { 'color': "red" },
          steps: [
            { range: [0, 1], color: "#CDE4C9" },
            { range: [1, 2], color: '#BED4BB' },
            { range: [2, 3], color: "#A2BC9E" },
            { range: [3, 4], color: "#769A70" },
            { range: [4, 5], color: "#6AA860" },
            { range: [5, 6], color: "#67B45A" },
            { range: [6, 7], color: "#5CB64D" },
            { range: [7, 8], color: '#478F3B' },
            { range: [8, 9], color: '#35692D' },
          ]
        }
      }
    ];

    var layout = {

      title: {
        text: 'Belly Button Washing Frequency',
        font: {
          family: 'Courier Bold',
          Style: 'bold',
          size: 24
        },
        xref: 'paper',
        x: 0.01,
      },
      width: 450,
      height: 300,
      margin: { t: 45, b: .05 }
    };
    Plotly.newPlot(gauge, data, layout);

  }); // end d3.json(`/metadata/${sample}`).then(function(sampleResult)

}

function buildCharts(sample) {
  ///  @app.route("/samples/<sample>")
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function (samples) {
    //console.log(samples);
    // @TODO: Build a Bubble Chart using the sample data

    // Scale the out_ids to 0-256 for color

    var tmpArray = samples["otu_ids"];
    var grnScale = d3.scaleLinear()
      .domain(d3.extent(tmpArray)) // The extents of my samples
      //.domain(1,100)
      .range([0, 256]);


    //console.log(`labels in temp array?: ${tmpArray}`)
    scaledOut_Ids = tmpArray.map(function (value) {
      return grnScale(value);
    });

    var myColors = scaledOut_Ids.map(function (value) {
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
      width: 1000
    };

    Plotly.newPlot('bubble', data, layout);


    // @TODO: Build a Pie Chart
    var trace1 = {
      labels: samples["otu_ids"].slice(0, 10),
      values: samples["sample_values"].slice(0, 10),
      hoverinfo: samples["otu_labels"].slice(0, 10),
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
