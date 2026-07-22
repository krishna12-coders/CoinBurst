const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Remove imports
code = code.replace(/import \{ ResponsiveCalendar \} from '@nivo\/calendar';\n/, '');
code = code.replace(/import \{ ResponsiveSankey \} from '@nivo\/sankey';\n/, '');

// Remove data blocks
code = code.replace(/\/\/ Process data for Nivo Calendar \(daily expenses\)[\s\S]*?\}, \[transactions, accounts\]\);\n\n/, '');

// Remove UI blocks
code = code.replace(/      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">[\s\S]*?<\/div>\n    <\/div>/, '    </div>');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Removed charts successfully');
