import logo from './logo.svg';
import './App.css';
import Meeting from './Components/Meeting';
import Homepage from './Components/Homepage';
import Navbar from './Components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    // <Meeting></Meeting>
    <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path='/' element={<Homepage></Homepage>}/>
          <Route path='/meeting/:uid' element={<Meeting></Meeting>}/>
        </Routes>
    </BrowserRouter>

  );
}

export default App;
