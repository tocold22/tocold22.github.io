/***********
 * assignment4problem1.js
 * Generates random sized and colored boxes
 * Alexander Gribtsov
 * February 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    //floor
    let floorGeometry = new THREE.PlaneGeometry(200, 200);
    let floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
    scene.add(floor);

    // Random boxes
    let boxes = randomBoxes(100, 5, 20, 5, 60);
    boxes.forEach(box => {
        scene.add(box);
    });

    // Axes for reference
    let axes = new THREE.AxesHelper(100);
    scene.add(axes);
}

function randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight) {
    let boxes = [];
    for (let i = 0; i < nbrBoxes; i++) {
        let width = THREE.Math.randFloat(minSide, maxSide);
        let depth = THREE.Math.randFloat(minSide, maxSide);
        let height = THREE.Math.randFloat(minHeight, maxHeight);
        let boxGeometry = new THREE.BoxGeometry(width, height, depth);
        let hue = Math.random();
        let saturation = THREE.Math.randFloat(0.8, 0.95);
        let lightness = THREE.Math.randFloat(0.3, 0.7);
        let color = new THREE.Color(`hsl(${hue * 360}, ${saturation * 100}%, ${lightness * 100}%)`);
        let boxMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, saturation, lightness), // Correctly set color
            transparent: true,
            opacity: 0.8
        });
        let box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Positions the box base above the floor
        box.position.x = THREE.Math.randFloatSpread(200 - width);
        box.position.y = height / 2; // Y is up, so position at half the height
        box.position.z = THREE.Math.randFloatSpread(200 - depth);
        
        boxes.push(box);
    }
    return boxes;
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

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
    camera.position.set(0, 100, 400);
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