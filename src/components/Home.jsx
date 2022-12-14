import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import ScrollToBottom from 'react-scroll-to-bottom';
import { useNavigate } from 'react-router-dom'
import {AiOutlineSearch } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { FiLogOut, FiSend } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdArrowDropDown } from "react-icons/md";
import Picker from 'emoji-picker-react';
import ghost from '../assets/Ghost.gif'
import loader from '../assets/loader.gif'
import notification from '../assets/notification.mp3'

function Home() {
  const [data, setdata] = useState(null)
  const [searched, setsearched] = useState('')
  const [elem, setelem] = useState(null)
  const [messages, setmessages] = useState([])
  const [profile, setprofile] = useState(null)
  const [socket, setsocket] = useState(null)
  const [text, settext] = useState('')
  const [onl, setonl] = useState(null)
  const [emojipicker, setemojipicker] = useState(false)
  const [arrivalmessage, setarrivalmessage] = useState(null)
  const [notifications, setnotifications] = useState([])
  const [showmodal,setshowmodal]=useState(false)  
  const [shownotifications,setshownotifications]=useState(false)
  const [showlogout,setshowlogout]=useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setsocket(io('https://chatting-club.herokuapp.com', { upgrade:true}))
  }, [])

  useEffect(() => {

    socket?.on('connect', () => {
      console.log('connected successfully')
    })
  }, [socket])
  
