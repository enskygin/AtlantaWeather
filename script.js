
// Function to create the visualization
function createVisualization(data) {
    // Select the container to append the chart
    var container = d3.select("#visualization1");

    // Create SVG element within the selected container
    var svg = container
        .append("svg")
        .attr("width", 800)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(50, 50)"); // Add some margin

    // Set up scales
    var xScale = d3.scaleBand()
        .domain(data.map(function(d) { return d.month; }))
        .range([0, 500]) // Adjust the width as needed
        .padding(0.1);

    // Append x-axis
    var xAxis = svg.append("g")
        .attr("transform", "translate(0, 300)")
        .call(d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(function(d, i) { return !(i % 3); })) // Show labels for every third tick
        );

    // Apply styling to rotated labels
    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return Math.max(d.TempMax, d.TempMin); })])
        .range([300, 0]); // Adjust the height as needed

        // Define the dummy scale for the fake y-axis
    var yScaleFake = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return Math.max(d.TempMax, d.TempMin); }) / 10]) // Adjusted domain for the dummy scale
    .range([300, 0]); // Adjust the height as needed

    // Append circles for rounded poles at the top of each bar
    var colorScale = d3.scaleLinear()
        .domain([30, 92]) // Temperature range
        .range(["cornflowerblue", "orangered"]); // Color range

    // Append the bars
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.month) + xScale.bandwidth() / 4; }) // Shift bars to the right
        .attr("y", function(d) { return yScale(Math.max(d.TempMax, d.TempMin)); }) // Start at the higher temperature
        .attr("width", xScale.bandwidth() / 2) // Make bars skinny
        .attr("height", function(d) { return yScale(Math.min(d.TempMax, d.TempMin)) - yScale(Math.max(d.TempMax, d.TempMin)); }) // Height based on temperature range
        .attr("fill", function(d) {
            // Create linear gradient
            var gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradient-" + d.month)
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "0%") // Start at the top
                .attr("y2", "100%"); // End at the bottom

            // Add gradient stops
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale(d.TempMax)); // Color at the top of the bar
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale(d.TempMin)); // Color at the bottom of the bar

            // Apply gradient to the bar
            return "url(#gradient-" + d.month + ")";
        }); // Apply gradient to the average temperature

    // Append circles for rounded poles at the top and bottom of each bar
    svg.selectAll(".circle-min")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle-min")
        .attr("cx", function(d) { return xScale(d.month) + xScale.bandwidth() / 2; })
        .attr("cy", function(d) { return yScale(d.TempMin); })
        .attr("r", 5)
        .attr("fill", function(d) { return colorScale(d.TempMin); }); // Apply color scale to temperature

    svg.selectAll(".circle-max")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle-max")
        .attr("cx", function(d) { return xScale(d.month) + xScale.bandwidth() / 2; })
        .attr("cy", function(d) { return yScale(d.TempMax); })
        .attr("r", 5)
        .attr("fill", function(d) { return colorScale(d.TempMax); }); // Apply color scale to temperature

    // Append y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

        // Append fake y-axis for temperature
var dummyYAxis = svg.append("g")
.attr("class", "y axis")
.style("display", "none")
.call(d3.axisRight(yScaleFake)) // Use the dummy scale here
.attr("transform", "translate(" + xScale.range()[1] + ",0)");
        

     // Append x-axis label on the left
svg.append("text")
.attr("class", "x-axis-label")
.attr("text-anchor", "middle")
.attr("x", -75)
.attr("y", -30) // Adjust the y position as needed
.text("Temperature (F)")
.attr("transform", "rotate(-90)");

