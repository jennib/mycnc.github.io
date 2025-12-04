import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Tool, MachineSettings, STLParams } from "@mycnc/shared";
import { ToolSelector, Input, Checkbox } from './SharedControls';
import { Slider } from './Slider';

interface STLGeneratorProps {
    params: STLParams;
    onParamsChange: (field: string, value: any) => void;
    toolLibrary: Tool[];
    unit: 'mm' | 'in';
    settings: MachineSettings;
    onGenerateHeightMap: (imageDataUrl: string) => void; // Callback to pass generated height map back to parent or worker
}


const STLGenerator: React.FC<STLGeneratorProps> = ({ params, onParamsChange, toolLibrary, unit, settings, onGenerateHeightMap }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);

    const [modelStats, setModelStats] = useState<{ width: number, length: number, height: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Three.js scene for Height Map generation (Off-screen mostly, but we show preview)
    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = width; // Square preview

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Background is lowest point (black)

        // Orthographic camera looking down -Z
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1000);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, antialias: true });
        renderer.setSize(width, height);
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        return () => {
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onParamsChange('file', file);
            onParamsChange('fileName', file.name);
            loadSTL(file);
        }
    };

    const loadSTL = (file: File) => {
        setIsProcessing(true);
        // Use setTimeout to allow UI to update to "Processing" state
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const buffer = event.target?.result as ArrayBuffer;
                    if (buffer) {
                        const loader = new STLLoader();
                        const geometry = loader.parse(buffer);
                        geometry.computeBoundingBox();

                        // Center geometry
                        geometry.center();

                        // Get initial dimensions
                        const bbox = geometry.boundingBox!;
                        const size = new THREE.Vector3();
                        bbox.getSize(size);

                        setModelStats({
                            width: size.x,
                            length: size.y,
                            height: size.z
                        });

                        // Update params if not set or if we want to auto-set
                        onParamsChange('width', size.x.toFixed(3));
                        onParamsChange('length', size.y.toFixed(3));
                        onParamsChange('depth', size.z.toFixed(3));

                        // Create mesh with Depth Material
                        const material = new THREE.MeshDepthMaterial({
                            depthPacking: THREE.BasicDepthPacking
                        });

                        if (meshRef.current) {
                            sceneRef.current?.remove(meshRef.current);
                        }

                        const mesh = new THREE.Mesh(geometry, material);
                        meshRef.current = mesh;
                        sceneRef.current?.add(mesh);

                        updatePreview();
                    }
                } catch (error) {
                    console.error("Error parsing STL:", error);
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.onerror = () => {
                console.error("Error reading file");
                setIsProcessing(false);
            };
            reader.readAsArrayBuffer(file);
        }, 100);
    };

    const updatePreview = () => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !meshRef.current) return;

        const mesh = meshRef.current;

        // Apply rotations
        mesh.rotation.x = THREE.MathUtils.degToRad(params.rotationX || 0);
        mesh.rotation.y = THREE.MathUtils.degToRad(params.rotationY || 0);
        mesh.rotation.z = THREE.MathUtils.degToRad(params.rotationZ || 0);

        // Update bounding box after rotation to fit camera
        mesh.updateMatrixWorld();
        const bbox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Position camera to fit the model
        // We want the camera to capture exactly the model bounds + margin
        const margin = params.margin || 0;
        const camWidth = size.x + margin * 2;
        const camHeight = size.y + margin * 2;

        const camera = cameraRef.current;
        camera.left = -camWidth / 2;
        camera.right = camWidth / 2;
        camera.top = camHeight / 2;
        camera.bottom = -camHeight / 2;

        // Update renderer size to match aspect ratio
        const aspect = camWidth / camHeight;
        const renderWidth = containerRef.current.clientWidth;
        const renderHeight = renderWidth / aspect;

        rendererRef.current.setSize(renderWidth, renderHeight);

        // Let's use a custom material for reliable "Height Map" generation
        const heightMapMaterial = new THREE.ShaderMaterial({
            uniforms: {
                minZ: { value: bbox.min.z },
                rangeZ: { value: size.z }
            },
            vertexShader: `
                varying float vZ;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vZ = worldPosition.z;
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform float minZ;
                uniform float rangeZ;
                varying float vZ;
                void main() {
                    float normalized = (vZ - minZ) / rangeZ;
                    gl_FragColor = vec4(normalized, normalized, normalized, 1.0);
                }
            `
        });

        mesh.material = heightMapMaterial;

        // Position camera
        camera.position.set(center.x, center.y, bbox.max.z + 10); // Above the model
        camera.lookAt(center.x, center.y, center.z);
        camera.near = 0.1;
        camera.far = size.z + 20;
        camera.updateProjectionMatrix();

        rendererRef.current.render(sceneRef.current, camera);

        // Extract data URL
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        onGenerateHeightMap(dataUrl);
    };

    // Update when params change
    useEffect(() => {
        updatePreview();
    }, [params.rotationX, params.rotationY, params.rotationZ, params.margin]);

    return (
        <div className="space-y-4">
            {/* Experimental Warning */}
            <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded p-3 text-sm text-accent-yellow flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                    <strong>Experimental Feature:</strong> This generator is currently in beta. Please verify the generated G-code carefully before running.
                </div>
            </div>

            {/* File Input */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.stl.sourceFile')}</h3>
                <input
                    type="file"
                    accept=".stl"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-focus"
                />
                {modelStats && (
                    <div className="mt-2 text-xs text-text-secondary">
                        Original Size: {modelStats.width.toFixed(2)} x {modelStats.length.toFixed(2)} x {modelStats.height.toFixed(2)} {unit}
                    </div>
                )}
                {isProcessing && (
                    <div className="mt-2 text-sm text-accent-yellow animate-pulse">
                        Processing STL file...
                    </div>
                )}
            </div>

            {/* Orientation */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.stl.orientation')}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <Input label="Rot X" value={params.rotationX} onChange={(e) => onParamsChange('rotationX', parseFloat(e.target.value))} unit="deg" type="number" />
                    <Input label="Rot Y" value={params.rotationY} onChange={(e) => onParamsChange('rotationY', parseFloat(e.target.value))} unit="deg" type="number" />
                    <Input label="Rot Z" value={params.rotationZ} onChange={(e) => onParamsChange('rotationZ', parseFloat(e.target.value))} unit="deg" type="number" />
                </div>
            </div>

            {/* Dimensions & Settings */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.dimensions')}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label={t('generators.relief.width')} value={params.width} onChange={(e) => onParamsChange('width', e.target.value)} unit={unit} />
                    <Input label={t('generators.relief.length')} value={params.length} onChange={(e) => onParamsChange('length', e.target.value)} unit={unit} />
                    <Input label={t('generators.relief.maxDepth')} value={params.depth} onChange={(e) => onParamsChange('depth', e.target.value)} unit={unit} />
                    <Input label={t('generators.common.safeZ')} value={params.zSafe} onChange={(e) => onParamsChange('zSafe', e.target.value)} unit={unit} />
                    <Input label="Margin" value={params.margin} onChange={(e) => onParamsChange('margin', parseFloat(e.target.value))} unit={unit} />
                </div>
            </div>

            {/* Preview Area */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.preview')} (Height Map)</h3>
                <div ref={containerRef} className="w-full bg-black rounded border border-secondary/50 overflow-hidden" />
            </div>

            {/* Tooling (Reuse Relief Params UI logic essentially, but simplified) */}
            <div className="border-b border-secondary pb-4">
                <h3 className="font-bold text-lg mb-2 text-text-primary">{t('generators.relief.finishingPass')}</h3>
                <ToolSelector
                    selectedId={params.toolId}
                    onChange={(id) => onParamsChange('toolId', id)}
                    unit={unit}
                    toolLibrary={toolLibrary}
                    label={t('generators.relief.finishingTool')}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input label={t('generators.relief.stepover')} value={params.stepover} onChange={(e) => onParamsChange('stepover', e.target.value)} unit="%" />
                    <Input label={t('generators.common.feedRate')} value={params.feedRate} onChange={(e) => onParamsChange('feedRate', e.target.value)} unit={`${unit}/min`} />
                    <Input label={t('generators.common.spindleSpeed')} value={params.spindleSpeed} onChange={(e) => onParamsChange('spindleSpeed', e.target.value)} unit="RPM" />
                </div>
            </div>

            {/* Roughing */}
            <div className="border-b border-secondary pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">{t('generators.relief.roughingPass')}</h3>
                    <Checkbox label={t('generators.relief.enable')} checked={params.roughingEnabled} onChange={(v) => onParamsChange('roughingEnabled', v)} />
                </div>
                {params.roughingEnabled && (
                    <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                        <ToolSelector
                            selectedId={params.roughingToolId}
                            onChange={(id) => onParamsChange('roughingToolId', id)}
                            unit={unit}
                            toolLibrary={toolLibrary}
                            label={t('generators.relief.roughingTool')}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t('generators.relief.stepdown')} value={params.roughingStepdown} onChange={(e) => onParamsChange('roughingStepdown', e.target.value)} unit={unit} />
                            <Input label={t('generators.relief.stepover')} value={params.roughingStepover} onChange={(e) => onParamsChange('roughingStepover', e.target.value)} unit="%" />
                            <Input label={t('generators.relief.stockToLeave')} value={params.roughingStockToLeave} onChange={(e) => onParamsChange('roughingStockToLeave', e.target.value)} unit={unit} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t('generators.common.feedRate')} value={params.roughingFeed} onChange={(e) => onParamsChange('roughingFeed', e.target.value)} unit={`${unit}/min`} />
                            <Input label={t('generators.common.spindleSpeed')} value={params.roughingSpindle} onChange={(e) => onParamsChange('roughingSpindle', e.target.value)} unit="RPM" />
                        </div>
                    </div>
                )}
            </div>

            {/* Contour Cutout */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">Contour Cutout</h3>
                    <Checkbox label={t('generators.relief.enable')} checked={params.cutoutEnabled} onChange={(v) => onParamsChange('cutoutEnabled', v)} />
                </div>
                {params.cutoutEnabled && (
                    <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                        <ToolSelector
                            selectedId={params.cutoutToolId}
                            onChange={(id) => onParamsChange('cutoutToolId', id)}
                            unit={unit}
                            toolLibrary={toolLibrary}
                            label="Cutout Tool"
                        />
                        <Input label="Cutout Depth" value={params.cutoutDepth} onChange={(e) => onParamsChange('cutoutDepth', e.target.value)} unit={unit} />
                        <Input label={t('generators.stl.depthPerPass') || "Depth per Pass"} value={params.cutoutDepthPerPass} onChange={(e) => onParamsChange('cutoutDepthPerPass', e.target.value)} unit={unit} />

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold text-text-secondary">Tabs</span>
                            <Checkbox label="Enable Tabs" checked={params.cutoutTabsEnabled} onChange={(v) => onParamsChange('cutoutTabsEnabled', v)} />
                        </div>

                        {params.cutoutTabsEnabled && (
                            <div className="grid grid-cols-3 gap-4">
                                <Input label="Count" value={params.cutoutTabCount} onChange={(e) => onParamsChange('cutoutTabCount', e.target.value)} unit="" type="number" />
                                <Input label="Width" value={params.cutoutTabWidth} onChange={(e) => onParamsChange('cutoutTabWidth', e.target.value)} unit={unit} />
                                <Input label="Height" value={params.cutoutTabHeight} onChange={(e) => onParamsChange('cutoutTabHeight', e.target.value)} unit={unit} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default STLGenerator;
