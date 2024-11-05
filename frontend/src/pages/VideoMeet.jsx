import React, { useEffect, useRef, useState } from 'react'
import "../styles/videoMeet.scss"
import TextField from '@mui/material/TextField';
import { Button, IconButton } from '@mui/material';
import io from "socket.io-client"
import "../styles/videoMeet.scss"
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { Badge } from "@mui/material"
import server from '../envirolment';

const server_url = server;

let connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

export default function VideoMeet() {

  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvalaible] = useState(true);

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screenShare, setScreenShare] = useState();
  let [showModal, setShowModal] = useState(true);
  let [screenAvalaible, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(5);

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRef = useRef([])
  let [videos, setVideos] = useState([]);

  // Lobby connection permisiion and display 
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoPermission) {
        setVideoAvailable(true)
        console.log("Video permitted")
      } else {
        setVideoAvailable(false)
        console.log("Video not permitted")
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (audioPermission) {
        setAudioAvalaible(true)
        console.log("Audio permitted!")
      } else {
        setAudioAvalaible(false)
        console.log("Audio not permitted!")
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false)
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })

        if (userMediaStream) {
          window.localStream = userMediaStream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getPermissions();
    }
  }, [video, audio])

  const getUserMediaSuccess = (stream) => {
    console.log("here")
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { console.log(e) }

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) continue

      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        console.log(description)
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
          })
          .catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) { console.log(e) }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      for (let id in connections) {
        connections[id].addStream(window.localStream)

        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
            })
            .catch(e => console.log(e))
        })
      }
    })
  }



  // after connect controls 

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch(e => console.log(e))
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop())
      } catch (err) {
        console.log(err);
      }
    }
  }


  useEffect(() => {
    if (video !== undefined || audio !== undefined) {
      getUserMedia();
      console.log("fetch", video, audio)
    }
  }, [video, audio])

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1)
    }

  }


  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
              }).catch(e => console.log(e))
            }).catch(e => console.log(e))
          }
        }).catch(e => console.log(e))
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
    }
  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on('signal', gotMessageFromServer)

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href)
      socketIdRef.current = socketRef.current.id

      socketRef.current.on('chat-message', addMessage)

      socketRef.current.on('user-left', (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })

      socketRef.current.on('user-joined', (id, clients) => {
        clients.forEach((socketListId) => {

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
          // Wait for their ice candidate       
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true
              };

              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };


          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream)
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connections[socketListId].addStream(window.localStream)
          }
        })

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue

            try {
              connections[id2].addStream(window.localStream)
            } catch (e) { }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                })
                .catch(e => console.log(e))
            })
          }
        }
      })
    })
  }


  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
    connectToSocketServer();
  }

  let handleVideo = () => {
    setVideo(!video)
  }

  let handleAudio = () => {
    setAudio(!audio)
  }

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.log(err)
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => [
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          })
          .catch((err) => console.log(err))
      ])

    }

    stream.getTracks().forEach(track => track.onended = () => {
      setScreenShare(false)

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) { console.log(e) }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      getUserMedia()

    })

  }

  let getDisplayMedia = () => {
    if (screenShare) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: video, audio: audio })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch(e => console.log(e))
      }

    }

  }

  useEffect(() => {
    if (screenShare !== undefined) {
      getDisplayMedia();
    }
  }, [screenShare])

  let handleScreenShare = () => {
    setScreenShare(!screenShare)
  }

  let handleChatRoom = () => {
    setShowModal(!showModal)
  }

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("")
  }

  let handleEndCall = () =>{
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track)=>track.stop())
    } catch (err) {
      console.log(err)
    }
    window.location.href = "/home"
  }

  return (
    <div>
      {askForUsername === true ?
        <div>
          <h2>Enter Into Lobby {username} </h2>
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={connect} variant="contained">Connect</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>

        </div> :

        <div className='meetUserContainer'>

          {showModal ?
            <div className="chatRoom">
              <div className="chatContainer">
                <h1>Chat</h1>
                <div className="chattingDisplay">
                  {messages.map((item, index) => {
                    return (
                      <div style={{marginBottom:"20px"}} key={index}>
                        <p style={{fontWeight:"bold"}}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="chattingAre">
                  <TextField id="outlined-basic" value={message} onChange={(e) => setMessage(e.target.value)} label="Enter Your Chat" variant="outlined" />
                  <Button variant="contained" onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </div> : <></>}


          <div className='buttonContainer'>
            <IconButton onClick={handleVideo} >
              {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} >
              <CallEndIcon style={{ color: "red" }} />
            </IconButton>

            <IconButton onClick={handleAudio} >
              {(audio === true) ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton onClick={handleScreenShare} >
              {(screenShare === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton>

            <Badge badgeContent={newMessages} max={999} color='secondary'>
              <IconButton onClick={handleChatRoom} >
                <ChatIcon />
              </IconButton>
            </Badge>

          </div>

          <video className='meetUserVideo' ref={localVideoRef} autoPlay muted></video>

          <div className='conferenceView'>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={ref => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream
                    }
                  }}
                  autoPlay
                >
                </video>
              </div>
            ))}
          </div>


        </div>
      }

    </div>
  )
}

// Q what is video streaming ?
// Ans- video streaming is the process of delivering video content to a viewer over the internet, usually in real time. 