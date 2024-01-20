/***********
 * assignment1problem1.js
 * A regular polygon mesh with orbit control
 * Alexander Gribtsov
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let polygon = regularPolygonMesh(8, 5, new THREE.Color(0xff0000), new THREE.Color(0x0000ff));
    let axes = new THREE.AxesHelper(10);
    scene.add(polygon);
    scene.add(axes);
}

function regularPolygonMesh(n, rad, innerColor, outerColor) {
    var geometry = new THREE.Geometry();

    // Centers vertex
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    var centerColor = new THREE.Color(innerColor);

    // Sets Outer vertices and colors
    var outerColors = [];
    for (let i = 0; i < n; i++) {
        let angle = (i / n) * Math.PI * 2;
        geometry.vertices.push(new THREE.Vector3(Math.cos(angle) * rad, Math.sin(angle) * rad, 0));
        outerColors.push(new THREE.Color(outerColor));
    }

    // Creates faces and also assign vertex colors for the gradient
    for (let i = 1; i <= n; i++) {
        let face = new THREE.Face3(0, i, i % n + 1);
        face.vertexColors[0] = centerColor;
        face.vertexColors[1] = outerColors[i - 1];
        face.vertexColors[2] = outerColors[i % n];
        geometry.faces.push(face);
    }

    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
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
