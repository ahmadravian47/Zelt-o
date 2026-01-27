import React from 'react'
import azure from './azure.png'
import css from './css.png'
import express from './Express.png'
import html from './html.png'
import mongo from './mongo.png'
import nodejs from './nodejs.png'
import react from './react.png'
import './Techstack.css'

export default function Techstack() {
    return (
        <div className='tech-parent'>
            <div className="logo_images">
                <div className="image">
                    <img src={react} ></img>
                </div>
                <div className="image">
                    <img src={nodejs} ></img>
                </div>
                <div className="image">
                    <img src={express} ></img>
                </div>
                <div className="image">
                    <img src={azure} ></img>
                </div>
                <div className="image">
                    <img src={css} ></img>
                </div>
                <div className="image">
                    <img src={html} ></img>
                </div>
                <div className="image">
                    <img src={mongo} ></img>
                </div>
            </div>
        </div>
    )
}