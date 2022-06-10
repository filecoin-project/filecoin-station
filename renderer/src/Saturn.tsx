import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Switch from 'react-switch'

export default function Saturn () {
  const [isOn, setIsOn] = useState(true)

  const updateStatus = () => isSaturnNodeOn().then(setIsOn)

  useEffect(() => {
    updateStatus()
    const id = setInterval(updateStatus, 1000)

    return () => clearInterval(id)
  }, [])

  async function handleClick () {
    await toggleSaturnNode(!isOn)
    updateStatus()
  }

  const textStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    fontSize: 16,
  }

  return (
    <div>
      <div className='logo'>🪐</div>
      <h2>Welcome to Saturn</h2>
      <p><Link to='/'>Station &gt;&gt;</Link></p>
      <label>
        <Switch
          onChange={handleClick}
          checked={isOn}
          width={62}
          activeBoxShadow="0px 0px 1px 2px #fffc35"
          onColor='#15cd72'
          checkedIcon={
            <div style={textStyle}>On</div>
          }
          uncheckedIcon={
            <div style={textStyle}>Off</div>
          }
        />
      </label>
    </div>
  )
}

async function isSaturnNodeOn () {
  return window.electron.isSaturnNodeOn()
}

async function toggleSaturnNode (turnOn: boolean) {
  if (turnOn) {
    await window.electron.startSaturnNode()
  } else {
    await window.electron.stopSaturnNode()
  }
}