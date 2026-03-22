# DormDraft 🛏️
**See it before you move in.**

DormDraft is an interactive 3D dorm room visualizer where students can explore their exact room type, arrange furniture to scale, and plan their setup — all before stepping foot on campus.

---

## Prerequisites

Make sure you have **Node.js** installed before running the project.

1. Download and install Node.js from [https://nodejs.org](https://nodejs.org) (LTS version recommended)
2. Verify installation:
```bash
node -v
npm -v
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Rehal05/HackathonDormDesigner.git
cd HackathonDormDesigner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

Then open your browser and go to:
```
http://localhost:5173
```

---

## Troubleshooting

### GLB/3D model files not loading after clone

This project uses **Git LFS** (Large File Storage) for 3D model files (`.glb`). If models appear as broken or missing, run:

```bash
# Install Git LFS (macOS)
brew install git-lfs

# Initialize Git LFS
git lfs install

# Pull the large files
git lfs pull
```

For other operating systems, download Git LFS from [https://git-lfs.com](https://git-lfs.com).

---

## Tech Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) — build tool & dev server
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [@react-three/drei](https://github.com/pmndrs/drei) — useful helpers for R3F
- [Three.js](https://threejs.org) — 3D rendering

---

## Project Structure

```
src/
├── app/
│   ├── assets/          # Room and building images
│   ├── components/      # UI + 3D viewer components
│   │   └── viewer/      # Three.js room scene, furniture, controls
│   ├── context/         # Furniture state management
│   ├── data/            # Room configs (JSON) and furniture catalog
│   ├── pages/           # Landing page and visualizer
│   └── types/           # TypeScript interfaces
├── haolin_components/   # 3D GLB models for default room furniture
└── furnitureLibrary/    # 3D GLB models for the furniture palette
```
