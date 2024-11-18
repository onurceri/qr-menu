import { useTranslation } from 'react-i18next';

interface FormData {
    name: string;
    description: string;
    address: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    };
    openingHours: string;
    imageUrl: string;
}

export const useFormValidation = (formData: FormData) => {
    const { t } = useTranslation();

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Restoran adı validasyonu
        if (!formData.name.trim()) {
            errors.name = t('validation.nameRequired');
        } else if (formData.name.length > 100) {
            errors.name = t('validation.nameTooLong');
        }

        // Açıklama validasyonu (opsiyonel alan)
        if (formData.description && formData.description.length > 500) {
            errors.description = t('validation.descriptionTooLong');
        }

        // Posta kodu validasyonu (opsiyonel)
        if (formData.address.postalCode && 
            formData.address.postalCode.trim() !== '' && 
            !/^\d{5}$/.test(formData.address.postalCode)) {
            errors.postalCode = t('validation.invalidPostalCode');
        }

        // Özel karakterleri kontrol et
        const invalidCharsRegex = /[<>{}]/g;
        if (invalidCharsRegex.test(formData.name) || invalidCharsRegex.test(formData.description)) {
            errors.invalidChars = t('validation.invalidCharacters');
        }

        return errors;
    };

    const validateField = (fieldName: keyof FormData, value: string) => {
        switch (fieldName) {
            case 'name':
                if (!value.trim()) return t('validation.nameRequired');
                if (value.length > 100) return t('validation.nameTooLong');
                break;
            case 'description':
                if (value.length > 500) return t('validation.descriptionTooLong');
                break;
            default:
                return null;
        }

        // Özel karakterleri kontrol et
        if (/[<>{}]/g.test(value)) {
            return t('validation.invalidCharacters');
        }

        return null;
    };

    return {
        validateForm,
        validateField
    };
}; 