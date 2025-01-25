import { FaTh, FaUser } from "react-icons/fa"
import Button from "@/components/ui/Button"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { User } from "@/types/ApiTypes"
import Link from "next/link"

//bg-gradient-to-r from-emerald-200 to-teal-300
const hotBarBaseClasses = `
  fixed top-0
  h-14 px-4 py-2 w-full px-10
  flex items-center justify-between
  bg-black
  z-50
`

const actionButtonClasses = `
  relative
  flex flex-col items-center justify-center
  min-w-[64px] h-full
  text-white/90 hover:text-white
  transition-all duration-200
  hover:bg-white/10
  rounded-none
  group
  gap-0
`

const buttonIconClasses = "w-5 h-5 mb-1"
const buttonLabelClasses = "text-xs font-medium opacity-90"

interface NavBarProps {
  children?: React.ReactNode
}

export const NavBar: React.FC<NavBarProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    api.getCurrentUser().then((res) => {
      setUser(res.data)
      // console.log(res.data)
    }).catch((err) => {
      console.log(err) //not logged in
    })
  }, [])

  const handleLogout = async () => {
    await api.logout()
    setUser(null)
    setIsUserMenuOpen(false)
  }

  return (
    <>
      <div className={hotBarBaseClasses}>
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-xl font-bold text-white">NM</span>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={actionButtonClasses}
          >
            <FaTh className={buttonIconClasses} />
            <span className={buttonLabelClasses}>Меню</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={actionButtonClasses}
          >
            <FaUser className={buttonIconClasses} />
            <span className={`${buttonLabelClasses} truncate max-w-[80px]`}>
              {user?.nickname || 'Профиль'}
            </span>
          </Button>
        </div>
      </div>

      {/* User Menu */}
      {isUserMenuOpen && (
        <div className="fixed top-12 right-0 bg-white rounded-lg shadow-2xl p-2 m-2 min-w-[200px] z-50">
          <Link 
            href={user ? "/profile" : "/login?returnTo=/map"} 
            onClick={() => setIsUserMenuOpen(false)}
            className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100 rounded-lg"
          >
            {user ? "Открыть профиль" : "Войти"}
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-1 text-left text-sm text-red-600 hover:bg-gray-100 rounded-lg"
          >
              Выйти из аккаунта
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default NavBar