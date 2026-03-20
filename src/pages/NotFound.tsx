import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-display font-bold sol-gradient-text mb-4">404</h1>
      <p className="text-muted-foreground text-sm mb-6">This page doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 sol-gradient-bg text-primary-foreground rounded-lg font-display text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to Home
      </button>
    </div>
  );
}
