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

const bigBox = new BoxGeometry(20, 20, 20)
const smallBox = new BoxGeometry(5, 5, 5)

const mesh1 = new Mesh(bigBox, metal)
const mesh2 = new Mesh(smallBox, transparent)
mesh2.position.set(0, 0, 12.5)
const mesh3 = new Mesh(smallBox, transparent)
mesh3.position.set(0, 0, 17.5)
const mesh4 = new Mesh(smallBox, transparent)
mesh4.position.set(0, 0, 22.5)
const mesh5 = new Mesh(smallBox, transparent)
mesh5.position.set(0, 0, 27.5)

scene.add(mesh1)

scene.add(mesh2)
scene.add(mesh3)
scene.add(mesh4)
scene.add(mesh5)

{
  const second = transparent.clone()

  second.colorWrite = true

  const mesh2 = new Mesh(smallBox, second)
  mesh2.position.set(0, 0, 12.5)
  const mesh3 = new Mesh(smallBox, second)
  mesh3.position.set(0, 0, 17.5)
  const mesh4 = new Mesh(smallBox, second)
  mesh4.position.set(0, 0, 22.5)
  const mesh5 = new Mesh(smallBox, second)
  mesh5.position.set(0, 0, 27.5)

  mesh2.renderOrder = 1
  mesh3.renderOrder = 1
  mesh4.renderOrder = 1
  mesh5.renderOrder = 1

  scene.add(mesh2)
  scene.add(mesh3)
  scene.add(mesh4)
  scene.add(mesh5)
}

function render() {
  renderer.render(scene, camera)
}

render()

controls.addEventListener('change', render)
