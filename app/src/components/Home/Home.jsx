import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Banner from '../Banner/Banner'
import Techstack from '../Techstack/Techstack'
import Section1 from '../Section1/Section1'
import Section2 from '../Section2/Section2'
import Section3 from '../Section3/Section3'
import Footer from '../Footer/Footer'
import './Home.css'

export default function Home() {
  return (
    <div>
      <Banner></Banner>
      <Navbar></Navbar>
      <Hero></Hero>
      <Techstack></Techstack>
      <hr className='hr-line'  />
      <Section1></Section1>
      <Section2></Section2>
      <hr className='hr-line hr-line2'/>
      <Section3></Section3>
      <Footer></Footer>
    </div>
  )
}
