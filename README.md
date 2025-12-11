# Local PDF Toolbox

A privacy-focused, local-first PDF utility website that operates entirely on your local machine. No files are uploaded to external servers - all processing happens directly in your browser.

## 🎯 Project Overview

Local PDF Toolbox is designed to provide essential PDF manipulation tools while ensuring complete data privacy. Unlike traditional online PDF tools that require uploading your files to external servers, **your files never leave your device**.

## ✨ Core Features (MVP)

- **Merge PDF**: Combine multiple PDF files into one
- **Split PDF**: Extract specific pages or page ranges
- **Extract Pages**: Select and download individual pages
- **Convert PDF to Image**: Convert PDF pages to PNG/JPEG
- **Image to PDF**: Convert image files to PDF
- **Password Protect PDF**: Add password protection
- **Unlock PDF**: Remove password protection (requires correct password)
- **Compress PDF**: Reduce file size

## 🏗️ Architecture

### Local-First Philosophy
- All PDF processing occurs in the browser using JavaScript libraries
- No server uploads unless explicitly initiated by user
- Works offline after initial load
- Complete data privacy and control

### Technology Stack

**Frontend**: Next.js 14 (App Router)
- **Why Next.js**: Superior developer experience, built-in API routes for complex operations, excellent performance, and seamless deployment options

**PDF Libraries**:
- `pdf-lib`: Core PDF manipulation (merge, split, password protection)
- `pdfjs-dist`: PDF rendering and page extraction
- `jspdf`: PDF generation from images
- `react-pdf`: PDF preview and display
- `canvas2image`: Image conversion utilities

**State Management**: Zustand (lightweight, simple, perfect for this use case)

**Styling**: Tailwind CSS + Headless UI components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd local-pdf-toolbox

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
local-pdf-toolbox/
├── app/                    # Next.js App Router
│   ├── (tools)/           # Tool-specific routes
│   ├── api/               # API routes (if needed)
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── store/             # Zustand state management
├── public/                # Static assets
├── types/                 # TypeScript type definitions
└── docs/                  # Documentation
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Key Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^3.11.174",
  "jspdf": "^2.5.1",
  "react-pdf": "^7.5.1",
  "zustand": "^4.4.1",
  "tailwindcss": "^3.3.0",
  "@headlessui/react": "^1.7.17"
}
```

## 🔒 Privacy & Security

- **No Server Uploads**: All processing happens locally
- **No Analytics**: No tracking or data collection
- **Open Source**: Transparent codebase
- **Offline Capable**: Works without internet after initial load

## 🛣️ Roadmap

### Phase 1 (MVP) - Current
- Core PDF manipulation tools
- Basic UI/UX
- Local processing

### Phase 2
- Advanced PDF editing
- OCR capabilities
- Batch processing
- Custom themes

### Phase 3
- Desktop application (Electron)
- Cloud storage integration (optional)
- Advanced compression algorithms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the troubleshooting guide

---

**Built with ❤️ for privacy-conscious users** 

## Unlock PDF API (qpdf)

The Unlock PDF tool now runs entirely inside the Next.js deployment through `/api/unlock` (see `app/api/unlock/route.ts`). The route shells out to [qpdf](https://qpdf.sourceforge.io/) to remove the password protection and streams the unlocked PDF back to the browser.

### Requirements
1. Install `qpdf` on your development machine (macOS: `brew install qpdf`, Ubuntu: `sudo apt-get install qpdf`, Windows: download from the official releases) or use the bundled binary in `backend/bin/qpdf`.
2. Ensure the binary is available on `PATH`, or point the app to a custom executable by setting the `QPDF_BINARY_PATH` environment variable (for example `QPDF_BINARY_PATH=backend/bin/qpdf`).

### Usage
1. Run `npm run dev` or start your production build normally with `npm run start`.
2. Open the Unlock PDF tool in the UI. The frontend automatically POSTs to `/api/unlock` with the PDF and password.
3. The API route writes files to the runtime `/tmp` directory, invokes `qpdf --decrypt`, and streams the unlocked file back to the client.

### Deployment Notes
- When deploying to Vercel (or any serverless host), bundle a Linux-compatible `qpdf` binary with your repository and set `QPDF_BINARY_PATH` to its absolute path. The provided `backend/bin/qpdf` was copied from the local development machine—replace it with a Linux build before deploying.
- Because `/api/unlock` requires a server runtime, skip `next export` and deploy with `next start` or Vercel’s default serverless build output.

### Security
- Temporary files are deleted immediately after each request finishes.
- Serve the API over HTTPS and keep your bundled `qpdf` binary in a trusted location.
