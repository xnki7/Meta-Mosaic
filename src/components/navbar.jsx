import React from 'react'
import "./navbar.css"
import logo from '../components/imgs/logo.png'

function Navbar ({connectWallet, account}) {
    return(
        <nav>
            <img src={logo} alt="logo" className="logo" />
            {account?(
                <button class="btn" type="button">
                    <strong>{account.slice(0, 6) + '...' + account.slice(38, 42)}</strong>
                    <div id="container-stars">
                        <div id="stars"></div>
                    </div>
                    <div id="glow">
                        <div class="circle"></div>
                        <div class="circle"></div>
                    </div>
                </button>
            ):(
                <button class="btn" type="button" onClick={connectWallet}>
                    <strong>Connect Wallet</strong>
                    <div id="container-stars">
                        <div id="stars"></div>
                    </div>
                    <div id="glow">
                        <div class="circle"></div>
                        <div class="circle"></div>
                    </div>
                </button>
            )}
        </nav>
    )
}

export default Navbar