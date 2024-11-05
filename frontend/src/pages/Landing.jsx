import React from 'react'
import "../app.scss"
import { Link } from "react-router-dom"

export default function Landing() {
    return (
        <div className='main-container'>
            <nav>
                <div className="logo">
                    <h2>Apna Video Call</h2>
                </div>
                <div className="menu">
                    <ul>
                        <li><Link to="/:url">Join as Guest</Link></li>
                        <li><Link to="/auth">Register</Link></li>
                        <Link to="/auth"> <button> Login</button></Link>
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
