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
  // const [navSelect, setNavSelect] = useState('setting')
  const [navSelect, setNavSelect] = useState('')
  // const [navSelect, setNavSelect] = useState('pomodoro')

  // !Debug Starts
  // !Debug Ends

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
    if (navSelect === ''){
      getNavSelect()
    }

  }, [])


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



