import React, { Component } from 'react';
import logo from './logo.svg';
import styled from 'styled-components'
import './App.css';
import usePortal from 'react-useportal'
console.log('USE PORTAL : ', usePortal)

const Box = styled.div`
  width: 100px;
  height: 100px;
  border: 2px solid blue;
`

const App = () => {
  const { Portal, togglePortal } = usePortal({
    renderBelowClickedElement: true
  })
  return (
    <div className="App">
      <header onClick={togglePortal} className="App-header">
        <Portal>
          <Box>
          HELLO WORLD

          </Box>
        </Portal>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          CLICK ME
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App;
