import { useEffect, useState } from "react"

import { FaTh, FaUser } from "react-icons/fa"
import Button from "@/components/ui/Button"
import { Dropdown } from "@/components/ui/Dropdown"
import { useUser } from "@/lib/user_context"
import Link from "next/link"

//bg-linear-to-r from-emerald-200 to-teal-300
const hotBarBaseClasses = `
  fixed top-0
  h-14 px-4 py-2 w-full px-2
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

const buttonIconClasses = "w-4 h-4"
const buttonLabelClasses = "text-xs font-medium opacity-90"

interface NavBarProps {
  children?: React.ReactNode
}

export const NavBar: React.FC<NavBarProps> = ({ children }) => {
  const { user, logout } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <>
      <div className={hotBarBaseClasses}>
        {/* Logo */}
        <div className="flex items-center pl-2">
          <Link href="/" className="text-xl font-bold text-white hover:scale-105 transition-all duration-300 hover:text-blue-300">NewsMap</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          <Dropdown placeholder={user?.nickname || '...'} 
              className="border-2 border-gray-700 bg-black rounded-full text-white hover:bg-gray-800"
              childrenClassName="right-0 w-fit"
              showIcon={false}
              isOpened={isUserMenuOpen}
              setIsOpened={setIsUserMenuOpen}
              selfContent={
                <span className="flex items-center gap-2">
                  <FaUser className={buttonIconClasses} />
                  <span className={buttonLabelClasses}>
                    {user?.nickname || 'Аккаунт'}
                  </span>
                </span>
              }
          >

            {/* Кнопка зарегистрироваться */}
            {!user && (
                <Link 
                href={"/register"} 
                onClick={() => setIsUserMenuOpen(false)}
                className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100 rounded-lg"
              >
                Регистрация
              </Link>
            )}

            {/* Кнопка войти */}
            {!user && (
              <Link 
                href={"/profile"} 
                onClick={() => setIsUserMenuOpen(false)}
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100 rounded-lg"
              >
                Войти
              </Link>
            )}

            {/* Кнопка выйти */}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-nowrap px-4 py-1 text-left text-sm text-red-600 hover:bg-gray-100 rounded-lg"
              >
                Выйти из аккаунта
              </button>
            )}
          </Dropdown>
        </div>
      </div>
    </>
  )
}

export default NavBar