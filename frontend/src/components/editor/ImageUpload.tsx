import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import ImageIcon from 'lucide-react/dist/esm/icons/image'
import Loader2 from 'lucide-react/dist/esm/icons/loader-2'
import X from 'lucide-react/dist/esm/icons/x'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsUploading(true)
        try {
            const url = await api.uploadImage(file)
            onChange(url)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Failed to upload image. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }, [onChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
            'image/svg+xml': ['.svg']
        },
        maxFiles: 1,
        multiple: false
    })

    if (value) {
        return (
            <div className={cn("relative group rounded-lg overflow-hidden border border-zinc-200 aspect-video w-full", className)}>
                <img
                    src={value}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onChange('')
                        }}
                        className="bg-white/10 hover:bg-red-500/90 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "cursor-pointer w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
                isDragActive ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50",
                isUploading ? "pointer-events-none opacity-50" : "",
                className
            )}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <>
                    <Loader2 className="animate-spin text-zinc-400" size={24} />
                    <span className="text-sm font-medium text-zinc-500">Uploading...</span>
                </>
            ) : (
                <>
                    <div className="p-3 bg-zinc-100 rounded-full">
                        <ImageIcon className="text-zinc-500" size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-900">
                            {isDragActive ? "Drop image here" : "Upload cover image"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Drag & drop or click to browse
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}
