import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three'
import { ArcballControls } from 'three/addons/controls/ArcballControls.js'

const container = document.getElementById('container') as HTMLDivElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement

const rect = container.getBoundingClientRect()
const { width, height } = rect
console.log(rect)

const scene = new Scene()
scene.background = new Color('#9ba9be')

const renderer = new WebGLRenderer({ canvas, antialias: true })
renderer.setSize(width, height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const camera = new PerspectiveCamera(45, width / height, 1, 1000)
scene.add(camera)

camera.position.set(40, 40, 40)

const controls = new ArcballControls(camera, canvas, scene)
controls.setGizmosVisible(false)

const ambient = new AmbientLight(0xffffff, Math.PI * 1.2)
scene.add(ambient)

const directional = new DirectionalLight(0xffffff, Math.PI * 0.3)
directional.position.copy(camera.position)

const metal = new MeshPhysicalMaterial({
  color: 0xcccccc,
  metalness: 0.3,
  roughness: 0.65,
  sheen: 0.1,
  ior: 1.5,
  side: DoubleSide
})

const transparent = new MeshStandardMaterial({
  color: 0xff6d10,
  transparent: true,
  opacity: 0.5,
  side: DoubleSide,
  colorWrite: false
})

const transparentReal = transparent.clone()
transparentReal.colorWrite = true

const bigBox = new BoxGeometry(20, 20, 20)
const smallBox = new BoxGeometry(4, 4, 4)

const bigMesh = new Mesh(bigBox, metal)
scene.add(bigMesh)

for (let i = 0; i < 4; i++) {
  const smallMesh = new Mesh(smallBox, transparent)
  smallMesh.position.set(0, 0, 10 + 4 * (i + 0.5))
  scene.add(smallMesh)

  const smallMeshReal = new Mesh(smallBox, transparentReal)
  smallMeshReal.renderOrder = 1
  smallMeshReal.position.set(0, 0, 10 + 4 * (i + 0.5))
  scene.add(smallMeshReal)
}

function render() {
  renderer.render(scene, camera)
}

render()

controls.addEventListener('change', render)
