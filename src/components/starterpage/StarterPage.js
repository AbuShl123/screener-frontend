import React, { useCallback, useEffect } from "react";
import "./StarterPage.css"
import { useLocation, useNavigate } from "react-router-dom";

const StarterPage = ({children}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = useCallback((page) => {
        if (location.pathname.includes(page)) return;
        navigate(page);
    }, [location.pathname]);

    return (
        <>
            <div className="frame-container">
                <div className="frame-element-up-right"/>
                <div className="frame-element-bottom-left"/>
                <div className="scrollable-content menu-scroller">
                    <header className="page-header">
                        <nav 
                            onClick={() => handleNavClick('/login')}
                            className={"header-navigation" + (location.pathname.includes('/login') ? ' force-hover' : '')}
                        >
                            вход
                            <span className="material-symbols-outlined nav-text-icon">
                                login
                            </span>
                        </nav>
                        <nav
                            onClick={() => handleNavClick('/subscribe')} 
                            className={"header-navigation" + (location.pathname.includes('/subscribe') ? ' force-hover' : '')}
                        >
                            цены
                            <span className="material-symbols-outlined nav-text-icon">
                                payments
                            </span>
                        </nav>
                        <nav 
                            onClick={() => handleNavClick('/signup')}
                            className={"header-navigation" + (location.pathname.includes('/signup') ? ' force-hover' : '')}
                        >
                            связаться с нами
                            <span className="material-symbols-outlined nav-text-icon">
                                call
                            </span>
                        </nav>
                    </header>
                    {children}
                </div>
            </div>
        </>
    )
}

export default StarterPage;