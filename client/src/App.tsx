import { Outlet } from 'react-router'
import './App.css'

function App() {

  return (
    <div className='pt-16 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text min-h-screen'>
      <Outlet />
    </div>
  )
}

export default App
