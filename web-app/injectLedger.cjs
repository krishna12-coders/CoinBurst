const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardWeb.tsx', 'utf8');

// 1. Inject state
const stateInjection = `
  // Ledger Filters
  const [ledgerFilterType, setLedgerFilterType] = useState('all');
  const [ledgerFilterCategory, setLedgerFilterCategory] = useState('all');
  const [ledgerSortBy, setLedgerSortBy] = useState('date-newest');
`;
code = code.replace(/  \/\/ Mobile sidebar drawer state/, stateInjection + '\n  // Mobile sidebar drawer state');

// 2. Inject computed transactions
const computedInjection = `
  const ledgerTransactions = transactions
    .filter(t => ledgerFilterType === 'all' ? true : t.type === ledgerFilterType)
    .filter(t => ledgerFilterCategory === 'all' ? true : t.category === ledgerFilterCategory)
    .sort((a, b) => {
      if (ledgerSortBy === 'date-newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (ledgerSortBy === 'date-oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (ledgerSortBy === 'amount-high') return b.amount - a.amount;
      if (ledgerSortBy === 'amount-low') return a.amount - b.amount;
      return 0;
    });

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
`;
code = code.replace(/  const totalBalance = accounts.reduce/, computedInjection + '\n  const totalBalance = accounts.reduce');

// 3. Inject Filter UI and use ledgerTransactions
const uiReplacement = `
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <select value={ledgerFilterType} onChange={e => setLedgerFilterType(e.target.value)} className={\`p-2 rounded-xl text-sm \${cStyles.input}\`}>
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <select value={ledgerFilterCategory} onChange={e => setLedgerFilterCategory(e.target.value)} className={\`p-2 rounded-xl text-sm \${cStyles.input}\`}>
                      <option value="all">All Categories</option>
                      {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={ledgerSortBy} onChange={e => setLedgerSortBy(e.target.value)} className={\`p-2 rounded-xl text-sm \${cStyles.input}\`}>
                      <option value="date-newest">Date: Newest</option>
                      <option value="date-oldest">Date: Oldest</option>
                      <option value="amount-high">Amount: High to Low</option>
                      <option value="amount-low">Amount: Low to High</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {ledgerTransactions.map((tx) => {`;

code = code.replace(/                  <div className="space-y-3">\s*\{transactions\.map\(\(tx\) => \{/, uiReplacement);

fs.writeFileSync('src/components/DashboardWeb.tsx', code);
console.log('Ledger filters injected');
