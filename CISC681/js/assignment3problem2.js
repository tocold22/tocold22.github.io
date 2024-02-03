/***********
 * assignment3problem2.js
 * Helix of spheres with GUI control for parameters
 * Alexander Gribtsov
 * February 2024
 ***********/

// Sets up the scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets up camera position
camera.position.set(0, 10, 30);
camera.lookAt(scene.position);

// Sets up the lighting
let light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 20, 20);
scene.add(light);

// Adds an ambient light for softer shadows
let ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Camera controls
let cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

function createHelix(object, n, radius, angle, dist) {
    let group = new THREE.Group();

    for (let i = 0; i < n; i++) {
        let clone = object.clone();
        let x = radius * Math.cos(angle * i);
        let y = radius * Math.sin(angle * i);
        let z = dist * i;
        clone.position.set(x, y, z);
        clone.lookAt(new THREE.Vector3(0, 0, z));
        group.add(clone);
    }

    return group;
}

// Creates the helix and add it to the scene
function createScene() {
    let mat = new THREE.MeshLambertMaterial({ color: 'blue' });
    let geom = new THREE.SphereGeometry(1, 12, 12);
    let mesh = new THREE.Mesh(geom, mat);
    let helix = createHelix(mesh, 49, 2, Math.PI / 4, 0.5);
    scene.add(helix);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    cameraControls.update();
    renderer.render(scene, camera);
}

createScene();

animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
