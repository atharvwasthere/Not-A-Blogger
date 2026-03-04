import Image from '@tiptap/extension-image'

export const LazyImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(), // keep src, alt, title
            loading: {
                default: 'lazy',
                renderHTML: (attrs) => ({ loading: attrs.loading }),
            },
            decoding: {
                default: 'async',
                renderHTML: (attrs) => ({ decoding: attrs.decoding }),
            },
        }
    },
})
