import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';


const gui = new GUI();

// function to get random number in a range
const randInt = (min, max) => {  
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Loaders
const textureLoader = new THREE.TextureLoader();

const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();


const size = {
  width: innerWidth,
  height: innerHeight
}

// Lights
const ambientLight = new THREE.AmbientLight('#fff',3);
scene.add(ambientLight);


const debug = {
  curvePointCount: 20
}

// Road Texture
const roadTexture = textureLoader.load('./texture/road.jpg');
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.colorSpace = THREE.SRGBColorSpace;
roadTexture.flipY = false;
roadTexture.repeat.set(200,5)

const roadMat = new THREE.MeshStandardMaterial({ 
  side: THREE.DoubleSide,
  map: roadTexture,
});

// function to generate the road
let road


const generateRoad = () => {

  const { curvePointCount } = debug;

  // Removing previous road mesh, if it's rendered before
  if(road) {
    road.geometry.dispose();
    road.material.dispose();
    scene.remove(road);
  }

  const curvePoints = [];

  // Generating random positions
  for(let i = 0; i < curvePointCount; i++) {
    curvePoints.push(
      new THREE.Vector3(
        i==0?0:randInt(-6, 6),
        0,
        -(i * 5) + 5
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints);
  
  const pointsCount = 20 * debug.curvePointCount;
  const width = 2;
  const halfWidth = width / 2;

  const pts = [];
  const uvs = [];
  const indices = [];

  // Generate the geometry with proper width
  for(let i = 0; i < pointsCount; i++) {
    const t = i / (pointsCount - 1);
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    
    // Calculate the normal to the curve at this point
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    
    // Offset the points to create the road's width
    const leftPoint = point.clone().add(normal.clone().multiplyScalar(halfWidth));
    const rightPoint = point.clone().add(normal.clone().multiplyScalar(-halfWidth));
    
    pts.push(leftPoint, rightPoint);
    
    // UV coordinates
    uvs.push(i / (pointsCount - 1), 0);
    uvs.push(i / (pointsCount - 1), 1);
    
    if(i < pointsCount - 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const roadGeo = new THREE.BufferGeometry().setFromPoints(pts);
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roadGeo.setIndex(indices);
  roadGeo.computeVertexNormals();


  road = new THREE.Mesh(roadGeo, roadMat);
  scene.add(road);
}


generateRoad()


// Debug ui, managing the count of curve points
gui.add(debug,'curvePointCount').name('Curve Point Count').min(5).max(30).step(1).onFinishChange((val) => {
  generateRoad()
})



// Camera
const camera = new THREE.PerspectiveCamera(55, size.width / size.height, 0.1, 1000)
camera.position.set(0, 2, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true




// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

addEventListener('resize', () => {
  size.width = innerWidth;
  size.height = innerHeight;

  camera.aspect = size.width/ size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


// Animation Area
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();


  controls.update();
  renderer.render(scene,camera);
  requestAnimationFrame(tick);
}

tick()