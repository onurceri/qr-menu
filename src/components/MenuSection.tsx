import type { MenuSection as MenuSectionType } from '../types/restaurant';
import type { CurrencyCode } from '@shared/constants/currencies';
import { formatPrice } from '@shared/constants/currencies';

interface MenuSectionProps {
    section: MenuSectionType;
    currency: CurrencyCode;
}

export function MenuSection({ section, currency }: MenuSectionProps) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                {section.title}
            </h2>
            <div className="space-y-4">
                {section.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-4">
                                <h3 className="text-base font-medium text-zinc-900 truncate">
                                    {item.name}
                                </h3>
                                <span className="text-sm font-medium text-zinc-900 shrink-0">
                                    {formatPrice(item.price, currency)}
                                </span>
                            </div>
                            {item.description && (
                                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}