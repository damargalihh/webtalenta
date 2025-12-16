'use client'

import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card = ({ children, className = '', hover = true }: CardProps) => (
  <div className={clsx(
    'bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 p-6 transition-all duration-300',
    hover && 'hover:shadow-xl dark:hover:shadow-gray-900/80 hover:-translate-y-1',
    className
  )}>
    {children}
  </div>
)