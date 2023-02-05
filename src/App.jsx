import style from './App.module.scss'

import Header from './components/Header/Header'
import Content from './components/Content/Content.jsx'
import Footer from './components/Footer/Footer.jsx'

import { useState } from "react"

function App() {
  const [cntHeading, setCntHeading] = useState('')
  const [navSelect, setNavSelect] = useState('pomodoro')

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



