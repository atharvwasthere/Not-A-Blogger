import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Command } from 'lucide-react'

export const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = useCallback((index) => {
        const item = props.items[index]
        if (item) {
            props.command(item)
        }
    }, [props])

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
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

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    return (
        <div className="bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden min-w-[300px] p-1 text-sm animate-in fade-in zoom-in-95 duration-100">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 ${index === selectedIndex ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.icon ? (
                            <item.icon size={16} className="text-zinc-500" />
                        ) : (
                            // Fallback icon
                            <Command size={16} className="text-zinc-500" />
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            {item.description && <span className="text-xs text-zinc-400">{item.description}</span>}
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-2 py-2 text-zinc-400">No result</div>
            )}
        </div>
    )
})

CommandList.displayName = 'CommandList'
