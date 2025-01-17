import React, { useContext, useState } from 'react'
import WithAuth from '../utils/WithAuth'
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
// import { AuthContext } from '../contexts/AuthContext';
import "../App.css"
import { AuthContext } from '../contexts/AuthContext';


function Home() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");


  const { addUserHistory } = useContext(AuthContext)
  let handleJoinVideoCall = async () => {
    await addUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
  }

  return (
    <>

      <div className="navBar">

        <div style={{ display: "flex", alignItems: "center" }}>

          <h2>Apna Video Call</h2>
        </div>

        <div>
          {/* <IconButton onClick={
            () => {
              navigate("/history")
            }
          }>
            <RestoreIcon />
          </IconButton>
          <p>History</p> */}

          <Button onClick={() => {
            localStorage.removeItem("token")
            navigate("/auth")
          }}
          style={{fontWeight:"600", color:"black"}}
          >
            Logout
          </Button>
        </div>


      </div>


      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education..</h2>

            <div style={{ display: 'flex', gap: "10px" }}>

              <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
              <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

            </div>
          </div>
        </div>
        <div className='rightPanel'>
          <img srcSet='/logo3.png' alt="" />
        </div>
      </div>
    </>
  )
}

export default WithAuth(Home);
