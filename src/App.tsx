import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { parse } from "liqe"

function App() {
  const [query, setQuery] = useState("")
  const [ast, setAst] = useState(null)
  const [error, setError] = useState(null)
  const inputField = useRef(null)

  const onInput = () => {
    setQuery(() => inputField.current.value)
  }
  useEffect(() => {
    try {

      setAst(parse(query))
      setError(undefined)

    } catch (e) {
      console.log(`🚀 // DEBUG 🍔 ----------------------------------------🚀 // DEBUG 🍔`)
      console.log(`🚀 // DEBUG 🍔 ~ file: App.tsx:23 ~ e:`, e)
      console.log(`🚀 // DEBUG 🍔 ----------------------------------------🚀 // DEBUG 🍔`)
      setAst(undefined)
      setError(e)
    }
  }, [query])
  return (
    <>
      <input ref={inputField} onInput={onInput} />
      <div>{JSON.stringify(ast, null, 2)}</div>
      <div>{JSON.stringify(error, null, 2)}</div>
    </>
  )
}

export default App
