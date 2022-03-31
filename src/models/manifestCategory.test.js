import ManifestCategory from "./manifestCategory";

describe('ManifestCategory', () => {
    const manifestName = 'test-cookie';

    test('Get category name', () => {
        const manifestCategory = new ManifestCategory(manifestName, true);
        expect(manifestCategory.getName()).toBe(manifestName);
    });

    describe('Get category optional status', () => {
        test('Get category is optional', () => {
            const manifestCategory = new ManifestCategory(manifestName, true);
            expect(manifestCategory.isOptional()).toBe(true);
        })

        test('Get category is essential', () => {
            const manifestCategory = new ManifestCategory(manifestName, false);
            expect(manifestCategory.isOptional()).toBe(false);
        })

        test('Get category is optional by default', () => {
            const manifestCategory = new ManifestCategory(manifestName);
            expect(manifestCategory.isOptional()).toBe(true);
        })
    })
})