import { useSelector } from "react-redux"
import { RootState } from "../../store/store"
import PersonalDetails from "./PersonalDetails"
import { LatestsPosts } from "./LatestsPosts"

function Dashboard() {
    const name = useSelector((state: RootState) => state.auth.user?.name)

    return (
        <div className="container mx-auto px-4 py-10">
            <header className="mb-12">
                <h1 className="text-3xl lg:text-4xl text-center font-semibold">
                    Welcome back, <span className="text-primary">{name}</span>
                </h1>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:mx-4">
                <div className="lg:col-span-4">
                    <div className="sticky top-4">
                        <PersonalDetails />
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <LatestsPosts />
                </div>
            </div>
        </div>
    )
}

export default Dashboard