// Append x-axis label on the right
var xAxisLabel = svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", -75)
    .attr("y", 540) // Adjust the y position as needed
    .text("Rainfall (Inches)")
    .attr("transform", "rotate(-90)")
    .style("display", "none"); // Initially hide the x-axis label



    // Define the line function for precipitation
    var line = d3.line()
        .x(function(d) { return xScale(d.month) + xScale.bandwidth() / 2; }) // Position of the line on the x-axis
        .y(function(d) { return yScale(d.Precip); }); // Position of the line on the y-axis

    // Append the precipitation line
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "#b89e2e")
        .style("stroke-width", 2)
        .style("fill", "none")
        .style("display", "none"); // Initially hide the line

   // Append checkbox for toggling precipitation line visibility
container.append("label")
.style("position", "absolute") // Apply absolute positioning
.style("top", "140px") // Adjust top position as needed
.style("left", "400px") // Adjust left position as needed
.text("Show Precipitation")
.append("input")
.attr("type", "checkbox")
.on("change", function() {
    var display = this.checked ? "block" : "none";
    svg.select(".line").style("display", display);

    // Show/hide dummy y-axis and x-axis label based on precipitation line visibility
    dummyYAxis.style("display", display === "block" ? "block" : "none");
    xAxisLabel.style("display", display === "block" ? "block" : "none");
});
}

// Load data from CSV file
d3.csv("monthly.csv").then(function(data) {
    // Convert temperature strings to numbers
    data.forEach(function(d) {
        d.TempMax = +d.TempMax;
        d.TempMin = +d.TempMin;
        d.Precipitation = +d.Precipitation; // Convert Precipitation values to numbers
    });

    // Call createVisualization function
    createVisualization(data);
}).catch(function(error) {
    console.log("Error loading the data: " + error);
});




