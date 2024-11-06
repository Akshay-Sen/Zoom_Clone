import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Landing from './pages/Landing'
import Authentication from './pages/Authentication'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import VideoMeet from './pages/VideoMeet'
import History from './pages/History'

function App() {

  return (
    <>
    <Router>

    <AuthProvider>

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/auth' element={<Authentication />} />
        <Route path='/home' element={<Home />} />
        {/* <Route path='/history' element={<History />} /> */}
        <Route path='/:url' element={<VideoMeet />} />
      </Routes>

      </AuthProvider>

    </Router>
    </>
  )
}

export default App
