// import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
// import store from './store'
import Main from './Main'

ReactDOM.render(
  // <Provider>
    <Main />,
//  </Provider>,
  document.getElementById('app')
)
