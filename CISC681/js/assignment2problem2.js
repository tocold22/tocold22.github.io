/***********
 * assignment2problem2.js
 * Pyramid With Cherry on top
 * Alexander Gribtsov
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let toroidPyramid = createToroidPyramid(6, 5, 0.8, 0.1);
    let axes = new THREE.AxesHelper(10);
    scene.add(toroidPyramid);
    scene.add(axes);
}

function createToroidPyramid(numTori, bottomMajorRadius, majorRadiusStep, minorRadiusFactor) {
    let group = new THREE.Group();

    // Calculate the total height of the pyramid to centralize it
    let totalHeight = 0;
    for (let i = 0; i < numTori; i++) {
        totalHeight += minorRadiusFactor * (bottomMajorRadius - i * majorRadiusStep) * 2;
    }

    let currentHeight = -totalHeight / 2;

    // Create each torus in the pyramid
    for (let i = 0; i < numTori; i++) {
        let majorRadius = bottomMajorRadius - i * majorRadiusStep;
        let minorRadius = majorRadius * minorRadiusFactor;
        let torusGeometry = new THREE.TorusGeometry(majorRadius, minorRadius, 30, 30);
        let torusMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(`hsl(${(i / numTori) * 360}, 100%, 50%)`), side: THREE.DoubleSide });
        let torus = new THREE.Mesh(torusGeometry, torusMaterial);

        // Adjust torus position
        torus.position.y = currentHeight + minorRadius;
        currentHeight += minorRadius * 2;

        // Rotate the torus to stand vertically
        torus.rotation.x = Math.PI / 2;

        group.add(torus);
    }

    // Add the 'cherry' on top
    let cherryGeometry = new THREE.SphereGeometry(minorRadiusFactor * bottomMajorRadius, 32, 32);
    let cherryMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
    cherry.position.y = currentHeight + (minorRadiusFactor * bottomMajorRadius) / 2; // Position on top
    group.add(cherry);

    return group;
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
