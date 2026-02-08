import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Hero.css'
import hero_img from './hero-img.png'

export default function Hero() {
    const navigate = useNavigate();

    return (
        <div className='hero-container'>
            <h1 className='hero-h1'>
                Stop answering same <br className='h-sep' />
                questions every day
            </h1>
            <p className='hero-p'>
                Let your website chatbot handle repetitive queries 24/7 using your business info, <br className='p-sep' />
                so you can focus on running your business.
            </p>
            <div className="hero-buttons">
                <Link className='primary-button' to='/signup'>Get a Demo</Link>
                <Link className='secondary-button' to='/login'>Create My ChatBot</Link>
            </div>
            <div className="hero-img">
                <img src={hero_img} alt="" />

            </div>
        </div>
    )
}
