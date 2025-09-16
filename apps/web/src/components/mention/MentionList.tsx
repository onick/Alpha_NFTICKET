'use client'

import React, { useEffect, useImperativeHandle, useState } from 'react'

interface MentionListProps {
  items: any[]
  command: (item: any) => void
  ref?: React.Ref<MentionListRef>
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const MentionList = React.forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command({ id: item.id, label: item.username })
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div className="bg-[#313338] border border-[#404249] rounded-lg shadow-lg max-h-48 overflow-y-auto">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-[#404249] transition-colors ${
                index === selectedIndex ? 'bg-[#404249]' : ''
              }`}
              onClick={() => selectItem(index)}
            >
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {item.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">{item.name}</div>
                <div className="text-gray-400 text-xs">@{item.username}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-gray-400 text-sm">No hay resultados</div>
        )}
      </div>
    )
  }
)

MentionList.displayName = 'MentionList'

export default MentionList