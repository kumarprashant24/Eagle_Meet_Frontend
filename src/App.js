import './App.css';
import Meeting from './Components/Meeting';
import Homepage from './Components/Homepage';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './Components/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {SERVER_URL} from './config';
function App() {

  const [refresh, setRefresh] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null)

  useEffect(() => {
    console.log(SERVER_URL);
    fetchUser();
  }, [refresh]);

  const toggleRefresh = () => setRefresh((p) => !p);

  async function fetchUser() {

    await axios.get(`${SERVER_URL}/api/auth/login/success`, { withCredentials: true }).then((res)=>{
      console.log(res.data);
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
