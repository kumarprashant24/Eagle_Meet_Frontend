import logo from './logo.svg';
import './App.css';
import Meeting from './Components/Meeting';
import Homepage from './Components/Homepage';
import Navbar from './Components/Navbar';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './Components/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {

  const [refresh, setRefresh] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null)

  useEffect(() => {
    console.log(process.env.REACT_APP_SERVER_URL);
    
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
          <Route path='/meeting/:uid' element={<Meeting user={user}></Meeting>} />
        
        </Routes>
      </>
      
        :
        <Routes>
          <Route path='/' element={<Login user={user}></Login>} />
          <Route path='*' element={<Login user={user}></Login>} />
        </Routes>
      }
  <ToastContainer theme="colored" />
    </BrowserRouter>

  );
}

export default App;
