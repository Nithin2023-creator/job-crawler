import { CrawlerProvider } from './context/CrawlerContext';
import Dashboard from './pages/Dashboard';
import './styles/index.css';

function App() {
  return (
    <CrawlerProvider>
      <Dashboard />
    </CrawlerProvider>
  );
}

export default App;
