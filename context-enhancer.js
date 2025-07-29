#!/usr/bin/env node
/**
 * CONTEXT ENHANCER - Advanced context sharing and IDE integration
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

class ContextEnhancer {
  constructor() {
    this.context = {
      project: {},
      files: {},
      dependencies: {},
      structure: {},
      metadata: {}
    };
  }

  async enhanceContext(rootPath = '.') {
    console.log('🧠 CONTEXT ENHANCER: Building comprehensive context...');
    
    await this.analyzeProject(rootPath);
    await this.extractFileContext(rootPath);
    await this.buildDependencyGraph();
    await this.createStructureMap(rootPath);
    await this.generateMetadata();
    
    // Share with IDE and extensions
    await this.shareWithVSCode();
    await this.shareWithWindsurf();
    await this.shareWithExtensions();
    
    console.log('✅ CONTEXT ENHANCER: Context enhanced and shared');
    return this.context;
  }

  async analyzeProject(rootPath) {
    const pkg = this.readPackageJson();
    const readme = this.readReadme();
    
    this.context.project = {
      name: pkg?.name || 'Unknown Project',
      version: pkg?.version || '0.0.0',
      description: pkg?.description || readme?.description || 'No description',
      type: this.detectProjectType(pkg),
      framework: this.detectFramework(pkg),
      language: this.detectPrimaryLanguage(rootPath),
      scripts: pkg?.scripts || {},
      keywords: pkg?.keywords || [],
      author: pkg?.author || 'Unknown',
      license: pkg?.license || 'Unknown'
    };
  }

  readPackageJson() {
    try {
      return JSON.parse(readFileSync('package.json', 'utf8'));
    } catch {
      return null;
    }
  }

  readReadme() {
    const readmeFiles = ['README.md', 'readme.md', 'README.txt'];
    for (const file of readmeFiles) {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        return { description: this.extractDescription(content) };
      }
    }
    return null;
  }

  extractDescription(content) {
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && line.length > 20) {
        return line;
      }
    }
    return 'No description found';
  }

  detectProjectType(pkg) {
    if (pkg?.dependencies?.react || pkg?.devDependencies?.react) return 'React';
    if (pkg?.dependencies?.vue || pkg?.devDependencies?.vue) return 'Vue';
    if (pkg?.dependencies?.angular || pkg?.devDependencies?.angular) return 'Angular';
    if (pkg?.dependencies?.express || pkg?.devDependencies?.express) return 'Express';
    if (pkg?.dependencies?.next || pkg?.devDependencies?.next) return 'Next.js';
    if (existsSync('requirements.txt') || existsSync('setup.py')) return 'Python';
    if (existsSync('Cargo.toml')) return 'Rust';
    if (existsSync('go.mod')) return 'Go';
    return 'Node.js';
  }

  detectFramework(pkg) {
    const frameworks = {
      'next': 'Next.js',
      'nuxt': 'Nuxt.js',
      'gatsby': 'Gatsby',
      'svelte': 'Svelte',
      'astro': 'Astro',
      'vite': 'Vite',
      'webpack': 'Webpack',
      'parcel': 'Parcel'
    };

    for (const [key, name] of Object.entries(frameworks)) {
      if (pkg?.dependencies?.[key] || pkg?.devDependencies?.[key]) {
        return name;
      }
    }
    return 'None';
  }

  detectPrimaryLanguage(rootPath) {
    const extensions = {};
    this.scanForExtensions(rootPath, extensions);
    
    const sorted = Object.entries(extensions).sort((a, b) => b[1] - a[1]);
    const langMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'JavaScript (React)',
      '.tsx': 'TypeScript (React)',
      '.py': 'Python',
      '.rs': 'Rust',
      '.go': 'Go',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C'
    };
    
    return langMap[sorted[0]?.[0]] || 'Unknown';
  }

  scanForExtensions(dir, extensions) {
    try {
      const items = readdirSync(dir);
      items.forEach(item => {
        if (item.startsWith('.') || item === 'node_modules') return;
        
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.scanForExtensions(fullPath, extensions);
        } else {
          const ext = extname(item);
          if (ext) {
            extensions[ext] = (extensions[ext] || 0) + 1;
          }
        }
      });
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  async extractFileContext(rootPath) {
    const importantFiles = this.findImportantFiles(rootPath);
    
    for (const file of importantFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const relativePath = relative(rootPath, file);
        
        this.context.files[relativePath] = {
          type: this.getFileType(file),
          size: content.length,
          lines: content.split('\n').length,
          imports: this.extractImports(content),
          exports: this.extractExports(content),
          functions: this.extractFunctions(content),
          classes: this.extractClasses(content),
          summary: this.generateFileSummary(content, file)
        };
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  findImportantFiles(rootPath) {
    const important = [];
    const importantPatterns = [
      /^(index|main|app)\.(js|ts|jsx|tsx)$/,
      /^package\.json$/,
      /^tsconfig\.json$/,
      /^webpack\.config\.(js|ts)$/,
      /^vite\.config\.(js|ts)$/,
      /^next\.config\.(js|ts)$/,
      /README\.(md|txt)$/i,
      /\.config\.(js|ts|json)$/
    ];

    const scan = (dir, depth = 0) => {
      if (depth > 3) return; // Limit depth
      
      try {
        const items = readdirSync(dir);
        items.forEach(item => {
          if (item.startsWith('.') || item === 'node_modules') return;
          
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            scan(fullPath, depth + 1);
          } else {
            if (importantPatterns.some(pattern => pattern.test(item))) {
              important.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Skip directories that can't be read
      }
    };

    scan(rootPath);
    return important.slice(0, 50); // Limit to 50 files
  }

  getFileType(file) {
    const ext = extname(file);
    const typeMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React Component',
      '.tsx': 'React Component (TypeScript)',
      '.json': 'JSON Configuration',
      '.md': 'Markdown Documentation',
      '.css': 'Stylesheet',
      '.scss': 'Sass Stylesheet',
      '.html': 'HTML Template'
    };
    return typeMap[ext] || 'Unknown';
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  extractFunctions(content) {
    const functions = [];
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*:\s*(?:async\s+)?\()/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2] || match[3]);
    }
    
    return functions.filter(Boolean);
  }

  extractClasses(content) {
    const classes = [];
    const classRegex = /class\s+(\w+)/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    
    return classes;
  }

  generateFileSummary(content, file) {
    const lines = content.split('\n');
    const firstComment = lines.find(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    );
    
    if (firstComment) {
      return firstComment.replace(/^[\s/*]+/, '').trim();
    }
    
    return `${this.getFileType(file)} file with ${lines.length} lines`;
  }

  async buildDependencyGraph() {
    const pkg = this.readPackageJson();
    if (!pkg) return;

    this.context.dependencies = {
      production: pkg.dependencies || {},
      development: pkg.devDependencies || {},
      peer: pkg.peerDependencies || {},
      total: Object.keys({...pkg.dependencies, ...pkg.devDependencies}).length,
      categories: this.categorizeDependencies({...pkg.dependencies, ...pkg.devDependencies})
    };
  }

  categorizeDependencies(deps) {
    const categories = {
      framework: [],
      ui: [],
      testing: [],
      build: [],
      utility: [],
      other: []
    };

    const categoryMap = {
      framework: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'express', 'fastify'],
      ui: ['styled-components', 'emotion', 'material-ui', 'antd', 'chakra-ui', 'tailwindcss'],
      testing: ['jest', 'mocha', 'chai', 'cypress', 'playwright', 'vitest'],
      build: ['webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'babel'],
      utility: ['lodash', 'axios', 'moment', 'date-fns', 'uuid', 'crypto-js']
    };

    Object.keys(deps).forEach(dep => {
      let categorized = false;
      for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(keyword => dep.includes(keyword))) {
          categories[category].push(dep);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        categories.other.push(dep);
      }
    });

    return categories;
  }

  async createStructureMap(rootPath) {
    this.context.structure = {
      directories: [],
      fileTypes: {},
      totalFiles: 0,
      totalDirectories: 0
    };

    const scan = (dir, depth = 0) => {
      if (depth > 4) return; // Limit depth
      
      try {
        const items = readdirSync(dir);
        items.forEach(item => {
          if (item.startsWith('.') || item === 'node_modules') return;
          
          const fullPath = join(dir, item);
          const relativePath = relative(rootPath, fullPath);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            this.context.structure.directories.push(relativePath);
            this.context.structure.totalDirectories++;
            scan(fullPath, depth + 1);
          } else {
            const ext = extname(item);
            this.context.structure.fileTypes[ext] = (this.context.structure.fileTypes[ext] || 0) + 1;
            this.context.structure.totalFiles++;
          }
        });
      } catch (error) {
        // Skip directories that can't be read
      }
    };

    scan(rootPath);
  }

  async generateMetadata() {
    this.context.metadata = {
      generated: new Date().toISOString(),
      version: '1.0.0',
      enhancer: 'CONTEXT_ENHANCER',
      stats: {
        projectComplexity: this.calculateComplexity(),
        maintainabilityScore: this.calculateMaintainability(),
        technicalDebt: this.calculateTechnicalDebt()
      },
      recommendations: this.generateRecommendations()
    };
  }

  calculateComplexity() {
    const fileCount = this.context.structure.totalFiles;
    const depCount = this.context.dependencies.total || 0;
    const dirCount = this.context.structure.totalDirectories;
    
    return Math.min(100, (fileCount * 0.1 + depCount * 0.2 + dirCount * 0.3));
  }

  calculateMaintainability() {
    const hasTests = Object.keys(this.context.dependencies.development || {}).some(dep => 
      ['jest', 'mocha', 'vitest', 'cypress'].includes(dep)
    );
    const hasLinting = Object.keys(this.context.dependencies.development || {}).some(dep => 
      ['eslint', 'prettier', 'tslint'].includes(dep)
    );
    const hasTypeScript = this.context.project.language?.includes('TypeScript');
    const hasDocumentation = Object.keys(this.context.files).some(file => 
      file.toLowerCase().includes('readme')
    );

    let score = 50;
    if (hasTests) score += 20;
    if (hasLinting) score += 15;
    if (hasTypeScript) score += 10;
    if (hasDocumentation) score += 5;

    return Math.min(100, score);
  }

  calculateTechnicalDebt() {
    const complexity = this.calculateComplexity();
    const maintainability = this.calculateMaintainability();
    
    return Math.max(0, complexity - maintainability);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.context.metadata.stats.maintainabilityScore < 70) {
      recommendations.push('Improve code maintainability with better documentation and testing');
    }
    
    if (this.context.metadata.stats.technicalDebt > 30) {
      recommendations.push('Address technical debt through refactoring');
    }
    
    if (!this.context.project.language?.includes('TypeScript')) {
      recommendations.push('Consider migrating to TypeScript for better type safety');
    }
    
    return recommendations;
  }

  async shareWithVSCode() {
    const vscodeConfig = {
      "files.associations": this.generateFileAssociations(),
      "editor.quickSuggestions": {
        "other": true,
        "comments": false,
        "strings": true
      },
      "typescript.preferences.includePackageJsonAutoImports": "on",
      "javascript.preferences.includePackageJsonAutoImports": "on",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
      }
    };

    writeFileSync('.vscode/settings.json', JSON.stringify(vscodeConfig, null, 2));
    
    // Create launch configuration
    const launchConfig = {
      "version": "0.2.0",
      "configurations": this.generateLaunchConfigurations()
    };
    
    writeFileSync('.vscode/launch.json', JSON.stringify(launchConfig, null, 2));
  }

  generateFileAssociations() {
    const associations = {};
    const typeMap = {
      '.jsx': 'javascriptreact',
      '.tsx': 'typescriptreact',
      '.mjs': 'javascript',
      '.cjs': 'javascript'
    };

    Object.entries(this.context.structure.fileTypes).forEach(([ext, count]) => {
      if (typeMap[ext]) {
        associations[`*${ext}`] = typeMap[ext];
      }
    });

    return associations;
  }

  generateLaunchConfigurations() {
    const configs = [];
    
    if (this.context.project.type === 'Node.js') {
      configs.push({
        "name": "Launch Program",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/index.js",
        "console": "integratedTerminal"
      });
    }

    if (this.context.project.scripts?.test) {
      configs.push({
        "name": "Run Tests",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/node_modules/.bin/jest",
        "args": ["--runInBand"],
        "console": "integratedTerminal"
      });
    }

    return configs;
  }

  async shareWithWindsurf() {
    const windsurfConfig = {
      "project": this.context.project,
      "context": {
        "files": Object.keys(this.context.files),
        "dependencies": this.context.dependencies,
        "structure": this.context.structure
      },
      "ai": {
        "contextAwareness": {
          "includeProjectStructure": true,
          "includeFileContext": true,
          "includeDependencies": true
        }
      }
    };

    writeFileSync('.windsurf/context.json', JSON.stringify(windsurfConfig, null, 2));
  }

  async shareWithExtensions() {
    // Create context file for other extensions
    const extensionContext = {
      project: this.context.project,
      files: this.context.files,
      dependencies: this.context.dependencies,
      structure: this.context.structure,
      metadata: this.context.metadata
    };

    writeFileSync('project-context.json', JSON.stringify(extensionContext, null, 2));
    
    // Create IDE-specific context files
    await this.createIDEContextFiles();
  }

  async createIDEContextFiles() {
    // Create .editorconfig if missing
    if (!existsSync('.editorconfig')) {
      const editorConfig = `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[*.py]
indent_size = 4
`;
      writeFileSync('.editorconfig', editorConfig);
    }

    // Create context summary for AI assistants
    const aiContext = `# Project Context Summary

## Project: ${this.context.project.name}
- Type: ${this.context.project.type}
- Language: ${this.context.project.language}
- Framework: ${this.context.project.framework}

## Structure
- Files: ${this.context.structure.totalFiles}
- Directories: ${this.context.structure.totalDirectories}
- Dependencies: ${this.context.dependencies.total}

## Key Files
${Object.keys(this.context.files).slice(0, 10).map(file => `- ${file}`).join('\n')}

## Recommendations
${this.context.metadata.recommendations.map(rec => `- ${rec}`).join('\n')}
`;

    writeFileSync('AI_CONTEXT.md', aiContext);
  }

  getContext() {
    return this.context;
  }
}

export default ContextEnhancer;