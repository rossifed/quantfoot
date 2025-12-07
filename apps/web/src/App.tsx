import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Home } from './components/pages/Home';
import { ClubsList } from './components/pages/ClubsList';
import { ClubDetail } from './components/pages/ClubDetail';
import { TeamsList } from './components/pages/TeamsList';
import { TeamDetail } from './components/pages/TeamDetail';
import { PlayerProfile } from './components/pages/PlayerProfile';
import { FixturesList } from './components/pages/FixturesList';
import { FixtureDetail } from './components/pages/FixtureDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clubs" element={<ClubsList />} />
          <Route path="/club/:id" element={<ClubDetail />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/fixtures" element={<FixturesList />} />
          <Route path="/fixture/:id" element={<FixtureDetail />} />
          <Route path="/player/:id" element={<PlayerProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
