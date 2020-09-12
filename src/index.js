import Leaflet from "leaflet"
import "./styles.css"
import "leaflet.markercluster"
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const map = Leaflet.map("map", {
  center: [45, -122],
  zoom: 8
})

let markers = Leaflet.markerClusterGroup()

const tileLayer = Leaflet.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      "&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
  }
)

const evacuationLayer = Leaflet.geoJSON(false, {
  style: ({ properties }) => ({
    fillColor: getEvacuationFillColor(properties.Fire_Evacuation_Level)
  })
})

map.addLayer(tileLayer)
map.addLayer(evacuationLayer)
map.addLayer(markers)

initializeEvacuationData(evacuationLayer)
initializeThermalData()

document.getElementById("slider").addEventListener("change", ({ target }) => {
    fetchEvacuationData(evacuationLayer, target.value)
  })

  document.getElementById("thermal-slider").addEventListener("change", ({ target }) => {
    fetchThermalData(target.value)
  })

const play = () => {
  setTimeout(() => {
    const slider = document.getElementById("slider")
    const max = slider.getAttribute("max")
    const nextIndex = +slider.value + 5
    slider.value = nextIndex
    const event = document.createEvent("HTMLEvents")
    event.initEvent("change")
    slider.dispatchEvent(event)
    if (nextIndex < max) play()
  }, 1000)
}
document.getElementById("play").addEventListener("click", play)

function getEvacuationFillColor(level) {
  const colors = ["green", "yellow", "red"]
  return colors[level - 1]
}

async function initializeEvacuationData(evacuationLayer) {
  const res = await fetch("https://fire.alchemycodelab.io/evacuations/count")
  const { count } = await res.json()
  document.getElementById("slider").setAttribute("max", count - 1)

  return fetchEvacuationData(evacuationLayer, 0)
}

async function initializeThermalData() {
  const res = await fetch("https://fire.alchemycodelab.io/thermals/count")
  const { count } = await res.json()
  document.getElementById("thermal-slider").setAttribute("max", count - 1)

  return fetchThermalData(0)
}

async function fetchEvacuationData(evacuationLayer, index) {
  const res = await fetch(`https://fire.alchemycodelab.io/evacuations/${index}`)
  const evacuationGeoJSON = await res.json()
  evacuationLayer.clearLayers()
  evacuationLayer.addData(evacuationGeoJSON)
}

async function fetchThermalData(index) {
  const res = await fetch(`https://fire.alchemycodelab.io/thermals/${index}`)
  const thermalGeoJSON = await res.json()
  thermalGeoJSON.features = thermalGeoJSON.features.slice(0)
  markers.clearLayers()
  markers.addLayers(
    thermalGeoJSON.features.map((feature) => {
      return Leaflet.circleMarker([
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0]
      ], { fillColor: 'red', stroke: false });
    }))
}


setTimeout(() => {
  document.getElementById('loader').remove();
}, 7000);
