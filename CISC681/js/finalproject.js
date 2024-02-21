/***********
 * solarSystem.js
 * A scaled-down solar system with realistic-looking planets and controllable animations
 * Alexander Gribtsov
 * February 2024
 ***********/
// Tested on http://localhost:8000/show1.html?load=js/finalproject.js 
// Reminder to self: don't forget to upload textures, audio files and html with css

// Set up the scene
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let solarSystem = { planets: [] };
let targetPlanet = null; // Global variables to hold the target planet and camera offset
let cameraOffset = new THREE.Vector3();

let currentAudio = null; //global for audio

let guiControls = {
    rotationSpeed: 10,
    animate: true,
    showOrbits: true // Flag to show planet orbits, initially set to true
};

// Scales for the planets to make them a pleasant size relative to each other
const planetScales = {
    "Sun": 23*1, // Sun is only one true size all others are increased by 3
    "Mercury": 0.383*3,
    "Venus": 0.949*3,
    "Earth": 1*3,
    "Mars": 0.532*3,
    "Jupiter": 11.21*3,
    "Saturn": 9.45*3,
    "Uranus": 4*3,
    "Neptune": 3.88*3
};

// Distances to offset each planet from the sun, not to scale for visualization purposes
const planetDistances = {
    "Mercury": 100,
    "Venus": 150,
    "Earth": 200,
    "Mars": 300,
    "Jupiter": 450,
    "Saturn": 650,
    "Uranus": 850,
    "Neptune": 1050
};

// Textures for the planets, assumed to be in a directory 'textures/'
const planetTextures = {
    "Sun": 'textures/sun.jpg',
    "Mercury": 'textures/mercury.jpg',
    "Venus": 'textures/venus.jpg',
    "Earth": 'textures/earth.jpg',
    "Mars": 'textures/mars.jpg',
    "Jupiter": 'textures/jupiter.jpg',
    "Saturn": 'textures/saturn.jpg',
    "Uranus": 'textures/uranus.jpg',
    "Neptune": 'textures/neptune.jpg'
};

function createOrbitLine(radius) {
    const segments = 128;
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: false, opacity: 1 });
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.vertices.shift(); // Remove the center vertex
    geometry.rotateX(Math.PI / 2); // Rotate the geometry to align it with the XZ plane
    return new THREE.LineLoop(geometry, material);
}

function createScene() {
    Object.keys(planetScales).forEach((planetName) => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(planetTextures[planetName]);

        if (planetName === "Sun") {
            // For the Sun, use MeshBasicMaterial to apply the texture
            const sunMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
            const sunGeometry = new THREE.SphereGeometry(planetScales[planetName], 32, 32);
            const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

            // Add a PointLight to simulate the Sun's light
            const sunLight = new THREE.PointLight(0xffffff, 1.5, 0); // Adjust color, intensity, and distance
            sunMesh.add(sunLight); // This makes the light move with the Sun

            scene.add(sunMesh);
            solarSystem.planets.push({
                name: planetName,
                mesh: sunMesh,
                orbit: null,
                orbitSpeed: 0
            });
        } else {
            const geometry = new THREE.SphereGeometry(planetScales[planetName], 32, 32);
            const material = new THREE.MeshPhongMaterial({ map: texture });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = planetDistances[planetName];
            scene.add(planet);

            const orbit = createOrbitLine(planetDistances[planetName]);
            orbit.visible = guiControls.showOrbits;
            scene.add(orbit);

            solarSystem.planets.push({
                name: planetName,
                mesh: planet,
                orbit: orbit,
                orbitSpeed: 1 / planetDistances[planetName]
            });
        }
    });
}

function updateOrbitVisibility() {
    solarSystem.planets.forEach(planet => {
        if (planet.orbit) planet.orbit.visible = guiControls.showOrbits;
    });
}

function animate() {
    requestAnimationFrame(animate);
    let deltaTime = clock.getDelta();

    solarSystem.planets.forEach(planet => {
        if (planet.name === "Sun") {
            planet.mesh.rotation.y += 0.05 * guiControls.rotationSpeed * deltaTime;
        } else {
            const orbitSpeedAdjusted = (1 / planetDistances[planet.name]) * guiControls.rotationSpeed;
            planet.mesh.position.x = Math.cos(clock.elapsedTime * orbitSpeedAdjusted) * planetDistances[planet.name];
            planet.mesh.position.z = Math.sin(clock.elapsedTime * orbitSpeedAdjusted) * planetDistances[planet.name];
            planet.mesh.rotation.y += 0.1 * guiControls.rotationSpeed * deltaTime;

            // Update marker position to match the planet's new position
            if (planet.marker) {
                planet.marker.position.copy(planet.mesh.position);
            }
        }
    });

    if (targetPlanet) {
        const targetPosition = new THREE.Vector3().copy(targetPlanet.position).add(cameraOffset);
        camera.position.lerp(targetPosition, 0.005); // Adjust the lerp factor for smoother transition
        camera.lookAt(targetPlanet.position);
    }

    render();
}

function render() {
    renderer.render(scene, camera);
}

