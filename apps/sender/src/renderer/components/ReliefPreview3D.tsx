import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface ReliefPreview3DProps {
    imageDataUrl: string;
    width: number;
    height: number;
    maxDepth: number;
    gamma: number;
    contrast: number;
    invert: boolean;
    spectrumGainEnabled: boolean;
    spectrumGainHigh: number;
    spectrumGainLow: number;
}

const ReliefPreview3D: React.FC<ReliefPreview3DProps> = ({
    imageDataUrl,
    width,
    height,
    maxDepth,
    gamma,
    contrast,
    invert,
    smoothing,
    spectrumGainEnabled,
    spectrumGainHigh,
    spectrumGainLow
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Gaussian Blur Helper
    const applyGaussianBlur = (pixels: Uint8ClampedArray, width: number, height: number, radius: number) => {
        if (radius < 1) return pixels;
        const size = width * height;
        const target = new Uint8ClampedArray(pixels.length);
        const sigma = radius;
        const kSize = Math.ceil(sigma * 3) * 2 + 1;
        const kernel = new Float32Array(kSize);
        const half = Math.floor(kSize / 2);
        let sum = 0;
        for (let i = 0; i < kSize; i++) {
            const x = i - half;
            const val = Math.exp(-(x * x) / (2 * sigma * sigma));
            kernel[i] = val;
            sum += val;
        }
        for (let i = 0; i < kSize; i++) kernel[i] /= sum;

        const temp = new Float32Array(pixels.length);
        // Horizontal
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let k = 0; k < kSize; k++) {
                    const offset = k - half;
                    const px = Math.min(width - 1, Math.max(0, x + offset));
                    const idx = (y * width + px) * 4;
                    const weight = kernel[k];
                    r += pixels[idx] * weight;
                    g += pixels[idx + 1] * weight;
                    b += pixels[idx + 2] * weight;
                }
                const idx = (y * width + x) * 4;
                temp[idx] = r;
                temp[idx + 1] = g;
                temp[idx + 2] = b;
                temp[idx + 3] = pixels[idx + 3];
            }
        }
        // Vertical
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let r = 0, g = 0, b = 0;
                for (let k = 0; k < kSize; k++) {
                    const offset = k - half;
                    const py = Math.min(height - 1, Math.max(0, y + offset));
                    const idx = (py * width + x) * 4;
                    const weight = kernel[k];
                    r += temp[idx] * weight;
                    g += temp[idx + 1] * weight;
                    b += temp[idx + 2] * weight;
                }
                const idx = (y * width + x) * 4;
                target[idx] = r;
                target[idx + 1] = g;
                target[idx + 2] = b;
                target[idx + 3] = temp[idx + 3];
            }
        }
        return target;
    };

    // Generate height map from image
    const generateHeightMap = useMemo(() => {
        return (img: HTMLImageElement, resolution: number): Float32Array => {
            const canvas = document.createElement('canvas');
            canvas.width = resolution;
            canvas.height = resolution;
            const ctx = canvas.getContext('2d');
            if (!ctx) return new Float32Array(resolution * resolution);

            ctx.drawImage(img, 0, 0, resolution, resolution);
            const imageData = ctx.getImageData(0, 0, resolution, resolution);
            let pixels = imageData.data;

            if (smoothing > 0) {
                pixels = applyGaussianBlur(pixels, resolution, resolution, smoothing);
            }

            const heights = new Float32Array(resolution * resolution);

            for (let i = 0; i < resolution * resolution; i++) {
                const idx = i * 4;
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];
                let brightness = (r + g + b) / (3 * 255);



                // Contrast
                brightness = (brightness - 0.5) * contrast + 0.5;
                brightness = Math.max(0, Math.min(1, brightness));

                // Gamma
                brightness = Math.pow(brightness, 1 / gamma);

                // Invert logic
                // If invert is TRUE: Dark(0) -> High(0), Light(1) -> Low(MaxDepth)
                //   z = brightness * MaxDepth (MaxDepth is negative)
                // If invert is FALSE: Light(1) -> High(0), Dark(0) -> Low(MaxDepth)
                //   z = (1 - brightness) * MaxDepth
                heights[i] = invert ? (brightness * Math.abs(maxDepth) * -1) : ((1 - brightness) * Math.abs(maxDepth) * -1);
            }

            return heights;
        };
    }, [gamma, contrast, maxDepth, invert, smoothing]);

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            50,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        const maxDim = Math.max(width, height);
        camera.position.set(maxDim * 0.8, maxDim * 0.8, maxDim * 0.8);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 2, 1);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffdca5, 0.5); // Warm light
        directionalLight2.position.set(-1, 0.5, -1);
        scene.add(directionalLight2);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            renderer.dispose();
            controls.dispose();
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [width, height]);

    // Update mesh when image or parameters change
    useEffect(() => {
        if (!imageDataUrl || !sceneRef.current) return;

        const img = new Image();
        img.onload = () => {
            const resolution = 256; // Increased resolution for better preview
            const heightMap = generateHeightMap(img, resolution);

            // Create or update geometry
            const geometry = new THREE.PlaneGeometry(width, height, resolution - 1, resolution - 1);
            const positions = geometry.attributes.position;

            for (let i = 0; i < resolution; i++) {
                for (let j = 0; j < resolution; j++) {
                    const idx = i * resolution + j;
                    const vertexIdx = idx * 3 + 2; // Z component
                    positions.array[vertexIdx] = heightMap[idx];
                }
            }

            positions.needsUpdate = true;
            geometry.computeVertexNormals();

            // Create or update mesh
            if (meshRef.current && sceneRef.current) {
                sceneRef.current.remove(meshRef.current);
                meshRef.current.geometry.dispose();
                if (Array.isArray(meshRef.current.material)) {
                    meshRef.current.material.forEach((m: THREE.Material) => m.dispose());
                } else {
                    meshRef.current.material.dispose();
                }
            }

            // Wood-like material
            const material = new THREE.MeshStandardMaterial({
                color: 0xd2a679, // Wood color
                flatShading: false,
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.8,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            if (sceneRef.current) {
                sceneRef.current.add(mesh);
                meshRef.current = mesh;
            }
        };
        img.src = imageDataUrl;
    }, [imageDataUrl, width, height, gamma, contrast, maxDepth, invert, smoothing, generateHeightMap]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] rounded-md border border-secondary bg-black/20"
        />
    );
};

export default ReliefPreview3D;
