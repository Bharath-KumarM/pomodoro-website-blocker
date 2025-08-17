import './WelcomeScreen.scss';
import extensionIcon from '../../assets/logo_3.png'

const WelcomeScreen = ()=>{
    

    return (
    <div className='welcome-scrn-cnt'>
        <div className="welcome-scrn-inner-cnt">
            <img 
                className='extention-icon'
                src={extensionIcon}
                alt="Extension Icon" 
            />

            <h1 className="main-heading">
                ✨Install Note from "Be Focused" browser extension
            </h1>

            <p className='para'>
                🖐🏼Welcome to "Be Focused" - the Chrome extension that helps you stay focused and productive 
                by blocking distracting websites, setting time limits, 
                and monitoring your screen time. 
                With "Be Focused", you can prioritize your work and make the most of your time online.
            </p>
            <p className='para'>
                Whether you're a student trying to avoid social media distractions during study time, 
                or a professional trying to meet a deadline, 
                "Be Focused" is the perfect tool to help you stay on track.
            </p>
            <p className='para'>
                With customizable settings, you can tailor "Be Focused" to your specific needs. 
                Maybe you need to block certain websites during work hours, or limit your time on social media to just 30 minutes a day. 
                Whatever your goals, "Be Focused" can help you achieve them.
            </p>
            <p className='para'>
                So why wait? Start using "Be Focused" today and 
                start seeing the difference it can make in your productivity!
            </p>

        </div>
    </div>
    )
}

export default WelcomeScreen



