import React, { useState, useRef } from 'react';
import { Download, Code, FileText, Zap, Copy, Check } from 'lucide-react';

const ArtifactConverter = () => {
  const [artifactCode, setArtifactCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isConverted, setIsConverted] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [convertedFiles, setConvertedFiles] = useState({});
  
  const textareaRef = useRef(null);

  const generateProjectFiles = () => {
    if (!artifactCode.trim() || !projectName.trim()) return;

    // Clean project name for filename
    const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Generate the TSX file
    const tsxContent = artifactCode.trim();
    
    // Generate package.json for standalone project
    const packageJson = {
      name: cleanName,
      version: "1.0.0",
      description: projectDescription || "Generated from Claude artifact",
      main: "index.js",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.263.1"
      },
      devDependencies: {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@vitejs/plugin-react": "^4.0.3",
        autoprefixer: "^10.4.14",
        postcss: "^8.4.24",
        tailwindcss: "^3.3.0",
        typescript: "^5.0.2",
        vite: "^4.4.5"
      }
    };

    // Generate index.html
    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    // Generate main.tsx
    const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

    // Generate index.css with Tailwind
    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

    // Generate Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    // Generate Vite config
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
})`;

    // Generate PostCSS config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    // Generate README
    const readme = `# ${projectName}

${projectDescription || 'Generated from Claude artifact'}

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Deploy to GitHub Pages

\`\`\`bash
# Build the project
npm run build

# Copy dist contents to your projects folder
cp -r dist/* ../your-github-pages-repo/projects/${cleanName}/
\`\`\`

Generated with Claude Artifact Converter
`;

    const files = {
      [`${cleanName}.tsx`]: tsxContent,
      'package.json': JSON.stringify(packageJson, null, 2),
      'index.html': indexHtml,
      'src/main.tsx': mainTsx,
      'src/App.tsx': tsxContent,
      'src/index.css': indexCss,
      'tailwind.config.js': tailwindConfig,
      'vite.config.ts': viteConfig,
      'postcss.config.js': postcssConfig,
      'README.md': readme
    };

    setConvertedFiles(files);
    setIsConverted(true);
  };

  const copyToClipboard = async (content, fileKey) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [fileKey]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [fileKey]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = () => {
    // For now, we'll provide instructions to manually create the structure
    const instructions = `# Project Structure for ${projectName}

Create this folder structure:

${Object.keys(convertedFiles).map(filename => {
  const isInSrc = filename.startsWith('src/');
  const displayPath = isInSrc ? filename : filename;
  return `📁 ${displayPath}`;
}).join('\n')}

Then copy each file content from the converter below.

Alternatively, download each file individually using the download buttons.`;

    downloadFile(instructions, `${projectName}-structure.txt`);
  };

  const resetConverter = () => {
    setArtifactCode('');
    setProjectName('');
    setProjectDescription('');
    setIsConverted(false);
    setConvertedFiles({});
    setCopiedStates({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="text-purple-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Claude Artifact Converter</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform your Claude artifacts into deployable React projects
          </p>
        </div>

        {!isConverted ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (optional)
              </label>
              <input
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A cool interactive demo built with Claude"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="inline mr-2" size={16} />
                Paste Your Claude Artifact Code
              </label>
              <textarea
                ref={textareaRef}
                value={artifactCode}
                onChange={(e) => setArtifactCode(e.target.value)}
                placeholder="import React, { useState } from 'react'...&#10;&#10;const MyComponent = () => {&#10;  // Your Claude artifact code here&#10;};&#10;&#10;export default MyComponent;"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={generateProjectFiles}
              disabled={!artifactCode.trim() || !projectName.trim()}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              Convert to Project
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Check size={20} />
                <h3 className="font-semibold">Project Generated Successfully!</h3>
              </div>
              <p className="text-green-700 mt-1">
                Your artifact has been converted to a full React project structure.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={downloadAllAsZip}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={16} />
                Download Structure Guide
              </button>
              <button
                onClick={resetConverter}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Convert Another
              </button>
            </div>

            <div className="grid gap-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={20} />
                Generated Project Files
              </h3>

              {Object.entries(convertedFiles).map(([filename, content]) => (
                <div key={filename} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-gray-700">
                      {filename}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(content, filename)}
                        className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                      >
                        {copiedStates[filename] ? (
                          <>
                            <Check size={16} className="text-green-500" />
                            <span className="text-xs text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => downloadFile(content, filename)}
                        className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                      >
                        <Download size={16} />
                        <span className="text-xs">Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Quick Setup Instructions:</h4>
              <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                <li>Create a new folder for your project</li>
                <li>Copy the files above into the appropriate structure</li>
                <li>Run <code className="bg-blue-100 px-1 rounded">npm install</code></li>
                <li>Run <code className="bg-blue-100 px-1 rounded">npm run dev</code> to start development</li>
                <li>Run <code className="bg-blue-100 px-1 rounded">npm run build</code> to build for production</li>
                <li>Copy the <code className="bg-blue-100 px-1 rounded">dist/</code> folder contents to your GitHub Pages</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactConverter;