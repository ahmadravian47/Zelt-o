import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Banner from '../Banner/Banner'
import Techstack from '../Techstack/Techstack'
import Section1 from '../Section1/Section1'
import Section2 from '../Section2/Section2'
import Section3 from '../Section3/Section3'
import Footer from '../Footer/Footer'

export default function Home() {
  return (
    <div>
      <Banner></Banner>
      <Navbar></Navbar>
      <Hero></Hero>
      <Techstack></Techstack>
      <hr style={{ border: '0', height: '1px', backgroundColor: '#d1cdcd', color: '#d1cdcd', margin: '0', width: '80%', margin: '0 auto', marginTop: '3rem' }} />
      <Section1></Section1>
      <Section2></Section2>
      <hr style={{ border: '0', height: '1px', backgroundColor: '#d1cdcd', color: '#d1cdcd', margin: '0', width: '80%', margin: '0 auto', marginTop: '5rem', marginBottom:'3rem' }} />
      <Section3></Section3>
      <Footer></Footer>
    </div>
  )
}
