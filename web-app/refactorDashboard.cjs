const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardWeb.tsx', 'utf8');

// 1. Remove Sidebar
code = code.replace(/<aside[\\s\\S]*?<\\/aside>/, '{/* Sidebar extracted */}');

// 2. Remove Mobile Nav
code = code.replace(/{\\/\\* Mobile Top Navigation Bar \\*\\/}[\\s\\S]*?<main/, '{/* Mobile Nav extracted */}\\n      <main');

// 3. Remove the outermost div classes that conflict with Layout
// Instead of replacing the div, let's just make it a fragment
code = code.replace(/<div className={\`flex w-full min-h-screen[\\s\\S]*?font-sans\`}>/, '<>');
code = code.replace(/<\\/main>\\s*<\\/div>\\s*\\);/, '</main>\\n    </>\\n  );');

fs.writeFileSync('src/components/DashboardWeb.tsx', code);
console.log('Successfully refactored DashboardWeb');
