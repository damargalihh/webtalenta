'use client'

import { clsx } from 'clsx'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = ({ label, error, icon, className, ...props }: Props) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <input 
        className={clsx(
          'w-full px-4 py-2.5 border rounded-lg transition-all duration-200',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600',
          icon && 'pl-10',
          className
        )} 
        {...props} 
      />
    </div>
    {error && (
      <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
        <span className="text-red-500 dark:text-red-400">⚠</span>
        {error}
      </p>
    )}
  </div>
)