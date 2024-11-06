import React  from 'react'
import "../App.css"
import { SlMenu } from "react-icons/sl";
import { GrClose } from "react-icons/gr";
import { Link } from "react-router-dom"
import { useState } from 'react'

export default function Landing() {
    const [showNavbar, setShowNavbar] = useState(false)
    return (
        <div className='main-container'>
            <nav>
                <div className="logo">
                    <h2>Apna Video Call</h2>
                </div>
                <div className="menu-icon" onClick={() => setShowNavbar(!showNavbar)} >
            {
              showNavbar ? (
                <GrClose />
              ) : (
                <SlMenu />
              )
            }
            {/* <SlMenu /> */}
          </div>
                <div className= {`menu  ${showNavbar && 'active'}`}>
                    <ul onClick={() => setShowNavbar(!showNavbar)}>
                        <li><Link to="/:url">Join as Guest</Link></li>
                        <li><Link to="/auth">Register</Link></li>
                        <li><Link to="/auth">Login</Link></li>
                        {/* <Link to="/auth"> <button> Login</button></Link> */}
                    </ul>
                </div>
            </nav>
            <div className="container">
                <div className="left">
                    <h1><span>Connect</span> with your loved ones</h1>
                    <p>Cover a distance by Apna Video Call</p>
                    <button className='btn'><Link to="/auth">Get Started</Link></button>
                </div>
                <div className="right">
                    <img src="/mobile.png" alt="" />
                </div>
            </div>
        </div>
    )
}


// navbar 

// export default function Landing() {
//     const [showNavbar, setShowNavbar] = useState(false)
  
//     return (
//       <nav className="navbar">
//         <div className="container-1">
//           <div className="logo">
//             <Link to='/'><img src={logo} alt="" /></Link>
//           </div>
//           <div className="menu-icon" onClick={() => setShowNavbar(!showNavbar)} >
//             {
//               showNavbar ? (
//                 <GrClose />
//               ) : (
//                 <SlMenu />
//               )
//             }
//             {/* <SlMenu /> */}
//           </div>
//           <div className={`nav-elements  ${showNavbar && 'active'}`}>
//             <ul onClick={() => setShowNavbar(!showNavbar)}>
//               <li>
//                 <NavLink to="/">Home</NavLink>
//               </li>
//               <li>
//                 <NavLink to="/about">About</NavLink>
//               </li>
//               <li>
//                 <NavLink to="/services">Services</NavLink>
//               </li>
//               <li>
//                 <NavLink to="/gallery">Gallery</NavLink>
//               </li>
//               <li>
//                 <NavLink to="/contact">Contact</NavLink>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
//     )
//   }
