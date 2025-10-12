# W3D SDK v2.0

<div align="center">

**Next-Generation WebGL 3D Rendering Engine**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)
[![Three.js](https://img.shields.io/badge/three.js-0.180.0-orange.svg)](https://threejs.org)

English | [简体中文](./README.md)

</div>

## 📖 Introduction

W3D SDK is a next-generation WebGL 3D rendering engine based on Three.js, providing a simple and easy-to-use API and powerful features to help developers quickly build high-performance 3D web applications.

### ✨ Key Features

- 🚀 **Easy to Use** - Chainable API, quick to get started, create your first 3D scene in 5 minutes
- 🎨 **Component Architecture** - Flexible component system, easy to extend and reuse
- 🎯 **Event-Driven** - Comprehensive event system supporting rich interactions
- 📦 **Resource Management** - Smart resource loading and caching for optimized performance
- 🎬 **Animation System** - Built-in animation manager and tween animations for complex effects
- ⚡ **High Performance** - Optimized rendering pipeline, smooth 60fps experience
- 🔧 **Developer Friendly** - Complete documentation and rich examples
- 📱 **Responsive Design** - Automatically adapts to different screen sizes

### 🎯 Use Cases

- Product showcase and 3D visualization
- Digital twins and smart cities
- Online 3D editors
- Games and interactive experiences
- Architecture and interior design visualization
- Education and training applications

## 📦 Project Structure

```
sdk/
├── packages/                 # Packages directory
│   ├── core/                # Core rendering engine
│   │   ├── src/
│   │   │   ├── core/       # Core modules (Scene, Renderer, Camera, etc.)
│   │   │   ├── component/  # Component system
│   │   │   ├── event/      # Event system
│   │   │   ├── resource/   # Resource management
│   │   │   ├── animation/  # Animation system
│   │   │   └── config/     # Configuration
│   │   └── package.json
│   ├── utils/              # Utility library
│   ├── components/         # Component library (planned)
│   └── examples/           # Example projects
├── document/               # Documentation
│   └── zh/                # Chinese documentation
├── docs/                   # Development docs
├── scripts/                # Build scripts
├── package.json           # Root config
└── README.md              # Project readme
```

## 🚀 Quick Start

### Requirements

- **Node.js**: >= 16.0.0
- **pnpm**: >= 8.0.0 (recommended) or npm/yarn

### Installation

#### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

#### 2. Use in Your Project

```bash
# Install SDK
pnpm add @w3d/core three

# Or
npm install @w3d/core three
```

### Basic Example

Create a simple 3D scene:

```javascript
import { Scene } from '@w3d/core';

// Create scene
const scene = new Scene('#app', {
    renderer: {
        antialias: true,
        alpha: false
    },
    camera: {
        position: [0, 100, 200],
        fov: 45
    }
});

// Add lights
scene.light.addAmbient({
    color: '#ffffff',
    intensity: 0.8
});

scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100],
    castShadow: true
});

// Initialize scene
scene.init();
```

### Load 3D Model

```javascript
import { Scene, ModelLoader } from '@w3d/core';

const scene = new Scene('#app');

// Register model loader component
scene.registerComponent('ModelLoader', ModelLoader);

// Initialize scene
scene.init();

// Load model
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0]
});

// Listen to click event
model.on('click', (event) => {
    console.log('Model clicked', event.object);
});
```

### Add Animation

```javascript
import { Tween } from '@w3d/core';

// Create tween animation
Tween.to(
    model.position,
    { y: 10 },
    2000,
    {
        easing: 'easeInOutQuad',
        onComplete: () => {
            console.log('Animation complete');
        }
    }
);
```

## 🛠️ Development

### Development Mode

```bash
# Start all packages in dev mode
pnpm dev

# Start specific package
pnpm dev:core        # Core package
pnpm dev:utils       # Utils package
pnpm dev:examples    # Examples
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core      # Core package
pnpm build:utils     # Utils package
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Test UI
pnpm test:ui
```

### Code Quality

```bash
# Lint
pnpm lint

# Auto fix
pnpm lint:fix

# Format
pnpm format

# Check format
pnpm format:check
```

## 📚 Tech Stack

### Core Dependencies

- **Three.js** (^0.180.0) - 3D graphics library
- **Vite** (^5.1.4) - Build tool
- **pnpm** (>=8.0.0) - Package manager

### Development Tools

- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Lerna** - Monorepo management
- **Changesets** - Version management and publishing

### Architecture

- **Monorepo Architecture** - Using pnpm workspace
- **ES Module** - Modern JavaScript module system
- **Component-Based Design** - Extensible component architecture
- **Event-Driven** - Comprehensive event system

## 📖 Documentation

### Chinese Documentation

- [SDK User Guide](./document/zh/sdk-guide.md) - Detailed usage and examples
- [API Reference](./document/zh/api-reference.md) - Complete API documentation
- [Component Development Guide](./document/zh/component-guide.md) - How to develop custom components
- [Quick Reference](./document/zh/quick-reference.md) - Quick API lookup
- [FAQ](./document/zh/faq.md) - Frequently asked questions

### Development Documentation

- [Architecture](./docs/architecture.md) - System architecture
- [API Design](./docs/api-design.md) - API design documentation
- [Component System](./docs/component-system.md) - Component system design
- [Event System](./docs/event-system.md) - Event system design
- [Build Configuration](./docs/build-config.md) - Build configuration

## 🎯 Core Features

### Scene Management

- Scene creation and initialization
- Render loop control
- Component lifecycle management
- Resource management

### Component System

- Component base class and lifecycle
- Component registration and management
- Event system integration
- Configuration management

### Event System

- Mouse events (click, move, enter, leave, etc.)
- Touch event support
- Raycasting
- Custom events

### Resource Management

- Resource loading and caching
- Loading progress tracking
- Resource disposal
- Error handling

### Animation System

- GLTF model animation support
- Tween animations
- Animation mixer
- Animation control

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the project's code style
- Write clear commit messages
- Add necessary tests
- Update relevant documentation

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

## 👥 Team

W3D Team

## 🔗 Links

- [Three.js Official Site](https://threejs.org/)
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Specification](https://www.khronos.org/webgl/)

## 📮 Contact Us

For questions or suggestions:

- Submit an [Issue](https://github.com/yourusername/w3d-sdk/issues)
- Email: 674656681@qq.com

## 🙏 Acknowledgments

Thanks to all developers who contributed to this project!

---

<div align="center">

**[⬆ Back to Top](#w3d-sdk-v20)**

Made with ❤️ by W3D Team

</div>

