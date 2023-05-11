import style from './App.module.scss'

import Header from '../Header/Header'
import Content from '../Content/Content.jsx'
import Footer from '../Footer/Footer.jsx'

import { useEffect, useState } from "react"
import { getCurrTab } from '../../utilities/chromeApiTools'

function App() {
  const [cntHeading, setCntHeading] = useState('')
  // const [navSelect, setNavSelect] = useState('block-site')
  const [navSelect, setNavSelect] = useState('focus-mode')
  // const [navSelect, setNavSelect] = useState('screen-time')
  // const [navSelect, setNavSelect] = useState('pomodoro')

  useEffect(()=>{
    const getNavSelect = async ()=>{
      
      // todo: check this query behaviour
      const {id: tabId} = await getCurrTab()
      
      // *Blocked Site
      const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
      if (tabId && blockedScreenData[tabId]) {
        setNavSelect('block-site')
        return null;
      }
      // *Blocked Site
      const {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')
      if (tabId && restrictedScreenData[tabId]) {
        setNavSelect('focus-mode')
        return null;
      }
      // *Screen time limit
      const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
      if (tabId && timeLimitScreenData[tabId]) {
        setNavSelect('screen-time')
        return null;
      }

      // * Default Nav select
      setNavSelect('block-site')


    }
    // !to debug
    // getNavSelect()

  }, [])

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



