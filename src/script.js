import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from "lil-gui";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 15;
camera.position.z = 1;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Lights
 */
// Directional light for shiny metallic effect
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Ambient light for overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

/**
 * Cylinders
 */
const cylinderGroup = new THREE.Group();
scene.add(cylinderGroup);

const numberOfRows = 10;
const numberOfCylinders = 20;
const maxHeight = 10;
const cylinderRadius = 0.15;
const gapSize = 0.06;
const totalWidth = numberOfCylinders * cylinderRadius * 2 + (numberOfCylinders - 1) * gapSize;

// Create metallic material
const metallicMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  metalness: 0.9,
  roughness: 0.1
});

for (let j = 0; j < numberOfRows; j+=0.5) {
// Create cylinders
  for (let i = 0; i < numberOfCylinders; i++) {
    // Calculate height based on distance from center
    // Middle ones are longest, first and last are shortest
    const distanceFromCenter = Math.abs(i - (numberOfCylinders - 1) / 2);
    const maxDistance = (numberOfCylinders - 1) / 2;
    const heightFactor = distanceFromCenter / maxDistance;
    const cylinderHeight = maxHeight * heightFactor;
    
    // Create cylinder geometry
    const cylinderGeometry = new THREE.CylinderGeometry(
      cylinderRadius,
      cylinderRadius,
      cylinderHeight,
      32
    );
    
    const cylinder = new THREE.Mesh(cylinderGeometry, metallicMaterial);
    
    // Position cylinders in a line
    const xPosition = (i * (cylinderRadius * 2 + gapSize)) - totalWidth / 2 + cylinderRadius;
    cylinder.position.x = xPosition;
    // Align tops at same Y position by offsetting based on height
    cylinder.position.y = (maxHeight - cylinderHeight) / 2;
    cylinder.position.z = j;
    
    cylinderGroup.add(cylinder);
    
    // Create disc below cylinder
    const discGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 0.1, 32);
    
    // Create water-like material with blue hues
    const blueHue = 0.5 + (i / numberOfCylinders) * 0.1; // Vary between 0.5 and 0.6
    const blueColor = new THREE.Color().setHSL(blueHue, 0.7, 0.5);
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: blueColor,
      metalness: 0.7,
      roughness: 0.2,
      emissive: new THREE.Color().setHSL(blueHue, 0.5, 0.2),
      emissiveIntensity: 0.5
    });
    
    const disc = new THREE.Mesh(discGeometry, waterMaterial);
    
    // Position disc 1 unit above cylinder top
    const cylinderTopY = cylinder.position.y + cylinderHeight / 2;
    disc.position.x = xPosition;
    disc.position.y = cylinderTopY + 0.2;
    disc.position.z = j;
    
    // Mark this as a water disc for animation
    disc.userData.isWaterDisc = true;
    
    cylinderGroup.add(disc);
    
    // Create fire disc at the bottom of cylinder
    const fireDiscGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 0.1, 32);
    
    // Create fire-like material with dark red/maroon to orange hues
    const fireColor = new THREE.Color(0x8b0000); // Dark red/maroon
    const fireEmissive = new THREE.Color(0x660000); // Very dark red
    
    const fireMaterial = new THREE.MeshStandardMaterial({
      color: fireColor,
      metalness: 0.2,
      roughness: 0.4,
      emissive: fireEmissive,
      emissiveIntensity: 0.8,
      toneMapped: true
    });
    
    const fireDisc = new THREE.Mesh(fireDiscGeometry, fireMaterial);
    
    // Position fire disc 1 unit below cylinder base
    const cylinderBaseY = cylinder.position.y - cylinderHeight / 2;
    fireDisc.position.x = xPosition;
    fireDisc.position.y = cylinderBaseY - 0.2;
    fireDisc.position.z = j;
    
    // Store fire disc reference for animation
    fireDisc.userData.fireIndex = i;
    
    cylinderGroup.add(fireDisc);
  }
}

// Loading Katanas

const loader = new GLTFLoader(); 
loader.load( '/assets/katana.glb', function ( gltf ) 
{ 
  gltf.scene.position.x = 0;  // where in X-axis
  gltf.scene.position.y = 2;  // where in Y-axis
  gltf.scene.position.z = 10; // where Z-axis
  gltf.scene.rotation.z = Math.PI/3; // Rotation 

  
  // Fix materials that might have shader issues
  gltf.scene.traverse((child) => {
    if (child.material) {
      child.material.needsUpdate = true;
    }
  });
  
  scene.add( gltf.scene ); 
}, 
undefined, function ( error ) 
{ console.error( error ); } );


const pointLight = new THREE.PointLight( 0x34fE7, 80, 60 );
pointLight.position.set( 6, 6, 6 );
scene.add( pointLight );
const gui = new GUI({ title: "Controls", width: 300 }); 
const ctrlFolder = gui.addFolder("Rotation"); 
ctrlFolder.add(pointLight.position, "x").min(-5).max(5).step(0.5).name("pos x"); 
ctrlFolder.add(pointLight.position, "y").min(0).max(1).step(0.5).name("pos y"); 
ctrlFolder.add(pointLight.position, "z").min(-5).max(10).step(0.5).name("pos z"); 

/**
 * Cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial({ color: 0xff0000 })
// );
// scene.add(cube);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  // Animate water flow effect on cylinders
  const waterFlow = (Math.sin(elapsedTime * 2) + 1) / 2; // Oscillates between 0 and 1
  
  // Animate fire effect
  const fireFlicker = Math.sin(elapsedTime * 4) * 0.5 + 0.5 + Math.random() * 0.3;
  
  cylinderGroup.children.forEach((child) => {
    // Apply fire effect only to objects with fireIndex userData
    if (child.userData.fireIndex !== undefined) {
      const fireIntensity = 0.6 + fireFlicker * 0.4;
      child.material.emissiveIntensity = fireIntensity;
      // Vary color between red and orange
      const fireHue = 0.04 + fireFlicker * 0.05; // Red to orange range
      child.material.color.setHSL(fireHue, 0.9, 0.4 + fireFlicker * 0.2);
      // Add slight scale pulsing for flame effect
      child.scale.y = 0.8 + fireFlicker * 0.3;
    }
    // Apply water effect to blue discs
    else if (child.userData.isWaterDisc) {
      const baseHue = 0.55; // Stay in blue hue range
      const saturation = 0.7 * (1 - waterFlow); // Decrease saturation as it gets lighter
      const lightness = 0.3 + waterFlow * 0.5; // Varies from 0.3 (dark blue) to 0.8 (white)
      child.material.color.setHSL(baseHue, saturation, lightness);
      child.material.emissiveIntensity = 0.1 + waterFlow * 0.2;
    }
  });

  // Animate cube
  //cube.rotation.y = Math.sin(elapsedTime / 10);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
});
