import logo from './logo.svg';
import './App.css';
import Meeting from './Components/Meeting';
import Homepage from './Components/Homepage';
import Navbar from './Components/Navbar';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './Components/Login';

function App() {

  const [refresh, setRefresh] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(false)

  useEffect(() => {
    fetchUser();
  }, [refresh]);

  const toggleRefresh = () => setRefresh((p) => !p);

  async function fetchUser() {

    await axios.get(`http://localhost:5000/api/auth/login/success`, { withCredentials: true }).then((res)=>{
      setIsSuccess(res.data.success);
      setUser(res.data.user)
   
    })
  
  }
  return (
    <BrowserRouter>
     
      {isSuccess ?
      <>
     
        <Routes>
          <Route path='/' element={<Homepage user={user}></Homepage>} />
          <Route path='/meeting/:uid' element={<Meeting></Meeting>} />
        </Routes>
      </>
      
        :
        <Routes>
          <Route path='/' element={<Login></Login>} />

        </Routes>
      }

    </BrowserRouter>

  );
}

export default App;