// wind arrows
// Function to create the visualization
function createWindSpeedArrows(data) {
    // Define grid dimensions
    var numRows = 3;
    var numCols = 12;

    // Calculate grid cell dimensions
    var cellWidth = 80; // Adjust as needed
    var cellHeight = 60; // Adjust as needed

    // Create SVG container
    var svg = d3.select("#visualization2")
        .append("svg")
        .attr("width", cellWidth * numCols)
        .attr("height", cellHeight * numRows);

    // Define arrow color and other properties
    var arrowColor = "red"; // Adjust as needed

    // Define opacity scale based on visibility values
    var opacityScale = d3.scaleLinear()
        .domain([7.6, 9.9]) // Visibility range
        .range([0.9, 0.2]); // Opacity range

    // Draw horizontal grid lines
for (var i = 0; i < numRows; i++) {
    svg.append("line")
        .attr("x1", 0)
        .attr("y1", i * cellHeight)
        .attr("x2", numCols * cellWidth)
        .attr("y2", i * cellHeight)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    if (i < numRows) {
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", (i + 1) * cellHeight)
            .attr("x2", numCols * cellWidth)
            .attr("y2", (i + 1) * cellHeight)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
    }
}

// Draw vertical grid lines
for (var j = 0; j < numCols; j++) {
    svg.append("line")
        .attr("x1", j * cellWidth)
        .attr("y1", 0)
        .attr("x2", j * cellWidth)
        .attr("y2", numRows * cellHeight)
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    if (j < numCols) {
        svg.append("line")
            .attr("x1", (j + 1) * cellWidth)
            .attr("y1", 0)
            .attr("x2", (j + 1) * cellWidth)
            .attr("y2", numRows * cellHeight)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
    }
}

    

    for (var j = 0; j < numCols; j++) {
        svg.append("line")
            .attr("x1", j * cellWidth)
            .attr("y1", 0)
            .attr("x2", j * cellWidth)
            .attr("y2", numRows * cellHeight)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);

        if (j < numCols) {
            svg.append("line")
                .attr("x1", (j + 1) * cellWidth)
                .attr("y1", 0)
                .attr("x2", (j + 1) * cellWidth)
                .attr("y2", numRows * cellHeight)
                .attr("stroke", "gray")
                .attr("stroke-width", 1);
        }
    }

    // Draw arrows for each row of data
    data.forEach(function(d, i) {
        var row = Math.floor(i / numCols); // Calculate row index
        var col = i % numCols; // Calculate column index

        // Calculate arrow size based on wind speed
        var arrowSize = +d.Windspeed; // Assuming wind speed is a numerical value

        // Calculate opacity based on visibility
        var arrowOpacity = opacityScale(+d.Visibility); // Assuming visibility is a numerical value

        // Draw arrow
        var arrow = svg.append("path")
            .attr("d", "M 25 0 L 35 50 L 0 50 Z") // Define the path for the arrow (triangle)
            .attr("transform", "translate(" + (col * cellWidth) + "," + (row * cellHeight) + ") scale(" + (arrowSize / 12) + ")") // Position and scale arrow
            .attr("fill", arrowColor) // Apply arrow color
            .attr("opacity", arrowOpacity); // Apply arrow opacity
        
        // Add text label for the month
        svg.append("text")
            .attr("x", (col * cellWidth) + (cellWidth / 2))
            .attr("y", ((row + 1) * cellHeight) - 10) // Position text below the arrow
            .attr("text-anchor", "middle")
            .text(d.month); // Assuming the month data is in the "Month" column

        
// Add mouseover event listener to show wind speed and visibility on click
arrow.on("click", function() {
    var windSpeed = d.Windspeed; // Access wind speed from the data
    var visibility = d.Visibility; // Access visibility from the data

    // Create a styled popup container
    var popupContainer = document.createElement("div");
    popupContainer.classList.add("popup");
    popupContainer.style.position = "absolute"; // Ensure it's positioned absolutely
    popupContainer.style.backgroundColor = "white"; // Set background color to white
    popupContainer.style.padding = "5px"; // Add some padding
    popupContainer.style.border = "1px solid black"; // Add a border
    popupContainer.style.zIndex = "1000"; // Ensure it's above other elements

    // Set the position of the popup container (move it to the right)
    popupContainer.style.left = "70%"; // Move it 50% to the right
    popupContainer.style.top = "570px"; // Move it 50% to the right
    popupContainer.style.transform = "translateX(-50%)"; // Adjust to center it horizontally


    // Create content for the popup using the wind speed and visibility values
    var content = document.createElement("div");
    content.innerHTML = "<p>Wind Speed: " + windSpeed + " miles/hour</p><p>Visibility: " + visibility + " miles</p>";

    // Add content to the popup container
    popupContainer.appendChild(content);

    // Append the popup container to the "popup-container" div
    document.getElementById("popup-container").appendChild(popupContainer);

    
});
  
  });
}

// Load data from CSV file
d3.csv("monthly.csv").then(function(data) {
    // Call createWindSpeedArrows function
    createWindSpeedArrows(data);
}).catch(function(error) {
    console.log("Error loading the data: " + error);
});



// Declare variables in broader scope
var svgBubble, xScale, yScale;

// Function to create the scatter plot
function createScatterPlot(data) {


// Define SVG dimensions and margins for the scatter plot
var scatterMargin = { top: 50, right: 50, bottom: 50, left: 60 };
var scatterWidth = 580 - scatterMargin.left - scatterMargin.right;
var scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

// Set up SVG container
svgScatter = d3.select("#visualization3")
.append("svg")
.attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
.attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
.append("g")
.attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");

// Set up scales
xScale = d3.scaleLinear()
.domain([d3.min(data, function(d) { return +d.Pressure; }), d3.max(data, function(d) { return +d.Pressure; })])
.range([0, scatterWidth])
.nice();

yScale = d3.scaleLinear()
.domain([d3.min(data, function(d) { return +d.Dewpoint; }), d3.max(data, function(d) { return +d.Dewpoint; })])
.range([scatterHeight, 0])
.nice();

// Append axes
svgScatter.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + scatterHeight + ")")
.call(d3.axisBottom(xScale))
.append("text")
.attr("class", "label")
.attr("x", scatterWidth)
.attr("y", -6)
.style("text-anchor", "end")
.text("Pressure");

