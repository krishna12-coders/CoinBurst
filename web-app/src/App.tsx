import { useState, useEffect } from 'react';
import { DashboardWeb } from './components/DashboardWeb';
import { LandingPage } from './components/LandingPage';
import { AddTransactionWeb } from './components/AddTransactionWeb';
import { auth } from './shared/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useFinanceStore } from './shared/useFinanceStore';

function App() {
  const [activePage, setActivePage] = useState<'dashboard' | 'transactions' | 'budgets' | 'settings' | 'ai'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const setUser = useFinanceStore((state) => state.setUser);
  const user = useFinanceStore((state) => state.user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Wealth Builder',
          photoURL: firebaseUser.photoURL || undefined,
          selectedTheme: useFinanceStore.getState().theme,
        });
      } else {
        await setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Show a loading spinner while Firebase Auth resolves the session
  if (!authReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07050F]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px] animate-pulse">
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
              <span className="font-['Poppins'] font-black text-2xl text-white">CB</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Initializing Nexus...</p>
          </div>
        </div>
      </div>
    );
  }

  // Route based on auth state
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="w-full min-h-screen">
      <DashboardWeb
        activePage={activePage}
        onNavigate={setActivePage}
        onOpenForm={() => setIsFormOpen(true)}
      />
      <AddTransactionWeb
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}

export default App;
