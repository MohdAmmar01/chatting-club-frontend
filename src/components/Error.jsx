import React from 'react'
import { useNavigate } from 'react-router-dom'

function Error() {
   const navigate=useNavigate()
  return (
    <>
      <div className='error'>
        <div className='err-msg'>OOPS, PAGE NOT FOUND ! !</div>
        <div className='redirect' onClick={()=>{navigate('/')}}>Back to home</div>
        </div>

    </>
  )
}

export default Error