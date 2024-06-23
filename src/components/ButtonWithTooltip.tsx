import React, { FC } from 'react'

interface TooltipButtonProps {
  icon: React.ReactNode
  onClick: () => void
  ariaLabel: string
  tooltipText: string
  isDisabled: boolean
  tooltipDisabledText: string
}

const ButtonWithTooltip: FC<TooltipButtonProps> = ({
  icon,
  onClick,
  ariaLabel,
  tooltipText,
  isDisabled,
  tooltipDisabledText
}) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex items-center justify-center font-bold  rounded cursor-pointer disabled:cursor-not-allowed"
        aria-label={ariaLabel}
        disabled={isDisabled}
      >
        {icon}
      </button>
      <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 hidden group-hover:block bg-gray-100 text-black text-xs rounded py-1 px-5 whitespace-nowrap">
        {isDisabled ? tooltipDisabledText : tooltipText}
      </span>
    </div>
  )
}

export default ButtonWithTooltip