useEffect(()=>{
  socket?.emit('adduser', profile?._id)
},[profile,socket])

  useEffect(() => {
    
    const getusers = async () => {
      if (!data) {
        const res = await axios.get('https://chatting-club.herokuapp.com/api/user/getallusers', { withCredentials: true })
        
        if (res.data.success === true) {
          setdata(res.data.message)
        }
        else { navigate('/login') }
      }
      
    }
    
    const getprofile = async () => {
      if (!profile) {
        
        const res = await axios.get('https://chatting-club.herokuapp.com/api/user/profile', { withCredentials: true })
        if (res.data.success === true) {
          setprofile(res.data.message)
          
        }
      }
    }
    getusers()
    getprofile()
  }, [data, profile, navigate,socket])
  
  useEffect(() => {
    const getmessages = async () => {
      const res = await axios.post(`https://chatting-club.herokuapp.com/api/user/getmessage`, { reciever: elem?._id })
      if (res.data.success === true) { setmessages(res.data.message) }
      
    }
    getmessages()
  }, [elem])
  
  useEffect(() => {
    if (elem && profile) {
      if (arrivalmessage !== null) {
        if (arrivalmessage.reciever === profile._id && arrivalmessage.sendername === elem.username) {
        if(messages!==null){setmessages((prev) =>{return  [...prev, arrivalmessage]})}
        }
        else if(!notifications.some((e,i)=>{return e.sendername===arrivalmessage.sendername}) && arrivalmessage.reciever === profile._id  &&  !arrivalmessage.sendername === elem.username) {
          setnotifications((prev) => { return ([...prev, arrivalmessage]) })
          const a = new Audio(notification)
          a.play()
        }
      }
    }
    else if(elem===null) {
      if(arrivalmessage !== null && arrivalmessage.reciever === profile._id ){
        if(!notifications.some((e,i)=>{return e.sendername===arrivalmessage.sendername})){
          setnotifications((prev) => { return ([...prev, arrivalmessage]) })
            const a = new Audio(notification)
            a.play()
        }
      }
    
    }
  }, [arrivalmessage, elem, profile])
  
  useEffect(() => {
    socket?.on('getmessage', (data) => {
      setarrivalmessage({
        sender: data.sender,
        text: data.text,
        reciever: data.reciever,
        sendername: data.sendername,
        createdAt: new Date(Date.now())
      })

    })

    socket?.on('getuser', (data) => {
      setonl(data)
    })
  })
  
  const submithandler = async (e) => {
    e.preventDefault()
    if (text === '') { return }
    
    const obj = {
      sender: profile._id,
      reciever: elem._id,
      text: text,
      sendername: profile.username,
      createdAt: new Date(Date.now())
    }

    socket.emit('sendmessage', obj)
    setmessages((prev) => {
      return (
        [...prev, obj]
      )
    })
    const res = await axios.post(`https://chatting-club.herokuapp.com/api/user/newmessage`, obj)
    if (res.status === 200) {
      settext('')
    }
  }
  
  const logouthandler = async () => {
    const res = await axios.post('https://chatting-club.herokuapp.com/api/user/logout', { Credential: true })
    if (res.data.success === true) {
      navigate('/login')
    }
  }
  const logouth=()=>{
  if(showlogout){
    setshowlogout(false)
    setshownotifications(false)
  }
  else{
    setshowlogout(true)
    setshownotifications(false)
  }
  }
  const notificationhandler=()=>{
    if(shownotifications){
      setshownotifications(false)
      setshowlogout(false)
    }
    else{
      setshownotifications(true)
      setshowlogout(false)
    }
  }
  const homehandler=()=>{
    setelem(null)
  }
  const getdate = (e) => {
    const d = new Date(e);
    const month = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const str = d.getDate() + ' ' + month[d.getMonth()] + ' ' + d.getFullYear();
    return str;
  }

  return (
    <>
      {data && profile && ghost ?
        <div className='cont'>
        {showmodal?  <div className="part-1">
            
            <div className='all-u'>
              <div className='search-u'>
                <div className='search'>
                  <AiOutlineSearch />
                </div>
                <input placeholder='search here for users' className='search-inp' value={searched} onChange={(e) => { setsearched(e.target.value) }} type='text' />
              </div>
              {
                data.filter((elem) => { return elem.username.includes(searched?.toLowerCase()) }).map((e, i) => {
                  return (
                    <div key={e._id} className='u' onClick={
                      () => {
                        setelem(e)
                        setmessages(null)
                        setshowmodal(false)

                        if (notifications.length !== 0) {
                            const arr = notifications.filter((eo,i) => { return !(eo.sendername === elem?.username) })
                            setnotifications(arr)
                        }
                      }


                    } >
                      <img src={e.profilePicture} alt='profile pic' className='u-i' />
                      <div className='u-n'>{e.username.toUpperCase()}</div>
                      <div className='online'>{onl?.some((elem) => { return elem.userid === e._id }) ? '.' : null}</div>
                    </div>)
                })
              }
            </div>
          </div>:null}
          <div className="part-2">
          <div className='users'>
              <div className='hed'>
                <div className='hamburger' onClick={()=>{showmodal?setshowmodal(false):setshowmodal(true)}}><div className="lines"></div>
                <div className="lines"></div>
                <div className="lines"></div></div>
              <div className='name' onClick={homehandler}>CHATTING CLUB</div>

              </div>
              <div className='log'>
           <div className='im'> <img  src={profile.profilePicture}  alt='profile pic' className='prf-pic' /><MdArrowDropDown className='image-arr' onClick={logouth} /></div>  
        {showlogout?   <div className='logout'>
          <div>{profile.username.toUpperCase()} <FiLogOut  className='logout-s'  onClick={logouthandler}/></div>
     </div>
          :null}
          {shownotifications?<div className='notifications'>
          {notifications.length===0?<h4 className='not-h'>NO NOTIFICATIONS FOUND</h4>:null}
            {notifications.length!==0 && notifications.map((e,i)=>{
              return(
                <div className='not-u' onClick={()=>{
                  setshownotifications(false)
                }}>NEW MESSAGES FROM {e.sendername.toUpperCase()}</div>
              )
            })}
          </div>:null}
                <div className='not' onClick={notificationhandler}><IoNotificationsOutline  /><div className='n-n'> {notifications.length !== 0 ? notifications.length : null}</div></div>
                
              </div>

            </div>
            {
              elem ?
                <div className='msg' >
                  <div className='user-name' >CHATTING WITH {elem.username.toUpperCase()}</div>
                  <ScrollToBottom className='messages'>{
                    messages? messages.map((e, i) => {
                      return (
                        <div className='mes-txt' key={i} >
                          <div className='msg-i' style={{ alignSelf: `${profile.username === e.sendername ? 'flex-end' : 'flex-start'}`, 'backgroundColor': `${profile.username === e.sendername ? '#8ca697' : '#9999b1'}` }}>
                            <div className='mas'>{e.text}</div>
                            <div className='d' >
                              <div className='date'> {getdate(e.createdAt)}</div>
                              <div className='sender'>{e.sendername.toUpperCase()}</div>
                            </div>
                          </div>
                        </div>
                      )
                    }) : <div className='l-msg'><img src={loader} alt='loader' className='load-m' /></div>
                  }</ScrollToBottom>
                  <div className='write-msg'>
                    <div className='emoj' onClick={() => { emojipicker ? setemojipicker(false) : setemojipicker(true) }} >
                      <BsEmojiSmile />
                      {emojipicker ? <Picker onEmojiClick={(e, y) => {
                        let txt = text;
                        txt = `${text}${y.emoji}`
                        settext(txt)
                      }} pickerStyle={{ 'position': 'fixed', 'bottom': '85px', 'left': '15px', 'width': '11em', 'height': '11em', 'boxShadow': 'none' }} /> : null}
                    </div>
                    <div className='inp-msg'>
                      <input type='text' value={text} onChange={(e) => { settext(e.target.value) }} placeholder='Type your message here ' className='send-inp' />
                    </div>
                    <div className='sub-msg' onClick={submithandler}>
                      <FiSend className='send-message' />
                    </div>
                  </div></div>
                : <div className='greet-msg'>
                  <img src={ghost} className='wel-i' alt='welcome pic' />
                  <div className='wel-t'>
                    <div className='w'>Welcome</div>
                    <div className='m'>Select a conversation to start chatting</div>
                  </div>
                </div>
            }
          </div>
        </div>
        : <div className='home'><img src={loader} alt='loader' className='load-h' /></div>}
    </>
  )
}

export default Home