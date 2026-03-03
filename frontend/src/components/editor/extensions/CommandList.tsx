import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react'
import { Command } from 'lucide-react'

export const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    // Keep a live ref to selectedIndex so keyboard handlers always read current value
    const selectedIndexRef = useRef(selectedIndex)

    useEffect(() => {
        selectedIndexRef.current = selectedIndex
    }, [selectedIndex])

    const selectItem = useCallback((index: number) => {
        const item = props.items[index]
        if (item) {
            props.command(item)
        }
    }, [props])

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    // Expose keyboard handlers via ref — uses selectedIndexRef to avoid stale closures
    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex(i => (i + props.items.length - 1) % props.items.length)
                return true
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex(i => (i + 1) % props.items.length)
                return true
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndexRef.current)
                return true
            }
            return false
        },
    }), [props.items, selectItem])

    return (
        <div className="bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden min-w-[300px] p-1 text-sm animate-in fade-in zoom-in-95 duration-100">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 ${index === selectedIndex ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                        // Prevent focus leaving editor which can cause command to fail
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {item.icon ? (
                            <item.icon size={16} className="text-zinc-500" />
                        ) : (
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