svgScatter.append("g")
.attr("class", "y axis")
.call(d3.axisLeft(yScale))
.append("text")
.attr("class", "label")
.attr("transform", "rotate(-90)")
.attr("y", 6)
.attr("dy", ".71em")
.style("text-anchor", "end")
.text("Dewpoint");

// Append axis labels
svgScatter.append("text")
.attr("class", "x label")
.attr("text-anchor", "end")
.attr("x", scatterWidth)
.attr("y", scatterHeight + scatterMargin.top - 10)
.text("Pressure");

svgScatter.append("text")
.attr("class", "y label")
.attr("text-anchor", "end")
.attr("transform", "rotate(-90)")
.attr("y", -scatterMargin.left + 10)
.attr("x", -10)
.text("Dewpoint");

// Append circles for data points
svgScatter.selectAll(".dot")
.data(data)
.enter().append("circle")
.attr("class", "dot")
.attr("r", 2)
.attr("cx", function(d) { return xScale(+d.Pressure); })
.attr("cy", function(d) { return yScale(+d.Dewpoint); })
.style("fill", "#544e36");
}

// Add event listeners for buttons
document.getElementById("sun-button").addEventListener("click", function() {
    filterDataAndRefresh("sun");
});

document.getElementById("rain-button").addEventListener("click", function() {
    filterDataAndRefresh("rain");
});

document.getElementById("drizzle-button").addEventListener("click", function() {
    filterDataAndRefresh("drizzle");
});

document.getElementById("snow-button").addEventListener("click", function() {
    filterDataAndRefresh("snow");
});

// Function to filter data based on category and update scatter plot
function filterDataAndRefresh(category) {
    var filteredData = weatherData.filter(function(weather) {
        return weather.Weather.toLowerCase() === category.toLowerCase();
    });
    updateScatterPlot(filteredData);
}



// Function to create the bubble chart
function createBubbleChart(data) {

    // Define SVG dimensions and margins for the bubble chart
    var bubbleMargin = { top: 50, right: 50, bottom: 50, left: 60 };
    var bubbleWidth = 580 - bubbleMargin.left - bubbleMargin.right;
    var bubbleHeight = 400 - bubbleMargin.top - bubbleMargin.bottom;
  
    // Set up SVG container
    var svgBubble = d3.select("#visualization3")
      .append("svg")
      .attr("width", bubbleWidth + bubbleMargin.left + bubbleMargin.right)
      .attr("height", bubbleHeight + bubbleMargin.top + bubbleMargin.bottom)
      .append("g")
      .attr("transform", "translate(" + bubbleMargin.left + "," + bubbleMargin.top + ")");
  
    // Create an object to store the count of each weather type
    var weatherCounts = {};
  
    // Count occurrences of each weather type
    data.forEach(function(d) {
      weatherCounts[d.Weather] = (weatherCounts[d.Weather] || 0) + 1;
    });
  
    // Set up scale for bubble size
    var radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(Object.values(weatherCounts))])
      .range([2, 20]); // adjust the range for the desired bubble sizes

      // Define gradients for each weather condition
var gradients = {
    "sun": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-sun"),
    "snow": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-snow"),
    "rain": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-rain"),
    "drizzle": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-drizzle")
  };
  
  // Define gradient colors for each weather condition
  var gradientColors = {
    "sun": ["#FFA500", "#FFFF00"], // Redorange to yellow gradient for Sun
    "snow": ["#FFFFFF", "#a2bade"], // Light blue to white gradient for Snow
    "rain": ["#5d96f0", "#172740"], // Blue to grey gradient for Rain
    "drizzle": ["#b6d2f0", "#97c999"] // Teal to green gradient for Drizzle
  };
  
  // Create gradients for each weather condition
  Object.keys(gradients).forEach(function(condition) {
    gradients[condition].selectAll("stop")
      .data(gradientColors[condition])
      .enter().append("stop")
      .attr("offset", function(d, i) { return i * 100 + "%"; })
      .attr("stop-color", function(d) { return d; });
  });
  
  // Append bubbles for each weather type
  var bubbles = svgBubble.selectAll(".bubble")
    .data(Object.keys(weatherCounts))
    .enter().append("circle")
    .attr("class", "bubble")
    .attr("cx", bubbleWidth / 2)
    .attr("cy", bubbleHeight / 2)
    .attr("r", function(d) { return radiusScale(weatherCounts[d]); })
    .style("fill", function(d) {
      // Set the fill to the appropriate gradient based on weather type
      return "url(#gradient-" + d + ")";
    });
}
  
