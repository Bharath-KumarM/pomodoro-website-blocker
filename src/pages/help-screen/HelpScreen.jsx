import './HelpScreen.scss';
import extensionIcon from '../../../logo_3.png'
import iconPinnedDemo from '../../../help_screen__draft_src/icon_pinned_demo.gif'
// import popupScreenBlockBtn from '../../../help_screen__draft_src/block_section_popup_screen_button.gif'

const HelpScreen = ()=>{
    

    return (
        <div className='help-scrn-cnt'>
            <article className='help-scrn'>
                <h1>Help - Be focused </h1>
                <p>This page show you the features of "Be focused" extension.</p>
                <ul className='index unordered-list'>
                    <li>Option icon</li>
                    <li>Block site section</li>
                    <li>Foucs Mode section</li>
                    <li>Screen Time section</li>
                </ul>
                <h2>Option Icon</h2>
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

                <h2>Block site section</h2>
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
                    for 30seconds. 
                </p>

                <h2>Focus mode section</h2>
                <p>

                </p>
            </article>
        </div>
    )
}

export default HelpScreen



