import { LogOut } from "lucide-react"
import { api } from "../../api/api"
import { useDispatch } from "react-redux"
import { logout } from "../../store/authSlice"
import { useNavigate } from "react-router"
import { useToast } from "../../hooks/use-toast"


function OrgLogoutBtn() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { toast } = useToast()
    const signOut = async() => {
        try {
            const response = await api.post('/organizations/logout')
            if(response.status === 200){
                dispatch(logout())
                toast({
                    title: "Logout Successful",
                    description: "You have successfully logged out.",
                    variant: "success",
                    duration: 3000
                })
                navigate('/organisation', {replace: true})
            }
        } catch (error: any) {
            toast({
                title: "Logout Failed",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
                duration: 2000
            })
        }
    }
    return (
        <button className="w-full flex items-center justify-center gap-2 text-red-600" onClick={signOut}>
            <span className="text-lg font-semibold">Logout</span>
            <LogOut className="w-5 h-5" />
        </button>
    )
}

export default OrgLogoutBtn