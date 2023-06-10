import React from 'react'
import "./navbar.css"
import logo from '../components/imgs/logo.png'

function Navbar ({connectWallet, account}) {
    return(
        <nav>
            <img src={logo} alt="logo" className="logo" />
            {account?(
                <button className='connect-wallet'>{account.slice(0, 6) + ' ... ' + account.slice(38, 42)}</button>
            ):(
                <button className='connect-wallet' onClick={connectWallet}>Connect Wallet !</button>
            )}
        </nav>
    )
}

export default Navbar