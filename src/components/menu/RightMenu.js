import { useState } from "react";
import Menu from "./Menu";
import TickersMenu from "./TickersMenu";
import NotificationsMenu from "./NotificationsMenu";
import OIMenu from "./OIMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCoins, faChartSimple } from "@fortawesome/free-solid-svg-icons";
import useCacheContext from "../context/Context";

const RightMenu = ({ onSettings }) => {

    const [activeMenu, setActiveMenu] = useState(Menu.tickers);
    const {isRightMenu} = useCacheContext();

    return (
        <>
            <div className='menu-container' style={{display: isRightMenu ? '' : 'none'}}>
                <div className='menu-title'>
                    <p>
                        {activeMenu == Menu.notifications ? 'уведомления' 
                        : activeMenu == Menu.tickers ? 'текущие монеты' 
                        : 'отрытый интерес'
                        }
                    </p>
                    <div className="menu-headers">
                        <button className={"menu-header" + (activeMenu == Menu.notifications ? ' active' : '')} onClick={() => setActiveMenu(Menu.notifications)}>
                            <FontAwesomeIcon icon={faBell} />
                        </button>
                        <button className={"menu-header" + (activeMenu == Menu.oi ? ' active' : '')} onClick={() => setActiveMenu(Menu.oi)}>
                            <FontAwesomeIcon icon={faChartSimple} />
                        </button>
                        <button className={"menu-header last" + (activeMenu == Menu.tickers ? ' active' : '')} onClick={() => setActiveMenu(Menu.tickers)}>
                            <FontAwesomeIcon icon={faCoins} />
                        </button>
                    </div>
                </div>
                <div className="menu-content-container menu-scroller">
                    {activeMenu === Menu.tickers &&
                        <TickersMenu onTickerSettings={onSettings} />
                    }
                    <NotificationsMenu activeMenu={activeMenu} />
                    <OIMenu activeMenu={activeMenu} />
                </div>
            </div>
        </>
    )
}

export default RightMenu;