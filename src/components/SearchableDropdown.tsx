import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchableDropdownProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (query: string) => Promise<any[]>;
    placeholder: string;
    label: string;
    minSearchLength?: number;
}

export function SearchableDropdown({
    value,
    onChange,
    onSearch,
    placeholder,
    label,
    minSearchLength = 3
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.length < minSearchLength) {
                setOptions([]);
                return;
            }
            
            setLoading(true);
            try {
                const results = await onSearch(searchTerm);
                setOptions(results);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, onSearch, minSearchLength]);

    const handleClear = () => {
        onChange('');
        setSearchTerm('');
        setOptions([]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 pr-20"
                    value={searchTerm || value}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        if (value && value.length >= minSearchLength) {
                            onSearch(value);
                        }
                    }}
                    placeholder={placeholder}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {(value || searchTerm) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-zinc-100 rounded-full mr-1"
                            title={t('common.clear')}
                        >
                            <X className="h-4 w-4 text-zinc-500" />
                        </button>
                    )}
                    <Search className="h-4 w-4 text-zinc-500" />
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border 
                            border-zinc-200 max-h-60 overflow-auto">
                    {loading ? (
                        <div className="p-2 text-center text-zinc-500">
                            {t('common.loading')}
                        </div>
                    ) : options.length > 0 ? (
                        options.map((option, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-zinc-50 cursor-pointer"
                                onClick={() => {
                                    onChange(option.name);
                                    setSearchTerm('');
                                    setIsOpen(false);
                                }}
                            >
                                {option.name}
                            </div>
                        ))
                    ) : searchTerm.length >= minSearchLength ? (
                        <div className="p-2 text-center text-zinc-500">
                            {t('common.noResults')}
                        </div>
                    ) : searchTerm.length > 0 ? (
                        <div className="p-2 text-center text-zinc-500">
                            {t('common.enterMinChars', { count: minSearchLength })}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
} 