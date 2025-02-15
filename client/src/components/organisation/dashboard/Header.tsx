import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { Link } from "react-router"
import { Button } from "../../ui/button"
import { Plus } from "lucide-react"

function Header() {
    const orgName = useSelector((state: RootState) => state.auth.organization?.name)
    return (
        <div className="bg-light-bg dark:bg-dark-bg dark:text-dark-text py-8 px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Welcome, {orgName}
            </h1>
            <Link to="create">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Post
                </Button>
            </Link>
        </div>
    )
}

export default Header
