import React from 'react'
import { useState } from 'react'

const Counter = () => {


    const [count, setCount] = useState(0)

    const incrementHandler = () => {(setCount(count + 1))}


  return (
    <div>

<h1>{count}</h1>

<button onClick={incrementHandler}>increment</button>
    </div>
  )
}

export default Counter