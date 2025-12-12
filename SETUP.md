# Local PDF Toolbox - Setup Instructions

## Prerequisites

Before setting up the Local PDF Toolbox, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher) or **yarn**
- **Git** (for cloning the repository)

### Checking Your Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/local-pdf-toolbox.git

# Navigate to the project directory
cd local-pdf-toolbox
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or if you prefer yarn
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Create environment file
touch .env.local
```

Add the following environment variables:

```env
# Application settings
NEXT_PUBLIC_APP_NAME=Local PDF Toolbox
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_MAX_FILE_SIZE=104857600

# Development settings
NODE_ENV=development
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
local-pdf-toolbox/
├── app/                    # Next.js App Router
│   ├── (tools)/           # Tool-specific routes
│   │   ├── merge/         # Merge PDF tool
│   │   ├── split/         # Split PDF tool
│   │   ├── extract/       # Extract pages tool
│   │   ├── convert/       # Convert to image tool
│   │   ├── image-to-pdf/  # Image to PDF tool
│   │   ├── password/      # Password protection tool
│   │   └── compress/      # Compress PDF tool
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components
│   │   ├── layout/       # Layout components
│   │   └── tools/        # Tool-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── store/            # Zustand state management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── docs/                 # Documentation
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # Project overview
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

## Key Dependencies

### Core Libraries
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework

### PDF Processing
- **pdf-lib**: Core PDF manipulation (merge, split, password protection)
- **pdfjs-dist**: PDF rendering and analysis
- **jspdf**: PDF generation from images
- **react-pdf**: PDF preview and display

### State Management & UI
- **Zustand**: Lightweight state management
- **@headlessui/react**: Accessible UI components
- **@heroicons/react**: Icon library
- **react-dropzone**: File upload handling

## Development Workflow

### 1. Adding New Tools

To add a new PDF tool:

1. Create a new route in `app/(tools)/[tool-name]/page.tsx`
2. Add the tool to the navigation in `app/components/layout/Header.tsx`
3. Add the tool to the homepage grid in `app/page.tsx`
4. Implement the tool logic in `app/lib/pdf-utils.ts`
5. Create tool-specific components in `app/components/tools/`

### 2. Styling Guidelines

- Use Tailwind CSS utility classes
- Follow the design system defined in `tailwind.config.js`
- Use the custom component classes defined in `app/globals.css`
- Maintain consistent spacing using the 8px grid system

### 3. State Management

- Use Zustand store for global state (`app/store/pdf-store.ts`)
- Keep component state local when possible
- Follow the established patterns for file management and processing state

### 4. Error Handling

- Always wrap PDF operations in try-catch blocks
- Provide meaningful error messages to users
- Use the processing state to show error information
- Validate files before processing

## Building for Production

### 1. Build the Application

```bash
# Build for production
npm run build

# The build output will be in the .next directory
```

### 2. Static Export (Recommended)

The project is configured for static export, which is perfect for local-first applications:

```bash
# Build and export static files
npm run build
npm run export

# Static files will be in the out directory
```

### 3. Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

#### Netlify
```bash
# Build the project
npm run build
npm run export

# Deploy the 'out' directory to Netlify
```

#### GitHub Pages
```bash
# Build the project
npm run build
npm run export

# Push the 'out' directory to GitHub Pages
```

#### Self-Hosted
```bash
# Build the project
npm run build
npm run export

# Serve the 'out' directory with any static file server
npx serve out
```

## Troubleshooting

### Common Issues

#### 1. PDF.js Worker Issues
If you encounter PDF.js worker errors:

```javascript
// Ensure the worker is properly configured in pdf-utils.ts
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${GlobalWorkerOptions.workerVersion}/pdf.worker.min.js`
```

#### 2. Memory Issues with Large Files
For large PDF files, consider:

- Implementing chunked processing
- Adding file size limits
- Using Web Workers for heavy operations

#### 3. TypeScript Errors
If you encounter TypeScript errors:

```bash
# Check for type errors
npm run type-check

# Install missing type definitions
npm install --save-dev @types/[package-name]
```

#### 4. Build Errors
If the build fails:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

### Performance Optimization

#### 1. Bundle Size
- The project uses code splitting for PDF libraries
- Large libraries are loaded only when needed
- Consider lazy loading for tool-specific components

#### 2. Memory Management
- Files are processed in memory only during processing
- Automatic cleanup after operations
- Progress tracking for large files

#### 3. Browser Compatibility
- Test in Chrome, Firefox, Safari, and Edge
- Use feature detection for advanced PDF operations
- Provide fallbacks for older browsers

## Contributing

### 1. Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### 2. Testing
- Write unit tests for utility functions
- Test PDF operations with various file types
- Ensure accessibility compliance
- Test on different browsers

### 3. Documentation
- Update README.md for new features
- Document API changes
- Add inline comments for complex logic
- Update setup instructions if needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include browser version and error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

## Unlock PDF (Client-Side) Setup

The Unlock PDF tool runs entirely in the browser. It uses PDF.js (loaded from a CDN) to open password-protected files and pdf-lib to rebuild an unprotected version, so no dedicated backend or qpdf binary is required.

### Local development
1. Start the dev server with `npm run dev`.
2. Open the Unlock tool, upload an encrypted PDF, and enter its password.
3. Each page is rendered to an offscreen canvas and re-embedded into a fresh PDF that can be saved locally.

### Deploying
- Static exports via `npm run build && npm run export` are supported again because no serverless API is needed.
- Host `pdf.js` and `pdf.worker.js` yourself if you prefer not to use the CDN URLs defined in `app/lib/unlock-client.ts`.

Because everything runs locally, no additional environment variables or binaries are necessary. Use HTTPS when deploying to ensure CDN assets and the application itself are delivered securely.
