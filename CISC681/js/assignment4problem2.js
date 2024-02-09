/***********
 * assignment4problem2.js
 * A ring of nested tori with a central sphere and animations
 * Alexander Gribtsov
 * February 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let tori = [];
let centralSphere;
let guiControls = {
    toriRotationSpeed: 0.2,
    spherePulsationSpeed: 0.8
};

function createScene() {
    // Create nested tori
    let numTori = 10;
    let majorRadius = 20;
    let minorRadius = 2;
    for (let i = 0; i < numTori; i++) {
        let torusGeometry = new THREE.TorusGeometry(majorRadius - i * 2, minorRadius, 30, 30);
        let hue = i / numTori;
        let torusMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color().setHSL(hue, 1.0, 0.5) });
        let torus = new THREE.Mesh(torusGeometry, torusMaterial);
        scene.add(torus);
        tori.push(torus);
    }

    // Create central sphere
    let sphereGeometry = new THREE.SphereGeometry(minorRadius, 32, 32);
    let sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centralSphere);

    // Add light
    let light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(0, 50, 0);
    scene.add(light);

    // Add ambient light
    scene.add(new THREE.AmbientLight(0x222222));

    // GUI controls
    let gui = new dat.GUI();
    gui.add(guiControls, 'toriRotationSpeed', 0.01, 2.0);
    gui.add(guiControls, 'spherePulsationSpeed', 0.01, 2.0);
}

function animate() {
    window.requestAnimationFrame(animate);
    let deltaTime = clock.getDelta();
    let time = clock.getElapsedTime();

    // Animate tori
    tori.forEach((torus, index) => {
        torus.rotation.x += deltaTime * (index + 1) * guiControls.toriRotationSpeed;
        torus.rotation.y += deltaTime * (index + 1) * guiControls.toriRotationSpeed;
    });

    // Animate central sphere with a pulsating effect
    let scale = Math.sin(time * guiControls.spherePulsationSpeed) * 0.25 + 1;
    centralSphere.scale.set(scale, scale, scale);

    render();
}

function render() {
    cameraControls.update(clock.getDelta());
    renderer.render(scene, camera);
}

function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(60, canvasRatio, 1, 1000);
    camera.position.set(0, 60, 100);
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
