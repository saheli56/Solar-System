import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let planet_sun_label;

// Store all planet meshes for raycasting
let planetMeshes = [];

// Tooltip element
let tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'auto'; // allow mouse events
tooltip.style.background = 'rgba(0,0,0,0.8)';
tooltip.style.color = '#fff';
tooltip.style.padding = '8px 12px';
tooltip.style.borderRadius = '6px';
tooltip.style.fontSize = '14px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1000';
document.body.appendChild(tooltip);

// Create detailed planet info panel
const planetInfoPanel = document.createElement('div');
planetInfoPanel.id = 'planetInfoPanel';
planetInfoPanel.style.position = 'fixed';
planetInfoPanel.style.bottom = '-100%';
planetInfoPanel.style.left = '0';
planetInfoPanel.style.width = '100%';
planetInfoPanel.style.height = '60%';
planetInfoPanel.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)';
planetInfoPanel.style.color = '#fff';
planetInfoPanel.style.padding = '20px 32px 20px 20px'; // Add right padding for button
planetInfoPanel.style.borderRadius = '20px 20px 0 0';
planetInfoPanel.style.boxShadow = '0 -10px 30px rgba(0,0,0,0.5)';
planetInfoPanel.style.zIndex = '2000';
planetInfoPanel.style.transition = 'bottom 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
planetInfoPanel.style.overflowY = 'auto';
planetInfoPanel.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-right: 12px;">
    <h2 id="planetInfoTitle" style="margin: 0; color: #ffd700;">Planet Information</h2>
    <button onclick="hidePlanetInfo()" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 16px;">Close</button>
  </div>
  <div id="planetInfoContent" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;"></div>
