import style from './App.module.scss'

import Header from '../Header/Header'
import Content from '../Content/Content.jsx'
import Footer from '../Footer/Footer.jsx'

import { useState } from "react"

function App() {
  const [cntHeading, setCntHeading] = useState('')
  // const [navSelect, setNavSelect] = useState('block-site')
  const [navSelect, setNavSelect] = useState('focus-mode')
  // const [navSelect, setNavSelect] = useState('screen-time')
  // const [navSelect, setNavSelect] = useState('pomodoro')

  return (
    <div className={style.App}> 
      <Header 
        cntHeading={cntHeading}
        setCntHeading={setCntHeading}
        setNavSelect={setNavSelect}
      />
      <Content 
        cntHeading={cntHeading}
        setCntHeading={setCntHeading}
        navSelect={navSelect}
        setNavSelect={setNavSelect}
      />
      <Footer />
    </div>
  )
}

export default App