// Function to create the bubble chart
function createBubbleChart(data) {
    // Define SVG dimensions and margins for the bubble chart
    var margin = { top: 100, right: 45, bottom: 50, left: 50 };
    var width = 380 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    // Create SVG container for the bubble chart
    var svgBubble = d3.select("#visualization3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Create scales for x, y, and bubble size
    var xScale = d3.scaleBand()
        .domain(data.map(d => d.cat))
        .range([0, width])
        .padding(0.1);
    
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.n)])
        .range([height, 0]);
    
    var radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.n)])
        .range([8, 80]); // Adjust the range as needed for bubble size
    
    // Define gradients for each weather condition
    var gradients = {
        "sun": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-sun"),
        "snow": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-snow"),
        "rain": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-rain"),
        "drizzle": svgBubble.append("defs").append("radialGradient").attr("id", "gradient-drizzle")
    };
    
    // Define gradient colors for each weather condition
    var gradientColors = {
        "sun": ["#FFA500", "#FFFF00"], // Redorange to yellow gradient for Sun
        "snow": ["#FFFFFF", "#a2bade"], // Light blue to white gradient for Snow
        "rain": ["#5d96f0", "#172740"], // Blue to grey gradient for Rain
        "drizzle": ["#b6d2f0", "#97c999"] // Teal to green gradient for Drizzle
    };
    
    // Create gradients for each weather condition
    Object.keys(gradients).forEach(function(condition) {
        gradients[condition].selectAll("stop")
            .data(gradientColors[condition])
            .enter().append("stop")
            .attr("offset", function(d, i) { return i * 100 + "%"; })
            .attr("stop-color", function(d) { return d; });
    });
    
    // Create bubbles
    var bubbles = svgBubble.selectAll(".bubble")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bubble")
    .attr("transform", function(d) {
        return "translate(" + (xScale(d.cat) + xScale.bandwidth() / 2) + "," + yScale(d.n) + ")";
    });
    // Append circles to represent bubbles
bubbles.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => radiusScale(d.n))
    .style("fill", function(d) {
        return "url(#gradient-" + d.cat.toLowerCase() + ")";
    });

// Append labels to the bubbles
bubbles.append("text")
    .text(function(d) { return d.cat; }) // Use the category (cat) as the label
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em"); // Adjust the vertical position of the label if needed

}

// Function to update scatter plot with filtered data
function updateScatterPlot(data) {
    // Remove existing circles
    svgScatter.selectAll(".dot").remove();
    
    // Append circles for filtered data points
    svgScatter.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 2)
        .attr("cx", function(d) { return xScale(+d.Pressure); })
        .attr("cy", function(d) { return yScale(+d.Dewpoint); })
        .style("fill", "#544e36");
}

// Load data from CSV files
Promise.all([
    d3.csv("day.csv"),
    d3.csv("bubble.csv")
]).then(function(data) {
    weatherData = data[0];
    var bubbleData = data[1];

    // Call createScatterPlot function with weatherData
    createScatterPlot(weatherData);

    // Call createBubbleChart function with bubbleData
    createBubbleChart(bubbleData);
}).catch(function(error) {
    console.log("Error loading the data: " + error);
});
