import useCacheContext from "../context/Context";

const MenuOpener = () => {

    const { isRightMenu, setIsRightMenu } = useCacheContext();

    return (
        <button className='toggle-icon header-item tooltip-container' style={{ color: "white", }} onClick={() => setIsRightMenu(prev => !prev)}>
            {isRightMenu ? (
                <>
                    <span className="material-symbols-outlined menu-arrow-icon" style={{ fontSize: '22px' }}>
                        arrow_menu_open
                    </span>
                    <span className='simple-tooltip-lefty'> закрыть правое меню </span>
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined menu-arrow-icon" style={{ fontSize: '22px' }}>
                        arrow_menu_close
                    </span>
                    <span className='simple-tooltip-lefty'> открыть правое меню </span>
                </>
            )}
        </button>
    )
}

export default MenuOpener;