import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let planet_sun_label;

// Store all planet meshes for raycasting
let planetMeshes = [];

// Tooltip element
let tooltip = document.createElement('div');
// --- Background Audio ---
const bgAudio = document.createElement('audio');
bgAudio.src = '../audio/Combined_Compressed.mp3';
bgAudio.loop = true;
bgAudio.autoplay = true;
bgAudio.volume = 1.0; // Set volume to maximum for better audibility
bgAudio.style.display = 'none';
document.body.appendChild(bgAudio);
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'none';
tooltip.style.background = 'rgba(0,0,0,0.8)';
tooltip.style.color = '#fff';
tooltip.style.padding = '8px 12px';
tooltip.style.borderRadius = '6px';
tooltip.style.fontSize = '14px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1000';
document.body.appendChild(tooltip);


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





function createRing(innerRadius) {
  let outerRadius = innerRadius - 0.1
  let thetaSegments = 100
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh)
  mesh.rotation.x = Math.PI / 2
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

  // Raycaster setup
  window.addEventListener('mousemove', onMouseMove, false);

  const sunLight = new THREE.PointLight(0xffffff, 1, 0); // White light, intensity 1, no distance attenuation
  sunLight.position.copy(planet_sun.position); // Position the light at the Sun's position
  scene.add(sunLight);

  // Rotation orbit
  createRing(mercury_orbit_radius)
  createRing(venus_orbit_radius)
  createRing(earth_orbit_radius)
  createRing(mars_orbit_radius)
  createRing(jupiter_orbit_radius)
  createRing(saturn_orbit_radius)
  createRing(uranus_orbit_radius)
  createRing(neptune_orbit_radius)




  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;

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

  controls.update();
  renderer.render(scene, camera);
}

// Raycasting logic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const data = planet.userData;
    tooltip.innerHTML = `<strong>${data.name}</strong><br>Type: ${data.type}<br>Size: ${data.size}<br>Distance: ${data.distance}`;
    tooltip.style.left = (event.clientX + 15) + 'px';
    tooltip.style.top = (event.clientY + 15) + 'px';
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }




  controls.update();
  renderer.render(scene, camera);
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
  btn.innerText = text;
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
    background: linear-gradient(135deg, #222 60%, #444 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    font-size: 1rem;
    font-family: inherit;
    box-shadow: 0 4px 18px rgba(0,0,0,0.25), 0 1.5px 0 #fff inset;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(.25,.8,.25,1), box-shadow 0.2s, background 0.3s;
    perspective: 300px;
    outline: none;
    margin: 0;
    position: relative;
  }
  .solar-btn:hover {
    transform: scale(1.08) rotateX(8deg) rotateY(-8deg);
    box-shadow: 0 8px 32px rgba(255,255,255,0.15), 0 2px 0 #fff inset;
    background: linear-gradient(135deg, #333 60%, #666 100%);
  }
  .solar-btn:active {
    transform: scale(0.98) rotateX(0deg) rotateY(0deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }
`;
document.head.appendChild(style);

// --- Animation control logic ---

let isPaused = false;
let lastTime = 0;
let animationFrameId = null;
function animateWrapper(time) {
  animate(time);
  lastTime = time;
  if (!isPaused) {
    animationFrameId = requestAnimationFrame(animateWrapper);
  } else {
    animationFrameId = null;
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