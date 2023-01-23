import {FC} from 'react'
import "./TopBar.css"

const TopBar:FC = () => {
  return (
    <div id='top-bar-container'>
        <div id='top-bar-logo-container'>
            this is a sample logo
        </div>
        <div id='top-bar-contact-container'>
            Contact
        </div>
    </div>
  )
}

export {TopBar}