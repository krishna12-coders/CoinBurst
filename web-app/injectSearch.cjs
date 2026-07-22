const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardWeb.tsx', 'utf8');

// 1. Add Search import icon
code = code.replace(
  "Plus, Trash2, ArrowUpRight, ArrowDownRight, Settings,",
  "Plus, Trash2, ArrowUpRight, ArrowDownRight, Settings, Search, FileText, FileImage, FileSpreadsheet, ChevronDown,"
);

// 2. Add search state alongside ledger filters
code = code.replace(
  "// Ledger Filters\n  const [ledgerFilterType, setLedgerFilterType] = useState('all');",
  "// Ledger Filters\n  const [ledgerSearch, setLedgerSearch] = useState('');\n  const [showExportMenu, setShowExportMenu] = useState(false);\n  const [ledgerFilterType, setLedgerFilterType] = useState('all');"
);

// 3. Add search filter to ledgerTransactions computation
code = code.replace(
  "const ledgerTransactions = transactions\n    .filter(t => ledgerFilterType === 'all' ? true : t.type === ledgerFilterType)",
  "const ledgerTransactions = transactions\n    .filter(t => {\n      if (!ledgerSearch) return true;\n      const q = ledgerSearch.toLowerCase();\n      return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q);\n    })\n    .filter(t => ledgerFilterType === 'all' ? true : t.type === ledgerFilterType)"
);

// 4. Replace multi-format download function
const newDownloadFn = `// Multi-format Statement Exporter
const downloadStatement = (transactions: any[], accounts: any[], format: string = 'csv') => {
  try {
    const dateStr = new Date().toISOString().substring(0, 10);
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Account'];
    const rows = transactions.map(t => {
      const acc = accounts.find((a: any) => a.id === t.accountId);
      return [
        new Date(t.date).toLocaleString(),
        t.description,
        t.type,
        t.category,
        t.amount,
        acc ? acc.name : 'Unknown'
      ];
    });

    if (format === 'csv') {
      const csvContent = [headers.join(','), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(','))].join('\\n');
      downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'CoinBurst_Statement_' + dateStr + '.csv');
    } else if (format === 'json') {
      const jsonData = transactions.map(t => { const acc = accounts.find((a: any) => a.id === t.accountId); return { date: t.date, description: t.description, type: t.type, category: t.category, amount: t.amount, account: acc?.name || 'Unknown' }; });
      downloadBlob(new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }), 'CoinBurst_Statement_' + dateStr + '.json');
    } else if (format === 'txt') {
      let txt = 'COINBURST FINANCIAL STATEMENT\\n' + '='.repeat(60) + '\\nGenerated: ' + new Date().toLocaleString() + '\\n' + '='.repeat(60) + '\\n\\n';
      rows.forEach(r => { txt += r[0] + ' | ' + r[2].toUpperCase() + ' | ' + r[3] + ' | ' + r[1] + ' | ' + r[4] + ' | ' + r[5] + '\\n'; });
      const totalInc = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
      const totalExp = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
      txt += '\\n' + '='.repeat(60) + '\\nTotal Income: ' + totalInc + '\\nTotal Expense: ' + totalExp + '\\nNet: ' + (totalInc - totalExp) + '\\n';
      downloadBlob(new Blob([txt], { type: 'text/plain' }), 'CoinBurst_Statement_' + dateStr + '.txt');
    } else if (format === 'html') {
      let html = '<!DOCTYPE html><html><head><title>CoinBurst Statement</title><style>body{font-family:sans-serif;padding:40px;background:#0B0B0F;color:#fff}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;text-align:left;border-bottom:1px solid #1E1E26}th{background:#1E1E26;color:#00FF88;text-transform:uppercase;font-size:12px;letter-spacing:2px}.income{color:#10B981}.expense{color:#EF4444}h1{background:linear-gradient(90deg,#FF007F,#00FF88,#00E5FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px}</style></head><body><h1>CoinBurst Statement</h1><p style="color:#9CA3AF">Generated: ' + new Date().toLocaleString() + '</p><table><tr>';
      headers.forEach(h => { html += '<th>' + h + '</th>'; });
      html += '</tr>';
      rows.forEach(r => { html += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="' + r[2] + '">' + r[2] + '</td><td>' + r[3] + '</td><td class="' + r[2] + '">' + (r[2] === 'income' ? '+' : '-') + r[4] + '</td><td>' + r[5] + '</td></tr>'; });
      html += '</table></body></html>';
      downloadBlob(new Blob([html], { type: 'text/html' }), 'CoinBurst_Statement_' + dateStr + '.html');
    }
  } catch (err) {
    console.error("Statement download failed:", err);
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};`;

code = code.replace(
  /\/\/ CSV Statement Exporter \(Downloads\)\nconst downloadStatement = \(transactions: any\[\], accounts: any\[\]\) => \{[\s\S]*?console\.error\("Statement download failed:", err\);\s*\}\s*\};/,
  newDownloadFn
);

// 5. Replace "Download CSV" button with dropdown menu
const oldBtn = `                      <button
                        onClick={() => downloadStatement(transactions, accounts)}
                        className={\`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold \${cStyles.primaryBtnOutline}\`}
                      >
                        <Download className="w-4 h-4" /> Download CSV
                      </button>`;

const newBtn = `                      <div className="relative">
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className={\`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold \${cStyles.primaryBtnOutline}\`}
                        >
                          <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
                        </button>
                        {showExportMenu && (
                          <div className={\`absolute right-0 top-full mt-2 w-48 rounded-xl z-50 overflow-hidden \${cStyles.cardBg} \${cStyles.shadow}\`}>
                            {[
                              { label: 'CSV Spreadsheet', icon: '📊', format: 'csv' },
                              { label: 'JSON Data', icon: '🔧', format: 'json' },
                              { label: 'Text Report', icon: '📄', format: 'txt' },
                              { label: 'HTML Document', icon: '🌐', format: 'html' },
                            ].map(opt => (
                              <button
                                key={opt.format}
                                onClick={() => { downloadStatement(ledgerTransactions, accounts, opt.format); setShowExportMenu(false); }}
                                className={\`w-full text-left px-4 py-3 text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer\`}
                              >
                                <span>{opt.icon}</span> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>`;

code = code.replace(oldBtn, newBtn);

// 6. Add search bar above the filter dropdowns
const searchBar = `                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={ledgerSearch}
                      onChange={e => setLedgerSearch(e.target.value)}
                      className={\`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm \${cStyles.input}\`}
                    />
                  </div>

`;

code = code.replace(
  '                  <div className="flex flex-col md:flex-row gap-4 mb-6">',
  searchBar + '                  <div className="flex flex-col md:flex-row gap-4 mb-6">'
);

fs.writeFileSync('src/components/DashboardWeb.tsx', code);
console.log('Search + Multi-format export injected');
