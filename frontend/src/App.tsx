import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SportsPage from './pages/SportsPage';
import HousesPage from './pages/HousesPage';
import TeamsPage from './pages/TeamsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/houses" element={<HousesPage />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
