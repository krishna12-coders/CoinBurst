const fs = require('fs');
const path = 'c:/PROJECTS/CoinBurst/web-app/src/components/DashboardWeb.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/} from 'lucide-react';/, `} from 'lucide-react';\nimport { generateAIResponse } from '../utils/aiCommandEngine';`);

const aiStart = c.indexOf('// ── AI Command-Action Engine');
const aiEnd = c.indexOf('// ── Markdown-to-JSX Custom Renderer');
if (aiStart !== -1 && aiEnd !== -1) {
  c = c.slice(0, aiStart) + c.slice(aiEnd);
}

const hStart = c.indexOf('  const handleSendMessage = (textToSend?: string) => {');
const hEnd = c.indexOf('  // Local image file uploader');
if (hStart !== -1 && hEnd !== -1) {
  const newH = `  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    // Add user message
    const newHistory = [...chatHistory, { sender: 'user' as const, text: messageText }];
    setChatHistory(newHistory);
    if (!textToSend) setChatInput('');

    // Play send sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    // Trigger AI response
    setAiTyping(true);
    try {
      const result = await generateAIResponse(
        messageText,
        { accounts, transactions, budgets },
        currency,
        {
          addTransaction,
          deleteTransaction,
          addAccount,
          deleteAccount,
          addBudget,
          deleteBudget,
          setTheme,
          setCurrency,
          onNavigate,
        }
      );

      // Display the reply
      setChatHistory(prev => [...prev, { sender: 'ai' as const, text: result.text }]);
      
      // Execute the action (mutates store / navigates) after a tiny delay so reply renders first
      if (result.action) {
        setTimeout(result.action, 150);
      }

      // Play reply sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
        audio.volume = 0.35;
        audio.play().catch(() => {});
      } catch {}
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { sender: 'ai' as const, text: "⚠️ Error contacting AI Core." }]);
    } finally {
      setAiTyping(false);
    }
  };

`;
  c = c.slice(0, hStart) + newH + c.slice(hEnd);
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
