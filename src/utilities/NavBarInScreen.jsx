import extensionIcon from '../assets/logo_3.png'


const style = {
    NavBar: {
        "alignSelf":"flex-start",
        "position":"fixed",
        "top":"0px",
        "width":"100%",
        "display":"flex",
        "justifyContent":"center",
        "alignItems":"center",
        "backgroundColor":"#2f2f2f"
    },

    img: {
        "width":"30px",
        "height":"30px",
        "alignSelf":"center",
        "margin":"10px"
    }

}

export const NavBarInScreen = ()=>{
    return (
        <div style={style.NavBar}>
            <img 
                style={style.img}
                src={extensionIcon}
                alt="Extension Icon" 
            />
            <h1>
                Be focused
            </h1>
        </div>
    )
}