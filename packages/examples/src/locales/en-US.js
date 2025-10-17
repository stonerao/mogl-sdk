export default {
    common: {
        home: 'Home',
        back: 'Back',
        language: 'Language',
        chinese: '中文',
        english: 'English'
    },
    home: {
        title: 'W3D SDK Examples',
        subtitle: 'Explore the Power of W3D SDK',
        description:
            'Learn how to build amazing 3D applications with W3D SDK through these interactive examples',
        categories: {
            all: 'All',
            basic: 'Basic',
            advanced: 'Advanced',
            effects: 'Effects',
            geometry: 'Geometry'
        },
        examples: {
            '01-hello-world': {
                title: '01 - Hello World',
                description: 'The simplest W3D scene - Create your first 3D application'
            },
            '02-camera-controls': {
                title: '02 - Camera Controls',
                description: 'Camera controls - Orbit controls and camera animations'
            },
            '03-lighting': {
                title: '03 - Lighting',
                description: 'Lighting system - Ambient, directional, and point lights'
            },
            '04-model-loader': {
                title: '04 - Model Loader',
                description: 'Model loader - Load and display 3D models'
            },
            '05-animations': {
                title: '05 - Animations',
                description: 'Animation system - Model and path animations'
            },
            '06-particle-system': {
                title: '06 - Particle System',
                description: 'Particle system - Create particle effects'
            },
            '07-advanced-model-loader': {
                title: '07 - Advanced Model Loader',
                description: 'Advanced model loading - Multi-model management and interaction'
            },
            '08-model-bake': {
                title: '08 - Model Bake',
                description: 'Model baking - Baked lighting and shadows'
            },
            '09-label-3d': {
                title: '09 - Label 3D',
                description: '3D label component - Canvas text textures and event interaction'
            },
            '10-migration-line': {
                title: '10 - Migration Line',
                description: 'Migration line animation - Shader/Particle/Line2 rendering modes'
            },
            '11-area-block': {
                title: '11 - Area Block',
                description:
                    'Independent area block - Cloud shader effects, wall and bottom rendering'
            },
            '12-image-marker': {
                title: '12 - Image Marker',
                description:
                    'Independent image marker - Sprite/Plane rendering, multi-state, mouse interaction'
            },
            '13-pipeline': {
                title: '13 - Pipeline',
                description: 'Pipeline effect - Path generation, progress control, flow effects'
            },
            '14-bvh-query': {
                title: '14 - BVH Query',
                description:
                    'BVH spatial queries - High-performance raycasting and collision detection'
            },
            '15-extruded-polygon': {
                title: '15 - Extruded Polygon',
                description:
                    'Extruded polygon component - Point-based polygon, vertical extrusion, gradient colors, texture mapping'
            },
            '16-instanced-model': {
                title: '16 - Instanced Model',
                description:
                    'Instanced model component - Large-scale model instantiation and management'
            },
            '17-shader-material': {
                title: '17 - Shader Material',
                description:
                    'Shader material component - Custom shader material management and application'
            }
        }
    },
    controls: {
        config: 'Configuration',
        basic: 'Basic Config',
        advanced: 'Advanced Config',
        effects: 'Effects Config',
        performance: 'Performance Stats',
        eventLog: 'Event Log',
        add: 'Add',
        remove: 'Remove',
        clear: 'Clear',
        clearAll: 'Clear All',
        update: 'Update',
        toggle: 'Toggle',
        show: 'Show',
        hide: 'Hide',
        enable: 'Enable',
        disable: 'Disable',
        play: 'Play',
        pause: 'Pause',
        stop: 'Stop',
        reset: 'Reset',
        animate: 'Animate',
        move: 'Move'
    },
    stats: {
        title: 'Performance Stats',
        fps: 'FPS',
        count: 'Count',
        vertices: 'Vertices',
        triangles: 'Triangles',
        drawCalls: 'Draw Calls'
    },
    params: {
        position: 'Position',
        rotation: 'Rotation',
        scale: 'Scale',
        color: 'Color',
        opacity: 'Opacity',
        size: 'Size',
        width: 'Width',
        height: 'Height',
        radius: 'Radius',
        length: 'Length',
        speed: 'Speed',
        intensity: 'Intensity',
        progress: 'Progress',
        offset: 'Offset',
        segments: 'Segments',
        type: 'Type',
        state: 'State',
        visible: 'Visible',
        enabled: 'Enabled'
    },
    pipeline: {
        title: 'Pipeline Controls',
        config: 'Pipeline Config',
        radius: 'Pipeline Radius',
        color: 'Pipeline Color',
        opacity: 'Opacity',
        segments: 'Segments',
        progress: 'Display Progress',
        addPipeline: 'Add Pipeline',
        clearAll: 'Clear All Pipelines',
        flow: {
            title: 'Flow Effect',
            enabled: 'Enable Flow Effect',
            speed: 'Flow Speed',
            color: 'Flow Color',
            width: 'Flow Width',
            intensity: 'Flow Intensity'
        },
        list: 'Pipeline List',
        animate: 'Animate',
        remove: 'Remove'
    },
    imageMarker: {
        title: 'Image Marker Controls',
        config: 'Marker Config',
        type: 'Render Type',
        size: 'Image Size',
        color: 'Color Overlay',
        opacity: 'Opacity',
        offset: 'Position Offset',
        sizeAttenuation: 'Size Attenuation',
        showLabel: 'Show Text Label',
        labelText: 'Label Text',
        labelOffset: 'Label Offset',
        addMarker: 'Add Marker',
        clearAll: 'Clear All Markers',
        list: 'Marker List',
        state: 'State',
        toggleState: 'Toggle',
        toggleLabel: 'Label',
        move: 'Move',
        remove: 'Remove'
    },
    areaBlock: {
        title: 'Area Block Controls',
        config: 'Area Config',
        color: 'Area Color',
        opacity: 'Opacity',
        height: 'Wall Height',
        showWall: 'Show Wall',
        showBottom: 'Show Bottom',
        showBorder: 'Show Border',
        cloudEffect: 'Cloud Effect',
        cloudSpeed: 'Cloud Speed',
        cloudDensity: 'Cloud Density',
        addArea: 'Add Area',
        clearAll: 'Clear All Areas',
        list: 'Area List',
        remove: 'Remove'
    },
    label3d: {
        title: '3D Label Controls',
        config: 'Label Config',
        text: 'Label Text',
        fontSize: 'Font Size',
        textColor: 'Text Color',
        backgroundColor: 'Background Color',
        borderColor: 'Border Color',
        borderWidth: 'Border Width',
        padding: 'Padding',
        borderRadius: 'Border Radius',
        scale: 'Scale',
        addLabel: 'Add Label',
        clearAll: 'Clear All Labels',
        list: 'Label List',
        show: 'Show',
        hide: 'Hide',
        remove: 'Remove'
    },
    migrationLine: {
        title: 'Migration Line Controls',
        config: 'Line Config',
        type: 'Render Type',
        color: 'Line Color',
        opacity: 'Opacity',
        width: 'Line Width',
        speed: 'Animation Speed',
        particleSize: 'Particle Size',
        particleCount: 'Particle Count',
        addLine: 'Add Line',
        clearAll: 'Clear All Lines',
        list: 'Line List',
        play: 'Play',
        pause: 'Pause',
        remove: 'Remove'
    },
    bvhQuery: {
        title: 'BVH Spatial Query',
        mode: 'Query Mode',
        modes: {
            raycast: 'Raycasting',
            nearest: 'Nearest Point',
            collision: 'Collision Detection',
            voxel: 'Voxelization'
        },
        bvhConfig: 'BVH Configuration',
        strategy: 'Build Strategy',
        maxDepth: 'Max Depth',
        maxLeafTris: 'Max Leaf Triangles',
        showHelper: 'Show BVH Visualization',
        helperDepth: 'Visualization Depth',
        raycastConfig: 'Raycast Configuration',
        firstHitOnly: 'First Hit Only',
        showNormal: 'Show Normal',
        nearestConfig: 'Nearest Point Configuration',
        showLine: 'Show Line',
        showPoint: 'Show Point',
        collisionConfig: 'Collision Detection Configuration',
        collisionType: 'Collision Type',
        sphere: 'Sphere',
        box: 'Box',
        size: 'Size',
        nodeCount: 'Node Count',
        leafNodeCount: 'Leaf Node Count',
        triangleCount: 'Triangle Count',
        lastQueryTime: 'Last Query Time',
        totalQueries: 'Total Queries',
        eventLog: 'Event Log',
        raycastHint: 'Move mouse to raycast, click to record hit position',
        nearestHint: 'Move mouse to find nearest point, blue sphere shows the closest point',
        collisionHint: 'Move mouse to detect collision, green = no collision, red = collision',
        voxelHint: 'Voxelization demonstration'
    },
    extrudedPolygon: {
        title: 'Extruded Polygon',
        controls: 'Extruded Polygon Controls',
        presetShapes: 'Preset Shapes',
        selectShape: 'Select Shape',
        rectangle: 'Rectangle',
        pentagon: 'Pentagon',
        hexagon: 'Hexagon',
        star: 'Star',
        custom: 'Custom',
        extrudeSettings: 'Extrude Settings',
        height: 'Extrude Height',
        colorSettings: 'Color Settings',
        bottomColor: 'Bottom Color',
        topColor: 'Top Color',
        useGradient: 'Enable Gradient',
        textureSettings: 'Texture Settings',
        showTexture: 'Show Texture',
        textureRepeat: 'Texture Repeat',
        materialSettings: 'Material Settings',
        opacity: 'Opacity',
        wireframe: 'Wireframe',
        stats: 'Statistics',
        vertices: 'Vertices',
        faces: 'Faces'
    },
    shaderMaterial: {
        title: 'Shader Material Controls',
        loading: 'Loading model...',
        materialSelection: 'Material Selection',
        currentMaterial: 'Current Material:',
        activeMaterial: 'Active Material:',
        materialParams: 'Material Parameters',
        color1: 'Color 1:',
        color2: 'Color 2:',
        baseColor: 'Base Color:',
        intensity: 'Intensity:',
        materialList: 'Material List',
        shader: 'Shader',
        materialCount: 'Material Count',
        materials: {
            basicColor: 'Basic Color',
            gradient: 'Gradient',
            animated: 'Animated',
            diffusion: 'Diffusion'
        }
    }
};
