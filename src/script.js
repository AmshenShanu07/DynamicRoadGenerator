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


// function to generate the road
let road
const generateRoad = () => {

  const { curvePointCount } = debug;

  //Removing previous road mesh, if its rendered before
  if(road) {
    road.geometry.dispose()
    road.material.dispose()
    scene.remove(road)
  }

  const curvePoints = []
  
  //Generating random positions
  for( var i = 0; i<curvePointCount; i++ ) {
    curvePoints.push(
      new THREE.Vector3(
        randInt(-6,6),
        0,
        -(i*5) + 5
      )
    )
  }
  
  const curve = new THREE.CatmullRomCurve3(curvePoints);

  
  
  var pointsCount = 100;
  var pointsCount1 = pointsCount + 1;
  var width = 2;
  var widthSteps = 1;
  
  var pts = curve.getPoints(pointsCount);
  let pts2 = curve.getPoints(pointsCount);
  
  pts.forEach(p => {
    p.x -= width; // offsetting to make road center
  });
  
  pts2.forEach(p => {
    p.x += width; // creating width of the road
  });
  
  pts = pts.concat(pts2);
  
  var roadGeo = new THREE.BufferGeometry().setFromPoints(pts);
  
  
  
  var indices = [];
  const uv = []

  //Creating Faces and UV for geometry
  for (var iy = 0; iy < widthSteps; iy++)
    for (var ix = 0; ix < pointsCount; ix++) {
  
      var a = ix + pointsCount1 * iy;
      var b = ix + pointsCount1 * (iy + 1);
      var c = (ix + 1) + pointsCount1 * (iy + 1);
      var d = (ix + 1) + pointsCount1 * iy;
  
      indices.push(a, b, d);
      indices.push(b, c, d);
  
      uv.push(1.0,0.0);
      uv.push(0.0,0.0);
      uv.push(0.0,1.0);
      uv.push(1.0,1.0);
  
    }
  
  
  
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2))
  roadGeo.setIndex(indices);
  roadGeo.computeVertexNormals();
  
  
  // Road Texture
  const roadTexture = textureLoader.load('./texture/road.jpg');
  roadTexture.wrapS = THREE.RepeatWrapping;
  roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.colorSpace = THREE.SRGBColorSpace



  
  const roadMat = new THREE.MeshStandardMaterial({ 
    side: THREE.DoubleSide,
    map: roadTexture,
  });
  
  road = new THREE.Mesh(roadGeo, roadMat);

  
  scene.add(road);
}

generateRoad()


// Debug ui, managing the count of curve points
gui.add(debug,'curvePointCount').name('Curve Point Count').min(5).max(30).step(1).onFinishChange(() => {
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