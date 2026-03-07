const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorMap = {
  'blush-50': 'brand-50',
  'blush-100': 'brand-100',
  'blush-200': 'brand-200',
  'blush-300': 'brand-300',
  'blush-400': 'brand-400',
  'blush-500': 'brand-500',
  'blush-600': 'brand-600',
  'blush-700': 'brand-700',
  'blush-800': 'brand-800',
  'blush-900': 'charcoal-900', // Making deep blush fall to charcoal for text readability

  'science-blue-50': 'charcoal-50',
  'science-blue-100': 'charcoal-100',
  'science-blue-200': 'charcoal-200',
  'science-blue-300': 'charcoal-300',
  'science-blue-400': 'charcoal-400',
  'science-blue-500': 'charcoal-500',
  'science-blue-600': 'charcoal-600',
  'science-blue-700': 'charcoal-700',
  'science-blue-800': 'charcoal-800',
  'science-blue-900': 'charcoal-900',

  'theme-accent': 'brand-400',
  'theme-accent-hover': 'brand-500',

  'glow-teal-50': 'brand-50',
  'glow-teal-100': 'brand-100',
  'glow-teal-200': 'brand-200',
  'glow-teal-300': 'brand-300',
  'glow-teal-400': 'brand-400',
  'glow-teal-500': 'brand-500',
  'glow-teal-600': 'brand-600',
  'glow-teal-700': 'brand-700',
  'glow-teal-800': 'brand-800',
  'glow-teal-900': 'brand-900',

  'tech-teal-light': 'emerald-600',
  'tech-teal': 'emerald-600',

  'bio-green-light': 'emerald-100',
  'bio-green-50': 'emerald-50',
  'bio-green-100': 'emerald-100',
  'bio-green-200': 'emerald-200',
  'bio-green-500': 'emerald-500',
  'bio-green-600': 'emerald-600',
  'bio-green-700': 'emerald-700',
  'bio-green': 'emerald-600'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      // We will replace whole words matching our color map keys
      for (const [oldClass, newClass] of Object.entries(colorMap)) {
        const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
        content = content.replace(regex, newClass);
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done!');
