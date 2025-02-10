import Logoutbtn from "@/components/Logoutbtn"
import { RootState } from "@/store/store"
import { useSelector } from "react-redux"

function Home() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

    return (
      <div>
        {isAuthenticated ? <Logoutbtn /> : <p>You are not logged in</p>}
      </div>
    )
  }
  
  export default Home