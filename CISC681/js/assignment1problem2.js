/***********
 * assignment1problem2.js
 * Geometry of a cylinder
 * Alexander Gribtsov
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    var cylinderGeometry = createCylinder(8, 5, 10);
    var cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    scene.add(cylinder);
}

function createCylinder(n, rad, len) {
    var geometry = new THREE.Geometry();

    // Creates top circle vertices
    for (let i = 0; i < n; i++) {
        let angle = (2 * Math.PI / n) * i;
        geometry.vertices.push(new THREE.Vector3(rad * Math.cos(angle), len / 2, rad * Math.sin(angle)));
    }

    // Creates bottom circle vertices
    for (let i = 0; i < n; i++) {
        let angle = (2 * Math.PI / n) * i;
        geometry.vertices.push(new THREE.Vector3(rad * Math.cos(angle), -len / 2, rad * Math.sin(angle)));
    }

    // Creates side faces
    for (let i = 0; i < n; i++) {
        let nextIndex = (i + 1) % n;
        // We create quads by adding two triangles that share an edge
        geometry.faces.push(new THREE.Face3(i, nextIndex, n + nextIndex));
        geometry.faces.push(new THREE.Face3(i, n + nextIndex, n + i));
    }
    // Computes normals for shading
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
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
