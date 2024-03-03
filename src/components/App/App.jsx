import style from './App.module.scss'

import Header from '../Header/Header'
import Content from '../Content/Content.jsx'
import Footer from '../Footer/Footer.jsx'

import { useEffect, useState } from "react"
import { getCurrTab } from '../../utilities/chrome-tools/chromeApiTools'

 import { checkLocalBlockedScreenDataByTabId } from '../../localStorage/localBlockedScreenData';
 import { checkLocalRestrictedScreenDataByTabId } from '../../localStorage/localRestrictedScreenData';
 import { checkLocalTimeLimitScreenDataByTabId } from '../../localStorage/localTimeLimitScreenData';
import { BodyClickContext } from '../context'


function App() {

  const [navSelect, setNavSelect] = useState('') // '' || 'block-site' || 'focus-mode' || 'screen-time' || 'setting'
  const [bodyClickCount, setBodyClickCount] = useState(0)

  useEffect(()=>{
    const getNavSelect = async ()=>{
      
      // todo: check this query behaviour
      const {id: tabId} = await getCurrTab()

      if (!tabId){
        setNavSelect('block-site')
      }
      
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
      setNavSelect('screen-time')
      // getNavSelect()
    }

  }, [])


  return (
    <BodyClickContext.Provider value={bodyClickCount}>
      <div className={style.App}
        onClick={()=>{
          setBodyClickCount(b=>b+1)
        }}
      > 
        <Header 
          setNavSelect={setNavSelect}
        />
        <Content 
          navSelect={navSelect}
          setNavSelect={setNavSelect}
        />
        <Footer />
      </div>
    </BodyClickContext.Provider>
  )
}

export default App



