import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Diensten from './pages/Diensten.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Projecten from './pages/Projecten.jsx'
import OverOns from './pages/OverOns.jsx'
import Contact from './pages/Contact.jsx'
import Offerte from './pages/Offerte.jsx'
import Privacybeleid from './pages/Privacybeleid.jsx'
import AlgemeneVoorwaarden from './pages/AlgemeneVoorwaarden.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="diensten" element={<Diensten />} />
        <Route path="diensten/:slug" element={<ServiceDetail />} />
        <Route path="projecten" element={<Projecten />} />
        <Route path="over-ons" element={<OverOns />} />
        <Route path="contact" element={<Contact />} />
        <Route path="offerte" element={<Offerte />} />
        <Route path="privacybeleid" element={<Privacybeleid />} />
        <Route path="algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
