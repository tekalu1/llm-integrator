import { d as defineEventHandler, I as readMultipartFormData } from '../../nitro/nitro.mjs';
import * as path$1 from 'path';
import path__default from 'path';
import * as fs$1 from 'fs';
import { existsSync, mkdirSync, promises } from 'fs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

const require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(path$1);

const require$$1 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(fs$1);

var code = {exports: {}};

var hasRequiredCode;

function requireCode () {
	if (hasRequiredCode) return code.exports;
	hasRequiredCode = 1;
	// Map of file extensions to markdown language identifiers
	const langMap = {
	  '.js': 'javascript',
	  '.html': 'markup',
	  '.java': 'java',
	  '.cs': 'csharp',
	  '.py': 'python',
	  '.cpp': 'cpp',
	  '.c': 'c',
	  '.go': 'go',
	  '.sql': 'sql',
	  '.php': 'php',
	  '.swift': 'swift',
	  '.css': 'css',
	  '.rb': 'ruby',
	  '.ts': 'typescript',
	  '.rs': 'rust',
	  '.kt': 'kotlin',
	  '.lua': 'lua',
	  '.m': 'matlab',
	  '.sh': 'shell',
	  '.bash': 'shell',
	  // Framework extensions
	  '.jsx': 'jsx',
	  '.tsx': 'tsx',
	  '.vue': 'markup',
	  '.svelte': 'markup',
	};

	class CodeConverter {
	  // Make langMap accessible as a static property
	  static supportedExtensions = Object.keys(langMap).map(ext => ext.slice(1));
	  
	  async convert(f) {
	    const fs = require$$1.promises;
	    const path = require$$0;

	    try {
	      const ext = path.extname(f).toLowerCase();
	      const fileName = path.basename(f);
	      const content = await fs.readFile(f, 'utf8');
	      
	      // Determine language for syntax highlighting
	      const lang = langMap[ext] || 'plaintext';
	      
	      // Format the output with filename as heading and code block
	      return [
	        `# ${fileName}`,
	        '',
	        '```' + lang,
	        content,
	        '```'
	      ].join('\n').trim();
	      
	    } catch (error) {
	      return `# Error\n\nFailed to read file: ${error.message}`;
	    }
	  }
	}

	code.exports = CodeConverter;
	code.exports.langMap = langMap;
	return code.exports;
}

const path = require$$0;
const fs = require$$1.promises;
const fsSync = require$$1;

class MarkitDown {
  constructor(options = {}) {
    this.options = options;
  }

  async copyViewerHtml(outputPath) {
    try {
      const outputDir = path.dirname(outputPath);
      const viewerSource = path.join(__dirname, 'viewer.html');
      const viewerDest = path.join(outputDir, 'viewer.html');
      const rendererSource = path.join(__dirname, '..', 'dist', 'renderer.bundle.js');
      const rendererDest = path.join(outputDir, 'renderer.bundle.js');
      
      // Create dist directory if it doesn't exist
      const distDir = path.join(outputDir, 'dist');
      if (!fsSync.existsSync(distDir)) {
        await fs.mkdir(distDir, { recursive: true });
      }
      
      if (fsSync.existsSync(viewerSource)) {
        await fs.copyFile(viewerSource, viewerDest);
        // Update the script src in viewer.html to point to the local renderer bundle
        let viewerContent = await fs.readFile(viewerDest, 'utf8');
        viewerContent = viewerContent.replace('../dist/renderer.bundle.js', './dist/renderer.bundle.js');
        await fs.writeFile(viewerDest, viewerContent);
      }

      if (fsSync.existsSync(rendererSource)) {
        await fs.copyFile(rendererSource, path.join(distDir, 'renderer.bundle.js'));
      }
    } catch (error) {
      console.warn('Warning: Could not copy viewer files:', error.message);
    }
  }

  async convertToMarkdown(inputPath, outputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase().slice(1);
      const Converter = await this.getFileType(ext);
      
      if (!Converter) {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      const converter = new Converter();
      const markdown = await converter.convert(inputPath);
      
      if (outputPath) {
        await fs.writeFile(outputPath, markdown);
        await this.copyViewerHtml(outputPath);
      }
      
      return markdown;
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  async getFileType(ext) {
    const CodeConverter = /*@__PURE__*/ requireCode();
    
    const typeMap = {
      'pdf': './converters/pdf',
      'txt': './converters/txt',
      'docx': './converters/docx',
      'pptx': './converters/pptx',
      'xlsx': './converters/xlsx',
      '7z': './converters/7zip',
      'zip': './converters/zip',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, './converters/code']
        )
      )
    };

    const converterPath = typeMap[ext];
    if (!converterPath) return null;

    return commonjsRequire(converterPath);
  }
}

var src = {
  MarkitDown,
  convertToMarkdown: async (input, output, options) => {
    const converter = new MarkitDown(options);
    return converter.convertToMarkdown(input, output);
  }
};

const MarkitDown$1 = /*@__PURE__*/getDefaultExportFromCjs(src);

const convertToMarkdownV2_post = defineEventHandler(async (event) => {
  const dir = "./server/tmp/";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const formData = await readMultipartFormData(event);
  if (!formData || !formData[0]) {
    return { error: "No file uploaded" };
  }
  const file = formData[0];
  const tempFilePath = path__default.resolve(dir, file.filename);
  path__default.resolve(dir, "out.txt");
  try {
    await promises.writeFile(tempFilePath, file.data);
    const markdown = await MarkitDown$1.convertToMarkdown(tempFilePath);
    await promises.unlink(tempFilePath);
    return { markdown };
  } catch (error) {
    console.error("Error converting file:", error);
    return { error: "Conversion failed" };
  }
});

export { convertToMarkdownV2_post as default };
//# sourceMappingURL=convert-to-markdown-v2.post.mjs.map
