import './HelpScreen.scss';
import iconPinnedDemo from '../../../help_screen__draft_src/icon_pinned_demo.gif'
import popupScreenBlockBtn from '../../../help_screen__draft_src/block_section_popup_screen_button.gif'

const HelpScreen = ()=>{
    

    return (
        <div className='help-scrn-cnt'>
            <article className='help-scrn'>
                <h1>Help - Be focused </h1>
                <p>This page show you the features of "Be focused" extension.</p>
                <ul className='index unordered-list'>
                    <li>Option Icon</li>
                    <li>Block site section</li>
                    <li>Foucs Mode</li>
                    <li>Screen Time Limit</li>
                </ul>
                <h2>Where to find Option Icon?</h2>
                <img
                    className='icon-demo-gif' 
                    src={iconPinnedDemo} 
                    alt="Icon pinned demo"
                >
                </img>
                <p>
                    The extension icon might be hidden after installation. To display the icon, 
                    follow the above demo.
                </p>

                <h2>How to Block sites?</h2>
                <img
                    className='popup-screenblock-demo-gif' 
                    src={popupScreenBlockBtn} 
                    alt="Icon pinned demo"
                >
                </img>
                <p>
                    A site can be blocked in different ways.
                    Most common and stright-forward is demoed above. 
                    And unblocking is done using the same button but you may need to wait 
                    for 30 seconds. 
                </p>

                <h2>Focus mode</h2>
                <p>
                    Focus mode helps you to restrict distracting sites for a certain time period. Focus mode can be manually turned on or off.
                    You can schdule focus mode by configuring start and end as well.
                </p>
                <h2>Screen Time Limit</h2>
                <p>
                    Time limit helps to limit the daily usage of distracting sites.
                </p>
            </article>
        </div>
    )
}

export default HelpScreen



