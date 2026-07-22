const fs = require('fs');

['src/pages/Layout.tsx', 'src/pages/Dashboard.tsx', 'src/utils/aiCommandEngine.ts'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // Replace literal string "\`" with "`"
  code = code.replace(/\\`/g, '`');
  // Replace literal string "\$" with "$"
  code = code.replace(/\\\$/g, '$');
  fs.writeFileSync(file, code);
  console.log('Fixed', file);
});

// Also fix package.json to use --host
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace('"dev": "vite"', '"dev": "vite --host"');
fs.writeFileSync('package.json', pkg);
