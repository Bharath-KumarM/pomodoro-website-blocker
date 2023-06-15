import style from './App.module.scss'

import Header from '../Header/Header'
import Content from '../Content/Content.jsx'
import Footer from '../Footer/Footer.jsx'

import { useEffect, useState } from "react"
import { getCurrTab } from '../../utilities/chrome-tools/chromeApiTools'

 import { checkLocalBlockedScreenDataByTabId } from '../../localStorage/localBlockedScreenData';
 import { checkLocalRestrictedScreenDataByTabId } from '../../localStorage/localRestrictedScreenData';
 import { checkLocalTimeLimitScreenDataByTabId } from '../../localStorage/localTimeLimitScreenData';


function App() {
  // const [navSelect, setNavSelect] = useState('block-site')
  // const [navSelect, setNavSelect] = useState('focus-mode')
  // const [navSelect, setNavSelect] = useState('screen-time')
  const [navSelect, setNavSelect] = useState('')
  // const [navSelect, setNavSelect] = useState('pomodoro')

  useEffect(()=>{
    const getNavSelect = async ()=>{
      
      // todo: check this query behaviour
      const {id: tabId} = await getCurrTab()
      
      // *Blocked Site
      const isCurrTabBlocked = await checkLocalBlockedScreenDataByTabId(tabId)
      if (isCurrTabBlocked) {
        setNavSelect('block-site')
        return null;
      }
      // *Restricted Site
      const isCurrTabRestricted = await checkLocalRestrictedScreenDataByTabId(tabId)
      if (isCurrTabRestricted) {
        setNavSelect('focus-mode')
        return null;
      }
      // *Screen time limit
      const isCurrTabTimeLimited = await checkLocalTimeLimitScreenDataByTabId(tabId)
      if (isCurrTabTimeLimited) {
        setNavSelect('screen-time')
        return null;
      }

      // * Default Nav select
      setNavSelect('block-site')
    }

    getNavSelect()

  }, [])

  // !Debug starts
  // chrome.history.getVisits({
    //     url: "https://www.youtube.com/*"
    //   }, (details)=>{
      //       console.log(details.length, details.splice(-5))
      // })
  const todayStartMilli = new Date().setHours(0, 0, 0, 0)
  chrome.history.search({
    endTime: new Date().getTime(),
    startTime: todayStartMilli,
    text: ''
  }, (historyItem)=>{
    historyItem.sort((a, b)=>a.lastVisitTime-b.lastVisitTime)
    console.log({historyItem})
  })
  // !Debug ends

  return (
    <div className={style.App}> 
      <Header 
        setNavSelect={setNavSelect}
      />
      <Content 
        navSelect={navSelect}
        setNavSelect={setNavSelect}
      />
      <Footer />
    </div>
  )
}

export default App



