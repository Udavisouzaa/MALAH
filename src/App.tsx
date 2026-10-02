import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <div className="bg-bg-darker min-h-screen text-gray-100 selection:bg-brand-purple/30 selection:text-white">
      <LandingPage onStart={() => {}} />
    </div>
  );
}
