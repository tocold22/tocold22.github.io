/***********
 * assignment3problem1.js
 * Sierpinski Tetrahedron with GUI control for level selection
 * Alexander Gribtsov
 * February 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let gui, control;

function createSierpinskiTetrahedron(level, size, position) {
    if (level === 0) {
        let geometry = new THREE.TetrahedronGeometry(size);
        // Changes to solid material
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let mesh = new THREE.Mesh(geometry, material);

        // Rotates the tetrahedron to stand on its base with the tip pointing up
        mesh.rotation.x = -Math.PI / 2;
        
        mesh.position.copy(position);
        
        scene.add(mesh);
    } else {
        let newSize = size / 2;
        // Calculates the height of the tetrahedron
        let height = newSize * Math.sqrt(2 / 3);
        // Calculates the vertical offset for the new tetrahedrons
        let verticalOffset = height / 2;

        // Calculates the positions for the smaller tetrahedra
        let positions = [
            new THREE.Vector3(position.x, position.y + verticalOffset, position.z),
            new THREE.Vector3(position.x - newSize / 2, position.y - verticalOffset, position.z + newSize / (2 * Math.sqrt(3))),
            new THREE.Vector3(position.x + newSize / 2, position.y - verticalOffset, position.z + newSize / (2 * Math.sqrt(3))),
            new THREE.Vector3(position.x, position.y - verticalOffset, position.z - newSize / Math.sqrt(3)),
        ];

        positions.forEach((pos) => {
            createSierpinskiTetrahedron(level - 1, newSize, pos);
        });
    }
}

function createScene() {
    scene = new THREE.Scene();
    updateSierpinskiTetrahedron();
}

function updateSierpinskiTetrahedron() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    let size = 10; // Adjusts the initial size as needed
    let height = size * Math.sqrt(2 / 3);
    let position = new THREE.Vector3(0, -height / 2, 0); // Adjusts position to ensure it is centered
    createSierpinskiTetrahedron(control.level, size, position);
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
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 0, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    // GUI for level control
    control = { level: 7 };
    gui = new dat.GUI();
    gui.add(control, 'level', 0, 7, 1).name('Recursion Level').onChange(updateSierpinskiTetrahedron);

    createScene();
    addToDOM();
    animate();
}

function addToDOM() {
    let container = document.getElementById('container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
    }
    container.appendChild(renderer.domElement);
}

init();
