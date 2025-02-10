import { LogOut } from "lucide-react"
import { api } from "../api/api"
import { useDispatch } from "react-redux"
import { logout } from "../store/authSlice"
import { useNavigate } from "react-router"
import { useToast } from "../hooks/use-toast"


function Logoutbtn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast } = useToast()
    const signOut = async() => {
        try {
            const response = await api.post('/users/logout')
            dispatch(logout())
            if(response.status === 200){
                toast({
                    title: "Logout Successful",
                    description: "You have successfully logged out.",
                    variant: "success",
                    duration: 3000
                })
            }
            navigate('/', {replace: true})
        } catch (error: any) {
            dispatch(logout())
            toast({
                title: "Something went wrong",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
                duration: 2000
            })
        }
    }
    return (
        <button className="w-full flex items-center justify-center gap-2 text-red-600 text-lg" onClick={signOut}>
            <span>Logout</span>
            <LogOut className="w-5 h-5" />
        </button>
    )
}

export default Logoutbtn