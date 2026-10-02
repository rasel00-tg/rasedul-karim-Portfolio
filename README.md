# Rasedul Karim | Personal Portfolio

A breathtaking, futuristic 3D portfolio website showcasing professional skills, projects, and experiences. Built with modern web technologies, it features an immersive "Neo-Brutalism meets Glassmorphism" design aesthetic, seamlessly blending robust technical architecture with striking visual interactions.

## Key Features

- **Immersive 3D Hero Section**: Interactive, slow-rotating 3D abstract sculptures and floating elements that respond to cursor movement.
- **Micro-Animations & Smooth Scrolling**: Built to provide a flawless, dynamic user experience with interactive elements and scroll-based triggers.
- **Modern UI/UX**: Deep dark gradient themes with sleek glassmorphism panels and neo-brutalist highlights.
- **Fully Responsive Layout**: Perfectly tailored interfaces that scale dynamically across desktops, tablets, and mobile devices.
- **Component-Driven Architecture**: Clean, modular, and highly reusable codebase ensuring easy maintainability.

## Technology Stack

- **Core:** React.js
- **Build Tool:** Vite
- **3D Graphics:** React Three Fiber, Three.js
- **Animations:** Framer Motion
- **Styling:** Vanilla CSS (Component-scoped logic, CSS Variables)
- **Icons:** Lucide React

## Quick Start

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate into the directory:**
   ```bash
   cd portfolio
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Preview the Application:**
   Open your browser and navigate to `http://localhost:5173`.

## Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── HeroSection.jsx  # Includes 3D Canvas and Hero Elements
│   ├── AboutSection.jsx # Skills with 3D Tilt Cards
│   ├── ProjectsSection.jsx # Portfolio showcases with scale effects
│   ├── ContactSection.jsx # Pulsing interactive call-to-action
│   └── Navbar.jsx       # Fixed Glassmorphism navigation
├── index.css            # Global aesthetics, variables, and fonts
├── App.jsx              # Main application structural root
└── main.jsx             # Vite application entry point
```

## Build for Production

To create an optimized production build, run:

```bash
npm run build
```

This will generate a `dist` folder containing minified and optimized static assets ready to be deployed to platforms like Vercel, Netlify, or standard web servers.
