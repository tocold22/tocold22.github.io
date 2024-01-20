/***********
 * assignment2problem1.js
 * Starburst Torus
 * Alexander Gribtsov
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

// Defines variables for the controls
let params = {
    nbrOfStarbursts: 100,
    minorRadius: 1.5,
    updateTorus: function() {
        // Removes the old torus
        let selectedObject = scene.getObjectByName('torusStarbursts');
        scene.remove(selectedObject);

        // Adds a new torus with the updated parameters
        let newTorus = createTorusWithStarbursts(3, params.minorRadius, params.nbrOfStarbursts, 0.2, 20);
        newTorus.name = 'torusStarbursts'; // Name it for easy reference
        scene.add(newTorus);
    }
};

// Creates dat.GUI and add controls
let gui = new dat.GUI();
gui.add(params, 'nbrOfStarbursts', 0, 2000).step(1).onChange(params.updateTorus);
gui.add(params, 'minorRadius', 0.1, 5).step(0.1).onChange(params.updateTorus);

function createScene() {
    // Initially creates the torus with starbursts with default parameters
    let torusStarbursts = createTorusWithStarbursts(3, params.minorRadius, params.nbrOfStarbursts, 0.2, 20);
    torusStarbursts.name = 'torusStarbursts'; // Name it for easy reference
    scene.add(torusStarbursts);
}

function createTorusWithStarbursts(majorRadius, minorRadius, nbrOfStarbursts, starburstRadius, maxNbrOfRays) {
    let torusGeometry = new THREE.TorusGeometry(majorRadius, minorRadius, 30, 30);
    let torusMaterial = new THREE.MeshBasicMaterial({color: 0x444444, wireframe: true});
    let torus = new THREE.Mesh(torusGeometry, torusMaterial);

    // Create starbursts
    for (let i = 0; i < nbrOfStarbursts; i++) {
        // Random angles for u (along the torus' circular center) and v (inside the torus tube circle)
        let u = 2 * Math.PI * Math.random(); // Random angle for major circle
        let v = 2 * Math.PI * Math.random(); // Random angle for minor circle

        // Calculate the point on the surface of the torus
        let x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        let y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
        let z = minorRadius * Math.sin(v);

        // Create starburst at this point
        let starburst = makeStarburst(starburstRadius, maxNbrOfRays);
        starburst.position.set(x, y, z);

        // Align the starburst with the normal at this point on the torus
        let normal = new THREE.Vector3(x, y, z).normalize();
        starburst.lookAt(normal.add(starburst.position));

        // Add starburst to the torus
        torus.add(starburst);
    }

    return torus;
}

function makeStarburst(radius, maxNbrOfRays) {
    let starGeometry = new THREE.Geometry();
    let nbrOfRays = Math.floor(maxNbrOfRays * Math.random()) + 10; // At least 10 rays
    for (let i = 0; i < nbrOfRays; i++) {
        let theta = Math.random() * 2 * Math.PI;
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = radius * Math.sin(phi) * Math.cos(theta);
        let dy = radius * Math.sin(phi) * Math.sin(theta);
        let dz = radius * Math.cos(phi);
        starGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        starGeometry.vertices.push(new THREE.Vector3(dx, dy, dz));
        starGeometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));
        starGeometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));
    }
    let starMaterial = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
    let starburst = new THREE.LineSegments(starGeometry, starMaterial);
    return starburst;
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}

init();
createScene();
addToDOM();
animate();
