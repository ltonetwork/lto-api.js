const fs = require('fs');
const path = require('path');

// Define the directory containing your compiled JavaScript files
const OUTPUT_DIR = process.argv[2];

// Recursive function to process all JavaScript files in the directory
function processDirectory(dir) {
  const promises = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    const promise = fs.promises.readFile(fullPath, 'utf-8').then((content) => {
      const updatedContent = content.replace(/\bfrom\s+(["'])(\..+)\1/g, (original, quote, file) => {
        const includePath = path.resolve(dir, file);
        if (file.endsWith('.js')) return original;
        if (fs.existsSync(`${includePath}.js`)) return `from ${quote}${file}.js${quote}`;
        if (fs.statSync(includePath).isDirectory()) return `from ${quote}${file}/index.js${quote}`;
        return original;
      });

      fs.writeFileSync(fullPath, updatedContent);
    });

    promises.push(promise);
  }

  return Promise.all(promises);
}

fs.writeFileSync(OUTPUT_DIR + '/package.json', JSON.stringify({ type: 'module' }));

processDirectory(OUTPUT_DIR).then(() => {
  console.log('Post-compile script executed successfully.');
});
