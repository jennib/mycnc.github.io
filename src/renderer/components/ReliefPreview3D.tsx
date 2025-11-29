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
}

const ReliefPreview3D: React.FC<ReliefPreview3DProps> = ({
    imageDataUrl,
    width,
    height,
    maxDepth,
    gamma,
    contrast
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const animationFrameRef = useRef<number | null>(null);

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
            const heights = new Float32Array(resolution * resolution);

            for (let i = 0; i < resolution * resolution; i++) {
                const idx = i * 4;
                // Calculate brightness (grayscale average)
                const r = imageData.data[idx];
                const g = imageData.data[idx + 1];
                const b = imageData.data[idx + 2];
                let brightness = (r + g + b) / (3 * 255); // Normalize to 0-1

                // Apply contrast
                brightness = (brightness - 0.5) * contrast + 0.5;
                brightness = Math.max(0, Math.min(1, brightness)); // Clamp

                // Apply gamma
                brightness = Math.pow(brightness, 1 / gamma);

                // Scale to depth (invert so darker = deeper)
                heights[i] = brightness * Math.abs(maxDepth);
            }

            return heights;
        };
    }, [gamma, contrast, maxDepth]);

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

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(1, 1, 1);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-1, -0.5, -1);
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
            const resolution = 128; // Balance between quality and performance
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

            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                flatShading: false,
                side: THREE.DoubleSide,
                metalness: 0.3,
                roughness: 0.7
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            sceneRef.current.add(mesh);
            meshRef.current = mesh;
        };
        img.src = imageDataUrl;
    }, [imageDataUrl, width, height, gamma, contrast, maxDepth, generateHeightMap]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] rounded-md border border-secondary bg-black/20"
        />
    );
};

export default ReliefPreview3D;
