let initialNationList = [];
let intervalId;
let running = false;

document.querySelector("#nation-name").addEventListener("input", function() {
  const startButton = document.querySelector("#start-button");
  startButton.disabled = this.value.trim().length <= 3; 
});

function startFetching() {
  const regionName = document.querySelector("#region-name").value;
  const nationName = document.querySelector("#nation-name").value;
  const startButton = document.querySelector("#start-button");
  const stopButton = document.querySelector("#stop-button");

  if (regionName && !running) {
    fetchAPIAndDisplay(regionName, nationName);
    intervalId = setInterval(() => {
      fetchAPIAndDisplay(regionName, nationName);
    }, 800); 

    running = true;
    document.querySelector("#status").textContent = "Running...";
    startButton.disabled = true;
    stopButton.style.display = "block";
  } else {
    console.error("Region name is required or the app is already running.");
  }
}

function stopFetching() {
  const startButton = document.querySelector("#start-button");
  const stopButton = document.querySelector("#stop-button");

  clearInterval(intervalId);
  running = false;
  document.querySelector("#status").textContent = "Stopped.";
  startButton.disabled = false;
  stopButton.style.display = "none";
}

async function fetchAPIAndDisplay(regionName, nationName) {
  const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?region=${regionName}&q=wanations+lastupdate`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": `theAB, used by ${nationName}`
      }
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const nationList = xmlDoc.querySelector("UNNATIONS").textContent.split(",");

    if (initialNationList.length === 0) {
      initialNationList = nationList;
    } else {
      const newNations = nationList.filter((nation) => !initialNationList.includes(nation));

      if (newNations.length > 0) {
        console.log("New nations detected:", newNations);
        newNations.forEach((nation) => {
          const nationDiv = document.querySelector("#nation-list");
          const nationLink = document.createElement("a");
          nationLink.href = `https://www.nationstates.net/nation=${nation}#composebutton`;
          nationLink.textContent = nation;
          nationLink.id = `nation-${nation}`;
          nationDiv.appendChild(nationLink);
          nationDiv.appendChild(document.createElement("br"));
          window.open(`https://www.nationstates.net/nation=${nation}#composebutton`, "_blank");
        });
        initialNationList = nationList; // Update initial nation list
      }
    }
    document.querySelector("#status").textContent = "Running...";
  } catch (error) {
    console.error("Error fetching data: ", error);
    document.querySelector("#status").textContent = "Error fetching data.";
  }
}
