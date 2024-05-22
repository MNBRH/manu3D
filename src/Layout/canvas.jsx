import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import SwatchWrapper from './swatchWrapper';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMesh: {},
      currentScene: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeData } = this.props;
    if (prevProps.activeData !== activeData) {
      this.applyMaterial(activeData);
    }
  }

  componentDidMount() {
    this.InitialSetup();
  }

  addLights = () => {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Lumière directionnelle pour simuler la lumière du soleil
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  };

  InitialSetup = () => {
    const { handleLoading } = this.props;
    this.container = document.getElementById('container');
    const item = document.getElementById('container').getBoundingClientRect();

    this.sizes = {
      width: item.width,
      height: item.height,
    };

    this.canvas = document.querySelector('canvas.webgl');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      10,
      5000
    );
    this.camera.position.set(150, 20, 100);
    this.scene.add(this.camera);

    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const ProgressVal = (itemsLoaded / itemsTotal) * 100;
      if (ProgressVal === 100) {
        handleLoading();
      }
    };

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.maxPolarAngle = Math.PI / 1.9;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;

    this.loadHDR();
    this.addLights();
    this.addModel();
    window.addEventListener('resize', this.resize);

    const render = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(render);
    };
    render();
  };

  resize = () => {
    this.sizes.width = this.container.offsetWidth;
    this.sizes.height = this.container.offsetHeight;
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
  };

  loadHDR = () => {
    new RGBELoader(this.manager)
      .setDataType(THREE.HalfFloatType)
      .load('default.hdr', (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.needsUpdate = true;
        this.scene.environment = texture;
        texture.dispose();
      });
  };

  addModel = () => {
    const THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`;
    const DRACO_LOADER = new DRACOLoader(this.manager).setDecoderPath(
      `${THREE_PATH}/examples/js/libs/draco/gltf/`
    );

    const drone = 'Blender.glb';
    const GLtfLoader = new GLTFLoader(this.manager).setDRACOLoader(
      DRACO_LOADER
    );
    GLtfLoader.load(drone, (gltf) => {
      this.droneMesh = gltf.scene;
      this.droneMesh.scale.set(90, 90, 90);
      this.droneMesh.position.set(0, -30, 0);
      this.droneMesh.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.needsUpdate = true;
        }
      });
      this.scene.add(this.droneMesh);

      // Ajoutez une légère oscillation latérale (vibrations)
      gsap.to(this.droneMesh.position, {
        duration: 1,
        repeat: -1,
        yoyo: true,
        x: 5, // Ajustez la portée des vibrations
        ease: 'power1.inOut',
      });
    });
  };

  applyMaterial = (data) => {
    this.scene.traverse((element) => {
      if (element.isMesh) {
        Object.entries(data.itemList).forEach((mesh) => {
          if (mesh[0] === element.name) {
            var value = new THREE.Color(mesh[1].color).convertSRGBToLinear();

            gsap.to(element.material.color, {
              r: value.r,
              g: value.g,
              b: value.b,
              ease: 'power3.inOut',
              duration: 0.8,
            });
            element.material.needsUpdate = true;
          }
        });
      }
    });

    gsap.to('.highlight', {
      backgroundColor: data.buttonColor.background,
      ease: 'power3.inOut',
      duration: 0.8,
    });
  };

  render() {
    const { activeData, swatchData, handleSwatchClick, condition } = this
    .props;
    return (
      <div
        id="container"
        className="w-full h-3/5 relative z-10 lg:w-1/2 lg:h-full "
      >
        <canvas className="webgl w-full h-full relative z-10"></canvas>

        <SwatchWrapper
          activeData={activeData}
          swatchData={swatchData}
          handleSwatchClick={handleSwatchClick}
          condition={condition}
        />
        <div className="highlight w-2/5 h-1/2 bg-[#D7B172] absolute inset-x-40 top-0 -z-10 rounded-br-full rounded-bl-full md:inset-x-60  lg:inset-x-40"></div>
      </div>
    );
  }
}

export default Canvas;
