import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { siteSettingsQueryOptions, useSiteSettings } from '@/features/settings/useSiteSettings'
import { Switch } from '@/shared/ui/Switch'

/** Site-wide covers on/off, independent of each post's own switch. */
export function CoversSwitch() {
    const queryClient = useQueryClient()
    const { data: settings } = useSiteSettings()
    const update = useMutation({
        mutationFn: api.updateSettings,
        onSuccess: (next) => queryClient.setQueryData(siteSettingsQueryOptions.queryKey, next),
        onError: () => toast.error('Could not change the setting'),
    })

    return (
        <div className="flex items-center justify-between gap-6 border border-rule bg-card px-6 py-4">
            <div>
                <p className="text-sm font-medium text-ink">Newspaper covers on the site</p>
                <p className="mt-0.5 font-mono text-xs text-soft">Hides every cover without changing posts.</p>
            </div>
            <Switch
                checked={settings?.covers_enabled ?? false}
                onChange={(covers_enabled) => update.mutate({ covers_enabled })}
                label="Newspaper covers on the site"
                disabled={!settings || update.isPending}
            />
        </div>
    )
}