function init() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(60, canvasRatio, 1, 4000);
    camera.position.set(0, 500, 1500);
    camera.lookAt(scene.position);

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    let ambientLight = new THREE.AmbientLight(0x333333); // Add soft white light to the scene
    scene.add(ambientLight);

    document.body.appendChild(renderer.domElement);

    // Create details div for displaying selected planet information
    const detailsDiv = document.createElement('div');
    detailsDiv.id = 'planetDetails';
    detailsDiv.style.position = 'absolute';
    detailsDiv.style.top = '10px';
    detailsDiv.style.left = '10px';
    detailsDiv.style.color = 'white';
    detailsDiv.style.padding = '10px';
    detailsDiv.style.border = '2px solid #00ff00'; // Futuristic green border
    detailsDiv.style.borderRadius = '10px'; // Rounded corners
    detailsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
    detailsDiv.style.fontSize = '16px'; // Larger font size
    detailsDiv.style.fontFamily = 'Arial, sans-serif';
    detailsDiv.style.width = '250px'; // Set a fixed width
    detailsDiv.style.height = 'auto'; // Auto-adjust height based on content
    detailsDiv.style.boxShadow = '0 0 10px #00ff00'; // Green glow effect for a futuristic look
    detailsDiv.style.zIndex = '1000'; // Ensure it's above other elements

    document.body.appendChild(detailsDiv);

    createScene();
    addGUIControls(); // Add GUI controls
    animate();
}

function createPlanetMarker(planet) {
    // Ensure removal of any existing marker from the scene
    if (planet.marker) {
        scene.remove(planet.marker);
        planet.marker = undefined;
    }

    // Create a new marker
    const ringGeometry = new THREE.TorusGeometry(planet.mesh.geometry.boundingSphere.radius * 5.2, .03, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.copy(planet.mesh.position);

    planet.marker = ringMesh;
    scene.add(ringMesh);

    console.log(`Marker added for ${planet.name}`);
}

// Additional functions for GUI controls
function addGUIControls() {
    const gui = new dat.GUI();
    gui.add(guiControls, 'showOrbits').name('Show Orbits').onChange(updateOrbitVisibility);
    gui.add(guiControls, 'rotationSpeed', 10, 100).name('Rotation Speed');

    // Add dropdown for planet selection with zoom functionality
    const planetNames = Object.keys(planetScales);
    const zoomOptions = ['None', ...planetNames];
    guiControls.selectedPlanet = 'None'; // Default selection
    gui.add(guiControls, 'selectedPlanet', zoomOptions).name('Select Planet').onChange(zoomIntoPlanet);

    // Add the "Play Intro" button
    gui.add({playIntro: playIntroAudio}, 'playIntro').name('Play Intro');

    // Add "Turn Off Audio" button
    gui.add({turnOffAudio: stopAudioPlayback}, 'turnOffAudio').name('Turn Off Audio');


    updateOrbitVisibility(); // Initial update

    // Trigger the zoom into "None" option to display solar system information on startup
    zoomIntoPlanet(guiControls.selectedPlanet);
}

function playIntroAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Stop any currently playing audio
    }

    // Path to your intro audio file
    const audioSrc = 'audio/welcome.m4a';
    currentAudio = new Audio(audioSrc);
    currentAudio.play().catch(error => {
        console.error("Error playing intro audio:", error);
        // Handle autoplay issues here, possibly due to browser policies
    });
}

function stopAudioPlayback() {
    if (currentAudio) {
        currentAudio.pause(); // Pause the audio
        currentAudio.currentTime = 0; // Reset playback position to the start
    }
}

function zoomIntoPlanet(planetName) {
    solarSystem.planets.forEach(planet => {
        // Ensure any existing marker is removed
        if (planet.marker) {
            scene.remove(planet.marker);
            planet.marker = undefined;
        }
    });

    const planet = solarSystem.planets.find(p => p.name === planetName);
    if (planet) {
        // Calculate the appropriate distance from the planet, ensuring it's fully visible
        const distance = planet.mesh.geometry.boundingSphere.radius * 1; // Distance multiplier for visibility

        // Offset to position the camera beside the planet, rather than directly at its center
        // Adjust the X and Z values to control the side offset and distance from the planet
        const offset = new THREE.Vector3(1, 2, 1).normalize().multiplyScalar(distance);

        // Apply the offset to the planet's current position to get the camera's new position
        const cameraPosition = planet.mesh.position.clone().add(offset);

        camera.position.copy(cameraPosition);
        camera.lookAt(planet.mesh.position); // Focus the camera on the planet

        targetPlanet = planet.mesh; // Update the global targetPlanet reference

        // Create or update a marker for the selected planet, if needed
        createPlanetMarker(planet);

        // Update the details div with planet information
        const detailsDiv = document.getElementById('planetDetails');
        detailsDiv.innerHTML = `Name: ${planet.name}<br>Size Scale: ${planetScales[planet.name]}<br>Distance from Sun: ${planetDistances[planet.name] || 'N/A'} units`; // 'N/A' for the Sun
    } else {
        // If 'None' is selected, display general solar system information
        const detailsDiv = document.getElementById('planetDetails');
        detailsDiv.innerHTML = `
            <strong>Our Solar System</strong><br>
            - Center: The Sun, a star<br>
            - Number of Planets: 8<br>
            - Known Dwarf Planets: 5<br>
            - First Planet: Mercury<br>
            - Largest Planet: Jupiter<br>
            Explore the solar system by selecting a planet.`;

        targetPlanet = null; // Reset targetPlanet  
    }
    // Stop the currently playing audio (if any)
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Rewind the audio
    }

    // Load and play the new audio file for the selected planet
    const audioSrc = `audio/${planetName.toLowerCase()}.m4a`; // Adjust the path as necessary
    currentAudio = new Audio(audioSrc);
    currentAudio.play().catch(error => {
        console.error("Error playing audio:", error);
        // Autoplay might fail if not triggered by a direct user action
        // Handle or log errors here
    });
}
init();