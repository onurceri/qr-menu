import { useTranslation } from 'react-i18next';

interface RestaurantBasicInfoProps {
    name: string;
    description: string;
    onNameChange: (name: string) => void;
    onDescriptionChange: (description: string) => void;
    maxDescriptionLength?: number;
}

export function RestaurantBasicInfo({
    name,
    description,
    onNameChange,
    onDescriptionChange,
    maxDescriptionLength = 500
}: RestaurantBasicInfoProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-zinc-700">
                    {t('restaurants.name')}
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700">
                    {t('restaurants.description')}
                </label>
                <div className="relative">
                    <textarea
                        value={description}
                        onChange={e => {
                            const value = e.target.value;
                            if (value.length <= maxDescriptionLength) {
                                onDescriptionChange(value);
                            }
                        }}
                        maxLength={maxDescriptionLength}
                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 resize-none"
                        rows={3}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                        {description.length}/{maxDescriptionLength}
                    </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500 flex justify-between items-center">
                    <span>{t('restaurants.descriptionHint')}</span>
                    <span className={description.length > maxDescriptionLength * 0.9 ? 'text-amber-600' : ''}>
                        {t('common.charactersRemaining', { 
                            count: maxDescriptionLength - description.length 
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