`;
document.body.appendChild(planetInfoPanel);

// Planet data
const planetData = {
  'Sun': {
    mass: '1.989 × 10³⁰ kg',
    diameter: '1.392 million km',
    temperature: '5,778 K (surface)',
    composition: 'Hydrogen (73%), Helium (25%)',
    age: '4.6 billion years',
    type: 'G-type main-sequence star',
    luminosity: '3.828 × 10²⁶ watts'
  },
  'Mercury': {
    mass: '3.301 × 10²³ kg',
    diameter: '4,879 km',
    density: '5.427 g/cm³',
    temperature: '427°C (day), -173°C (night)',
    orbitalPeriod: '88 Earth days',
    rotationPeriod: '59 Earth days',
    moons: '0',
    atmosphere: 'Minimal (oxygen, sodium, hydrogen)',
    escapeVelocity: '4.25 km/s'
  },
  'Venus': {
    mass: '4.867 × 10²⁴ kg',
    diameter: '12,104 km',
    density: '5.243 g/cm³',
    temperature: '464°C (surface)',
    orbitalPeriod: '225 Earth days',
    rotationPeriod: '243 Earth days (retrograde)',
    moons: '0',
    atmosphere: '96.5% CO₂, 3.5% nitrogen',
    escapeVelocity: '10.36 km/s'
  },
  'Earth': {
    mass: '5.972 × 10²⁴ kg',
    diameter: '12,756 km',
    density: '5.514 g/cm³',
    temperature: '15°C (average)',
    orbitalPeriod: '365.25 days',
    rotationPeriod: '24 hours',
    moons: '1 (Moon)',
    atmosphere: '78% nitrogen, 21% oxygen',
    escapeVelocity: '11.19 km/s'
  },
  'Mars': {
    mass: '6.417 × 10²³ kg',
    diameter: '6,792 km',
    density: '3.933 g/cm³',
    temperature: '-65°C (average)',
    orbitalPeriod: '687 Earth days',
    rotationPeriod: '24.6 hours',
    moons: '2 (Phobos, Deimos)',
    atmosphere: '95% CO₂, 3% nitrogen',
    escapeVelocity: '5.03 km/s'
  },
  'Jupiter': {
    mass: '1.898 × 10²⁷ kg',
    diameter: '142,984 km',
    density: '1.326 g/cm³',
    temperature: '-110°C (cloud tops)',
    orbitalPeriod: '12 Earth years',
    rotationPeriod: '9.9 hours',
    moons: '79+ (Europa, Ganymede, Io, Callisto)',
    atmosphere: '89% hydrogen, 10% helium',
    escapeVelocity: '59.5 km/s'
  },
  'Saturn': {
    mass: '5.683 × 10²⁶ kg',
    diameter: '120,536 km',
    density: '0.687 g/cm³',
    temperature: '-140°C (cloud tops)',
    orbitalPeriod: '29.5 Earth years',
    rotationPeriod: '10.7 hours',
    moons: '82+ (Titan, Enceladus, Mimas)',
    atmosphere: '96% hydrogen, 3% helium',
    escapeVelocity: '35.5 km/s'
  },
  'Uranus': {
    mass: '8.681 × 10²⁵ kg',
    diameter: '51,118 km',
    density: '1.271 g/cm³',
    temperature: '-195°C (cloud tops)',
    orbitalPeriod: '84 Earth years',
    rotationPeriod: '17.2 hours (retrograde)',
    moons: '27+ (Miranda, Ariel, Umbriel)',
    atmosphere: '83% hydrogen, 15% helium, 2% methane',
    escapeVelocity: '21.3 km/s'
  },
  'Neptune': {
    mass: '1.024 × 10²⁶ kg',
    diameter: '49,528 km',
    density: '1.638 g/cm³',
    temperature: '-200°C (cloud tops)',
    orbitalPeriod: '165 Earth years',
    rotationPeriod: '16.1 hours',
    moons: '14+ (Triton, Nereid)',
    atmosphere: '80% hydrogen, 19% helium, 1% methane',
    escapeVelocity: '23.5 km/s'
  }
};

// Functions to show/hide planet info panel
function showPlanetInfo(planetName) {
  const panel = document.getElementById('planetInfoPanel');
  const title = document.getElementById('planetInfoTitle');
  const content = document.getElementById('planetInfoContent');
  
  title.textContent = planetName + ' - Detailed Information';
  
  const data = planetData[planetName];
  if (data) {
    let htmlContent = '';
    for (const [key, value] of Object.entries(data)) {
      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      htmlContent += `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #ffd700;">
          <strong style="color: #ffd700; display: block; margin-bottom: 5px;">${displayKey}:</strong>
          <span style="font-size: 16px;">${value}</span>
        </div>
      `;
    }
    content.innerHTML = htmlContent;
  }
  
  panel.style.bottom = '0';
}

function hidePlanetInfo() {
  const panel = document.getElementById('planetInfoPanel');
  panel.style.bottom = '-100%';
}

// Add global functions to window for onclick handlers
window.showPlanetInfo = showPlanetInfo;
window.hidePlanetInfo = hidePlanetInfo;

let tooltipIsHovered = false;
let tooltipIsFixed = false;
let tooltipFixedPos = { left: 0, top: 0 };
tooltip.addEventListener('mouseenter', function() {
  tooltipIsHovered = true;
});
tooltip.addEventListener('mouseleave', function() {
  tooltipIsHovered = false;
  if (!tooltipIsFixed) tooltip.style.display = 'none';
});

document.addEventListener('mousedown', function(e) {
  if (tooltipIsFixed && !tooltip.contains(e.target)) {
    tooltipIsFixed = false;
    tooltip.style.display = 'none';
  }
});

// --- Background Audio ---
const bgAudio = document.createElement('audio');
bgAudio.src = '../audio/Combined_Compressed.mp3';
bgAudio.loop = true;
bgAudio.autoplay = true;
bgAudio.volume = 1.0; // Set volume to maximum for better audibility
bgAudio.style.display = 'none';
document.body.appendChild(bgAudio);

// --- Overlay for user interaction to start audio ---
const audioOverlay = document.createElement('div');
audioOverlay.style.position = 'fixed';
audioOverlay.style.top = '0';
audioOverlay.style.left = '0';
audioOverlay.style.width = '100vw';
audioOverlay.style.height = '100vh';
audioOverlay.style.background = 'rgba(0,0,0,0.85)';
audioOverlay.style.display = 'flex';
audioOverlay.style.alignItems = 'center';
audioOverlay.style.justifyContent = 'center';
audioOverlay.style.zIndex = '2000';
audioOverlay.innerHTML = `<button id="startAudioBtn" style="padding: 22px 48px; font-size: 1.5rem; border-radius: 18px; border: none; background: linear-gradient(135deg,#222 60%,#444 100%); color: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.25); cursor: pointer;">🔊 Start Audio</button>`;
document.body.appendChild(audioOverlay);

document.getElementById('startAudioBtn').onclick = function() {
  bgAudio.play();
  audioOverlay.style.display = 'none';
};

let mercury_orbit_radius = 50
let venus_orbit_radius = 60
let earth_orbit_radius = 70
let mars_orbit_radius = 80
let jupiter_orbit_radius = 100
let saturn_orbit_radius = 120
let uranus_orbit_radius = 140
let neptune_orbit_radius = 160

let mercury_revolution_speed = 2
let venus_revolution_speed = 1.5
let earth_revolution_speed = 1
let mars_revolution_speed = 0.8
let jupiter_revolution_speed = 0.7
let saturn_revolution_speed = 0.6
let uranus_revolution_speed = 0.5
let neptune_revolution_speed = 0.4


function createMaterialArray() {
  const skyboxImagepaths = ['../img/skybox/space_ft.png', '../img/skybox/space_bk.png', '../img/skybox/space_up.png', '../img/skybox/space_dn.png', '../img/skybox/space_rt.png', '../img/skybox/space_lf.png']
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  const planetTexture = loader.load(texture);
  const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });

  const planet = new THREE.Mesh(geometry, material);

  return planet
}





function createRing(innerRadius, options = {}) {
  let outerRadius = innerRadius - (options.thickness || 0.1);
  let thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  let material;
  if (options.texture) {
    const texture = new THREE.TextureLoader().load(options.texture);
    material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: options.opacity || 0.6 });
  } else {
    material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  }
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}


function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  setSkyBox();

  // Create planets with metadata
  planet_sun = loadPlanetTexture("../img/sun_hd.jpg", 20, 100, 100, 'basic');
  planet_sun.userData = { name: "Sun", type: "Star", size: 20, distance: 0 };
  planet_mercury = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100, 'standard');
  planet_mercury.userData = { name: "Mercury", type: "Planet", size: 2, distance: mercury_orbit_radius };
  planet_venus = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100, 'standard');
  planet_venus.userData = { name: "Venus", type: "Planet", size: 3, distance: venus_orbit_radius };
  planet_earth = loadPlanetTexture("../img/earth_hd.jpg", 4, 100, 100, 'standard');
  planet_earth.userData = { name: "Earth", type: "Planet", size: 4, distance: earth_orbit_radius };
  planet_mars = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100, 'standard');
  planet_mars.userData = { name: "Mars", type: "Planet", size: 3.5, distance: mars_orbit_radius };
  planet_jupiter = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100, 'standard');
  planet_jupiter.userData = { name: "Jupiter", type: "Planet", size: 10, distance: jupiter_orbit_radius };
  planet_saturn = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100, 'standard');
  planet_saturn.userData = { name: "Saturn", type: "Planet", size: 8, distance: saturn_orbit_radius };
  planet_uranus = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100, 'standard');
  planet_uranus.userData = { name: "Uranus", type: "Planet", size: 6, distance: uranus_orbit_radius };
  planet_neptune = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100, 'standard');
  planet_neptune.userData = { name: "Neptune", type: "Planet", size: 5, distance: neptune_orbit_radius };

  planetMeshes = [planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune, planet_sun];

  // planet_earth_label = new THREE.TextGeometry( text, parameters );
  // planet_mercury_label = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100);
  // planet_venus_label = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100);
  // planet_mars_label = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100);
  // planet_jupiter_label = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100);
  // planet_saturn_label = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100);
  // planet_uranus_label = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100);
  // planet_neptune_label = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100);

  // ADD PLANETS TO THE SCENE
  scene.add(planet_earth);
  scene.add(planet_sun);
  scene.add(planet_mercury);
  scene.add(planet_venus);
  scene.add(planet_mars);
  scene.add(planet_jupiter);
  scene.add(planet_saturn);
  scene.add(planet_uranus);
  scene.add(planet_neptune);

  // --- Add Astronaut (Space Shuttle) Image as Plane Mesh ---
  const shuttleTexture = new THREE.TextureLoader().load("../img/space_shuttle.jpg");
  const shuttleMaterial = new THREE.MeshBasicMaterial({ map: shuttleTexture, transparent: true });
  const shuttleWidth = 8; // realistic size
  const shuttleHeight = 4;
  const shuttleGeometry = new THREE.PlaneGeometry(shuttleWidth, shuttleHeight);
  window.shuttleMesh = new THREE.Mesh(shuttleGeometry, shuttleMaterial); // global for animation
  // Initial position near Earth
  window.shuttleMesh.position.set(
    planet_earth.position.x + 12,
    planet_earth.position.y + 6,
    planet_earth.position.z + 0
  );
  window.shuttleMesh.rotation.y = Math.PI / 4; // slight angle for realism
  window.shuttleMesh.rotation.x = -Math.PI / 12;
  scene.add(window.shuttleMesh);

  // Raycaster setup
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);

  const sunLight = new THREE.PointLight(0xffffff, 1, 0); // White light, intensity 1, no distance attenuation
  sunLight.position.copy(planet_sun.position); // Position the light at the Sun's position
  scene.add(sunLight);

  // Rotation orbit
  createRing(mercury_orbit_radius);
  createRing(venus_orbit_radius);
  createRing(earth_orbit_radius);
  createRing(mars_orbit_radius);
  createRing(jupiter_orbit_radius);
  // Saturn's ring as a child of Saturn mesh
  const saturnRing = createRing(15, { texture: '../img/saturn_ring.jpg', opacity: 0.85, thickness: 2 });
  saturnRing.position.set(0, 0, 0); // Centered on Saturn
  planet_saturn.add(saturnRing);
  // Add Saturn's orbit ring
  createRing(saturn_orbit_radius);
  createRing(uranus_orbit_radius);
  createRing(neptune_orbit_radius);




  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  camera.position.z = 100;
}


function planetRevolver(time, speed, planet, orbitRadius, planetName) {

  let orbitSpeedMultiplier = 0.001;
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}



function animate(time) {
  // Only animate if not paused
  if (isPaused) return;

  // Rotate the planets
  const rotationSpeed = 0.005;
  planet_earth.rotation.y += rotationSpeed;
  planet_sun.rotation.y += rotationSpeed;
  planet_mercury.rotation.y += rotationSpeed;
  planet_venus.rotation.y += rotationSpeed;
  planet_mars.rotation.y += rotationSpeed;
  planet_jupiter.rotation.y += rotationSpeed;
  planet_saturn.rotation.y += rotationSpeed;
  planet_uranus.rotation.y += rotationSpeed;
  planet_neptune.rotation.y += rotationSpeed;

  // Revolve planets around the sun
  planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius, 'mercury');
  planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius, 'venus');
  planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius, 'earth');
  planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius, 'mars');
  planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, 'jupiter');
  planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius, 'saturn');
  planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius, 'uranus');
  planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius, 'neptune');

  // Make shuttle orbit around Earth
  if (window.shuttleMesh && planet_earth) {
    // Shuttle orbit parameters
    const shuttleOrbitRadius = 12; // distance from Earth
    const shuttleOrbitHeight = 6; // height above Earth
    const shuttleOrbitSpeed = 0.002; // relative speed
    // Calculate shuttle's angle around Earth
    const shuttleAngle = time * shuttleOrbitSpeed;
    // Shuttle position in Earth's local orbit
    const shuttleX = planet_earth.position.x + shuttleOrbitRadius * Math.cos(shuttleAngle);
    const shuttleY = planet_earth.position.y + shuttleOrbitHeight;
    const shuttleZ = planet_earth.position.z + shuttleOrbitRadius * Math.sin(shuttleAngle);
    window.shuttleMesh.position.set(shuttleX, shuttleY, shuttleZ);
    // Orient shuttle to face direction of motion
    window.shuttleMesh.lookAt(planet_earth.position.x, planet_earth.position.y, planet_earth.position.z);
    window.shuttleMesh.rotateX(-Math.PI / 8); // slight tilt for realism
  }

  // Animate shooting stars
  updateShootingStars();
  // Animate comets
  updateComets();
  controls.update();
  renderer.render(scene, camera);
}

// Raycasting logic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Update onMouseMove and add click event for fixing tooltip
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const data = planet.userData;
    // Wikipedia links for each planet
    const wikiLinks = {
      'Sun': 'https://en.wikipedia.org/wiki/Sun',
      'Mercury': 'https://en.wikipedia.org/wiki/Mercury_(planet)',
      'Venus': 'https://en.wikipedia.org/wiki/Venus',
      'Earth': 'https://en.wikipedia.org/wiki/Earth',
      'Mars': 'https://en.wikipedia.org/wiki/Mars',
      'Jupiter': 'https://en.wikipedia.org/wiki/Jupiter',
      'Saturn': 'https://en.wikipedia.org/wiki/Saturn',
      'Uranus': 'https://en.wikipedia.org/wiki/Uranus',
      'Neptune': 'https://en.wikipedia.org/wiki/Neptune'
    };
    let wikiHtml = '';
    if (wikiLinks[data.name]) {
      wikiHtml = `<br><a href='${wikiLinks[data.name]}' target='_blank' style='color:#ffd700;text-decoration:underline;font-weight:bold;'>Learn more on Wikipedia</a>`;
      wikiHtml += `<br><button onclick='showPlanetInfo("${data.name}")' style='background:#4CAF50;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-top:4px;font-size:12px;'>More Info</button>`;
    }
    tooltip.innerHTML = `<strong>${data.name}</strong><br>Type: ${data.type}<br>Size: ${data.size}<br>Distance: ${data.distance}${wikiHtml}`;
    if (!tooltipIsFixed) {
      tooltip.style.left = (event.clientX + 15) + 'px';
      tooltip.style.top = (event.clientY + 15) + 'px';
      tooltipFixedPos.left = tooltip.style.left;
      tooltipFixedPos.top = tooltip.style.top;
    } else {
      tooltip.style.left = tooltipFixedPos.left;
      tooltip.style.top = tooltipFixedPos.top;
    }
    tooltip.style.display = 'block';
  } else {
    if (!tooltipIsHovered && !tooltipIsFixed) {
      tooltip.style.display = 'none';
    }
  }
  controls.update();
  renderer.render(scene, camera);
}

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    // Planet was clicked - fix the tooltip position
    tooltipIsFixed = true;
    tooltip.style.left = tooltipFixedPos.left;
    tooltip.style.top = tooltipFixedPos.top;
    tooltip.style.display = 'block';
  } else {
    // Clicked outside - hide tooltip if it's fixed
    if (tooltipIsFixed) {
      tooltipIsFixed = false;
      tooltip.style.display = 'none';
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

init();

// --- UI BUTTONS ---
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'fixed';
controlsContainer.style.top = '30px';
controlsContainer.style.left = '50%';
controlsContainer.style.transform = 'translateX(-50%)';
controlsContainer.style.display = 'flex';
controlsContainer.style.gap = '18px';
controlsContainer.style.zIndex = '1001';
document.body.appendChild(controlsContainer);

function createButton(text, id) {
  const btn = document.createElement('button');
  btn.id = id;
  btn.innerHTML = `<span>${text}</span>`;
  btn.className = 'solar-btn';
  controlsContainer.appendChild(btn);
  return btn;
}

createButton('⏸️ Pause', 'pauseResumeBtn');
createButton('Reset', 'resetBtn');
createButton('Focus on Sun', 'focusSunBtn');
// Add mute/unmute button for background music
createButton('🔊 Mute Music', 'muteMusicBtn');

// --- CSS for 3D animated buttons ---
const style = document.createElement('style');
style.innerHTML = `
  .solar-btn {
    background: linear-gradient(135deg, #7b2ff2 0%, #f357a8 50%, #4e54c8 100%);
    color: #f8f6f2;
    border: none;
    border-radius: 16px;
    padding: 16px 38px;
    font-size: 1.15rem;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    box-shadow: 0 6px 24px 0 rgba(44, 44, 44, 0.28), 0 0 0 3px #d4af3777 inset;
    cursor: pointer;
    transition: transform 0.22s cubic-bezier(.25,.8,.25,1), box-shadow 0.22s, background 0.32s;
    outline: none;
    margin: 0;
    position: relative;
    overflow: hidden;
    z-index: 1;
    letter-spacing: 0.02em;
  }
  .solar-btn::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: linear-gradient(120deg, #d4af37 0%, #fffbe6 100%);
    opacity: 0.10;
    filter: blur(22px);
    z-index: 0;
    transition: opacity 0.3s;
  }
  .solar-btn:hover::before {
    opacity: 0.22;
  }
  .solar-btn::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 16px;
    box-shadow: 0 0 18px 4px #d4af3733, 0 0 0 2px #d4af37 inset;
    pointer-events: none;
    z-index: 1;
    opacity: 0.13;
    transition: opacity 0.3s;
  }
  .solar-btn:hover::after {
    opacity: 0.28;
  }
  .solar-btn span {
    position: relative;
    z-index: 2;
    display: inline-block;
    transition: transform 0.22s;
    font-weight: 500;
    text-shadow: 0 1px 2px #23252644;
  }
  .solar-btn:hover span {
    transform: scale(1.12) rotate(-2deg);
    text-shadow: 0 0 10px #d4af37, 0 0 2px #fff;
  }
  .solar-btn:hover {
    background: linear-gradient(135deg, #414345 0%, #232526 100%);
    box-shadow: 0 12px 36px 0 #d4af3722, 0 0 0 4px #d4af37 inset;
    transform: scale(1.06) rotateX(4deg) rotateY(-4deg);
  }
  .solar-btn:active {
    transform: scale(0.97) rotateX(0deg) rotateY(0deg);
    box-shadow: 0 2px 8px rgba(44,44,44,0.18);
    background: linear-gradient(135deg, #232526 0%, #414345 100%);
  }
`;
document.head.appendChild(style);

// --- Animation control logic ---

let isPaused = false;
let lastTime = 0;
let animationFrameId = null;

// --- Shooting Stars ---
let shootingStars = [];
function createShootingStar() {
  // Random color for each shooting star
  const colors = [0xff99cc, 0x99ccff, 0xffff99, 0x99ff99, 0xffcc99, 0xcc99ff];
  const color = colors[Math.floor(Math.random() * colors.length)];
  // Shooting star geometry and material (larger and glowing)
  const geometry = new THREE.SphereGeometry(0.6, 18, 18);
  const material = new THREE.MeshBasicMaterial({ color, emissive: color, emissiveIntensity: 1 });
  const star = new THREE.Mesh(geometry, material);
  // Create a longer, fading trail
  const trailLength = 8 + Math.random() * 8;
  const trailPoints = [];
  for (let i = 0; i < trailLength; i++) {
    trailPoints.push(new THREE.Vector3(-i * 1.2, i * 1.2, 0));
  }
  const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
  const trailMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  star.add(trail);
  // Random start position (top, left, or right edge)
  const edgeRand = Math.random();
  if (edgeRand < 0.33) {
    // Top
    star.position.x = (Math.random() - 0.5) * 200;
    star.position.y = 80 + Math.random() * 20;
    star.position.z = (Math.random() - 0.5) * 200;
    star.userData.vx = 2.2 + Math.random() * 1.5;
    star.userData.vy = -3.2 - Math.random();
    star.userData.vz = 1.2 + Math.random();
  } else if (edgeRand < 0.66) {
    // Left
    star.position.x = -120 - Math.random() * 20;
    star.position.y = (Math.random() - 0.5) * 80 + 40;
    star.position.z = (Math.random() - 0.5) * 200;
    star.userData.vx = 3.2 + Math.random() * 1.5;
    star.userData.vy = -2.2 - Math.random();
    star.userData.vz = 1.2 + Math.random();
  } else {
    // Right
    star.position.x = 120 + Math.random() * 20;
    star.position.y = (Math.random() - 0.5) * 80 + 40;
    star.position.z = (Math.random() - 0.5) * 200;
    star.userData.vx = -3.2 - Math.random() * 1.5;
    star.userData.vy = -2.2 - Math.random();
    star.userData.vz = 1.2 + Math.random();
  }
  scene.add(star);
  shootingStars.push(star);
}

function updateShootingStars() {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.position.x += star.userData.vx;
    star.position.y += star.userData.vy;
    star.position.z += star.userData.vz;
    // Remove if out of view
    if (star.position.x > 150 || star.position.y < -80 || star.position.x < -150 || star.position.y > 120) {
      scene.remove(star);
      shootingStars.splice(i, 1);
    }
  }
}

// Periodically create shooting stars
// Dramatic: more frequent shooting stars
setInterval(() => {
  if (!isPaused) {
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.8) createShootingStar();
    }
  }
}, 400);

// --- Comets ---
let comets = [];
function createComet() {
  // Comet head: larger, very bright, glowing sphere
  const headGeometry = new THREE.SphereGeometry(2, 24, 24);
  const headMaterial = new THREE.MeshBasicMaterial({ color: 0xfff700, emissive: 0xfff700, emissiveIntensity: 4 });
  const cometHead = new THREE.Mesh(headGeometry, headMaterial);

  // Comet tail: much longer, brighter, and more visible
  const tailLength = 40 + Math.random() * 30;
  const tailPoints = [];
  for (let i = 0; i < tailLength; i++) {
    tailPoints.push(new THREE.Vector3(-i * 2.2, i * 1.2, 0));
  }
  const tailGeometry = new THREE.BufferGeometry().setFromPoints(tailPoints);
  const tailMaterial = new THREE.LineBasicMaterial({ color: 0xfff700, transparent: true, opacity: 0.85, linewidth: 8 });
  const tail = new THREE.Line(tailGeometry, tailMaterial);
  cometHead.add(tail);

  // Random start position (top or left edge)
  const edge = Math.random() < 0.5 ? 'top' : 'left';
  if (edge === 'top') {
    cometHead.position.x = (Math.random() - 0.5) * 200;
    cometHead.position.y = 90 + Math.random() * 30;
    cometHead.position.z = (Math.random() - 0.5) * 200;
    cometHead.userData.vx = 2.5 + Math.random();
    cometHead.userData.vy = -3.5 - Math.random();
    cometHead.userData.vz = 1.2 + Math.random();
  } else {
    cometHead.position.x = -140 - Math.random() * 30;
    cometHead.position.y = (Math.random() - 0.5) * 80 + 40;
    cometHead.position.z = (Math.random() - 0.5) * 200;
    cometHead.userData.vx = 3.5 + Math.random();
    cometHead.userData.vy = -2.5 - Math.random();
    cometHead.userData.vz = 1.2 + Math.random();
  }
  scene.add(cometHead);
  comets.push(cometHead);
}

function updateComets() {
  for (let i = comets.length - 1; i >= 0; i--) {
    const comet = comets[i];
    comet.position.x += comet.userData.vx;
    comet.position.y += comet.userData.vy;
    comet.position.z += comet.userData.vz;
    // Remove if out of view
    if (comet.position.x > 180 || comet.position.y < -100 || comet.position.x < -180 || comet.position.y > 150) {
      scene.remove(comet);
      comets.splice(i, 1);
    }
  }
}

// Occasionally spawn comets
setInterval(() => {
  if (!isPaused && Math.random() < 0.15) createComet();
}, 2000);

function animateWrapper(time) {
  if (!isPaused) {
    animate(time);
    lastTime = time;
    animationFrameId = requestAnimationFrame(animateWrapper);
  } else {
    // When paused, keep updating controls and rendering for smooth orbit rotation
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animateWrapper);
  }
}
// Start animation loop
animationFrameId = requestAnimationFrame(animateWrapper);

// Pause/Resume toggle button
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
pauseResumeBtn.onclick = function() {
  isPaused = !isPaused;
  pauseResumeBtn.innerText = isPaused ? '▶️ Resume' : '⏸️ Pause';
  if (!isPaused && !animationFrameId) {
    animationFrameId = requestAnimationFrame(animateWrapper);
  }
};

// Mute/Unmute music button logic
const muteMusicBtn = document.getElementById('muteMusicBtn');
muteMusicBtn.onclick = function() {
  bgAudio.muted = !bgAudio.muted;
  muteMusicBtn.innerText = bgAudio.muted ? '🔈 Unmute Music' : '🔊 Mute Music';
};

// Pause/Resume with spacebar
window.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    isPaused = !isPaused;
    pauseResumeBtn.innerText = isPaused ? '▶️ Resume' : '⏸️ Pause';
    if (!isPaused && !animationFrameId) {
      animationFrameId = requestAnimationFrame(animateWrapper);
    }
  }
});

// Reset button: reset camera to default view
document.getElementById('resetBtn').onclick = function() {
  controls.target.set(0, 0, 0);
  camera.position.set(0, 0, 100);
  controls.update();
};

// Focus on Sun button: smooth camera move to Sun
document.getElementById('focusSunBtn').onclick = function() {
  const duration = 900; // ms
  const start = performance.now();
  const startPos = camera.position.clone();
  const endPos = planet_sun.position.clone().add(new THREE.Vector3(0, 0, 40));
  const startTarget = controls.target.clone();
  const endTarget = planet_sun.position.clone();

  function animateCamera(ts) {
    const t = Math.min((ts - start) / duration, 1);
    camera.position.lerpVectors(startPos, endPos, t);
    controls.target.lerpVectors(startTarget, endTarget, t);
    controls.update();
    if (t < 1) requestAnimationFrame(animateCamera);
  }
  requestAnimationFrame(animateCamera);
};