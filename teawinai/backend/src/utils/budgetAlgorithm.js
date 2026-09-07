/**
 * Budget Algorithm for selecting places based on budget and preferences.
 * Prioritizes category coverage first, then fills remaining slots by value.
 */

function getCategoryName(place) {
    return place?.category?.name || place?.category || '';
}

function normalizeCategory(category) {
    return String(category || '').trim().toLowerCase();
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getPlaceIdentity(place) {
    const name = normalizeText(place?.name);
    const mapLink = normalizeText(place?.map_link);
    const address = normalizeText(place?.address);
    const location = [place?.province, place?.district, place?.subdistrict]
        .map(normalizeText)
        .filter(Boolean)
        .join('|');

    if (name || mapLink || address || location) {
        return [name, mapLink, address, location].join('|');
    }

    return String(place?._id || place?.id || 'unknown-place');
}

function getPlaceCost(place) {
    const priceMin = Number(place?.price_min || 0);
    return Number.isFinite(priceMin) && priceMin > 0 ? priceMin : 0;
}

//คำนวณ "คุ้มค่า"
function getPlaceScore(place) {
    const rating = Number(place?.rating || 0);
    const cost = getPlaceCost(place);
    return cost > 0 ? rating / cost : rating;
}

//เรียงลำดับจากคุ้มค่าที่สุดไปน้อยที่สุด
function sortByValue(a, b) {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
    return getPlaceCost(a) - getPlaceCost(b);
}

function toTripPlace(place) {
    return {
        ...place,
        selectedCost: getPlaceCost(place)
    };
}

function pickWeightedPlace(places, random) {
    if (places.length === 0) return null;

    const weights = places.map(place => Math.pow(Math.max(getPlaceScore(place), 0.01), 0.75));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let target = random() * totalWeight;

    for (let index = 0; index < places.length; index += 1) {
        target -= weights[index];
        if (target <= 0) return places[index];
    }

    return places[places.length - 1];
}

function buildCategorySummary(selectedPlaces, requestedCategories, availableCategories) {
    const categoryCounts = selectedPlaces.reduce((summary, place) => {
        const categoryName = getCategoryName(place);
        if (!categoryName) return summary;
        summary[categoryName] = (summary[categoryName] || 0) + 1;
        return summary;
    }, {});

    return {
        requestedCategories,
        categoryCounts,
        missingCategories: requestedCategories.filter(category => !categoryCounts[category]),
        unavailableCategories: requestedCategories.filter(category => (
            !availableCategories.has(normalizeCategory(category))
        ))
    };
}

function selectPlacesByBudget(places, budget, options = {}) {
    const {
        categories = [],
        maxPlaces = 10,
        random = Math.random,
        excludePlaceIds = []
    } = options;
    const parsedBudget = Number(budget);
    const parsedMaxPlaces = Number(maxPlaces);

    // Validate inputs
    if (!Array.isArray(places) || !Number.isFinite(parsedBudget) || parsedBudget <= 0) {
        return {
            selectedPlaces: [],
            budget_total: budget,
            budget_used: 0,
            budget_remaining: budget
        };
    }

    const placeLimit = Number.isInteger(parsedMaxPlaces) && parsedMaxPlaces > 0
        ? parsedMaxPlaces
        : 10;
    const requestedCategories = Array.isArray(categories)
        ? [...new Set(categories.map(category => String(category || '').trim()).filter(Boolean))]
        : [];
    const requestedCategoryKeys = new Set(requestedCategories.map(normalizeCategory));
    const excludedIds = new Set(Array.isArray(excludePlaceIds) ? excludePlaceIds.map(String) : []);

    const filteredPlaces = requestedCategories.length > 0
        ? places.filter(place => requestedCategoryKeys.has(normalizeCategory(getCategoryName(place))))
        : places;

    const uniquePlaces = [...new Map(filteredPlaces
        .filter(place => (
            !excludedIds.has(String(place._id || place.id)) &&
            !excludedIds.has(getPlaceIdentity(place))
        ))
        .map(place => [getPlaceIdentity(place), place])).values()];
    const placesWithRatio = uniquePlaces
        .map(place => ({
            ...place,
            ratio: getPlaceScore(place)
        }));
    const availableCategories = new Set(placesWithRatio.map(place => normalizeCategory(getCategoryName(place))));

    const selectedPlaces = [];
    const selectedIds = new Set();
    let budgetUsed = 0;

    const getPlaceId = (place) => getPlaceIdentity(place);
    const canSelect = (place) => (
        !selectedIds.has(getPlaceId(place)) && getPlaceCost(place) <= parsedBudget - budgetUsed
    );
    const addPlace = (place) => {
        selectedIds.add(getPlaceId(place));
        selectedPlaces.push(toTripPlace(place));
        budgetUsed += getPlaceCost(place);
    };

    // ตรวจสอบหมวดหมู่ที่ร้องขอก่อนที่จะอนุญาตให้มีหมวดหมู่ซ้ำ
    if (requestedCategories.length > 0) {
        for (const category of requestedCategories) {
            if (selectedPlaces.length >= placeLimit) break;

            const categoryKey = normalizeCategory(category);
            const categoryPlaces = placesWithRatio
                .filter(place => normalizeCategory(getCategoryName(place)) === categoryKey && canSelect(place))
                .sort(sortByValue);
            const bestCategoryPlace = pickWeightedPlace(categoryPlaces, random);

            if (bestCategoryPlace) addPlace(bestCategoryPlace);
        }
    }

    // เติมช่องว่างที่เหลือจากกลุ่มหมวดหมู่ที่ระบุไว้เท่านั้น
    while (selectedPlaces.length < placeLimit) {
        const availablePlaces = placesWithRatio
            .filter(canSelect)
            .sort(sortByValue);
        const place = pickWeightedPlace(availablePlaces, random);
        if (!place) break;
        if (selectedPlaces.length >= placeLimit) break;
        addPlace(place);
    }

    const budgetRemaining = parsedBudget - budgetUsed;

    return {
        selectedPlaces,
        budget_total: parsedBudget,
        budget_used: budgetUsed,
        budget_remaining: budgetRemaining,
        category_summary: buildCategorySummary(selectedPlaces, requestedCategories, availableCategories)
    };
}

// Unit Tests
function runTests() {
    console.log('=== Running Budget Algorithm Tests ===\n');

    // Test 1: Basic functionality
    console.log('Test 1: Basic functionality');
    const places1 = [
        { name: 'Place A', price_min: 100, price_max: 200, rating: 4.5, category: 'คาเฟ่' },
        { name: 'Place B', price_min: 50, price_max: 100, rating: 4.0, category: 'คาเฟ่' },
        { name: 'Place C', price_min: 150, price_max: 300, rating: 5.0, category: 'ร้านอาหาร' },
        { name: 'Place D', price_min: 0, price_max: 0, rating: 4.2, category: 'วัด' }
    ];
    
    const result1 = selectPlacesByBudget(places1, 200, { 
        categories: ['คาเฟ่', 'ร้านอาหาร'], 
        maxPlaces: 3 
    });
    
    console.assert(result1.selectedPlaces.length > 0, 'Should select at least one place');
    console.assert(result1.budget_used <= result1.budget_total, 'Budget used should not exceed total budget');
    console.assert(result1.budget_remaining >= 0, 'Budget remaining should be non-negative');
    console.log('✅ Test 1 passed\n');

    // Test 2: Empty array
    console.log('Test 2: Empty places array');
    const result2 = selectPlacesByBudget([], 500);
    console.assert(result2.selectedPlaces.length === 0, 'Should return empty array for empty input');
    console.assert(result2.budget_used === 0, 'Budget used should be 0');
    console.assert(result2.budget_remaining === 500, 'Budget remaining should equal total budget');
    console.log('✅ Test 2 passed\n');

    // Test 3: Insufficient budget
    console.log('Test 3: Insufficient budget');
    const places3 = [
        { name: 'Expensive Place', price_min: 1000, price_max: 2000, rating: 5.0, category: 'คาเฟ่' }
    ];
    const result3 = selectPlacesByBudget(places3, 100);
    console.assert(result3.selectedPlaces.length === 0, 'Should not select places that exceed budget');
    console.assert(result3.budget_used === 0, 'Budget used should be 0');
    console.assert(result3.budget_remaining === 100, 'Budget remaining should equal total budget');
    console.log('✅ Test 3 passed\n');

    // Test 4: Free places
    console.log('Test 4: Free places handling');
    const places4 = [
        { name: 'Free Temple', price_min: 0, price_max: 0, rating: 4.5, category: 'วัด' },
        { name: 'Paid Cafe', price_min: 100, price_max: 200, rating: 4.0, category: 'คาเฟ่' }
    ];
    const result4 = selectPlacesByBudget(places4, 50, { categories: ['วัด', 'คาเฟ่'] });
    console.assert(result4.selectedPlaces.length === 1, 'Should select free place even with small budget');
    console.assert(result4.budget_used === 0, 'Free place should not use budget');
    console.assert(result4.budget_remaining === 50, 'Budget should remain unchanged for free place');
    console.log('✅ Test 4 passed\n');

    // Test 5: Max places limit
    console.log('Test 5: Max places limit');
    const places5 = [
        { _id: '1', name: 'Place 1', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { _id: '2', name: 'Place 2', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { _id: '3', name: 'Place 3', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { _id: '4', name: 'Place 4', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' }
    ];
    const result5 = selectPlacesByBudget(places5, 100, { maxPlaces: 2 });
    console.assert(result5.selectedPlaces.length <= 2, 'Should not exceed max places limit');
    console.log('✅ Test 5 passed\n');

    // Test 6: Ratio calculation
    console.log('Test 6: Ratio calculation verification');
    const places6 = [
        { name: 'High Ratio', price_min: 50, price_max: 100, rating: 5.0, category: 'คาเฟ่' }, // ratio: 0.1
        { name: 'Low Ratio', price_min: 100, price_max: 200, rating: 4.0, category: 'คาเฟ่' }   // ratio: 0.04
    ];
    const deterministicResult6 = selectPlacesByBudget(places6, 150, { maxPlaces: 1, random: () => 0 });
    console.assert(deterministicResult6.selectedPlaces[0]?.name === 'High Ratio', 'Should prioritize higher ratio when random selects the first candidate');
    console.log('✅ Test 6 passed\n');

    // Test 7: Category coverage before duplicates
    console.log('Test 7: Category coverage before duplicates');
    const places7 = [
        { name: 'Temple A', price_min: 0, price_max: 0, rating: 4.9, category: 'Temple' },
        { name: 'Temple B', price_min: 0, price_max: 0, rating: 4.8, category: 'Temple' },
        { name: 'Park A', price_min: 0, price_max: 0, rating: 4.7, category: 'Park' },
        { name: 'Park B', price_min: 0, price_max: 0, rating: 4.6, category: 'Park' },
        { name: 'Cafe A', price_min: 50, price_max: 100, rating: 4.5, category: 'Cafe' },
        { name: 'Museum A', price_min: 50, price_max: 100, rating: 4.1, category: 'Museum' }
    ];
    const result7 = selectPlacesByBudget(places7, 500, {
        categories: ['Temple', 'Park', 'Cafe', 'Museum'],
        maxPlaces: 5
    });
    const result7Categories = new Set(result7.selectedPlaces.map(place => place.category));
    console.assert(result7.selectedPlaces.length === 5, 'Should fill the requested number of places when possible');
    console.assert(result7Categories.has('Temple'), 'Should include Temple');
    console.assert(result7Categories.has('Park'), 'Should include Park');
    console.assert(result7Categories.has('Cafe'), 'Should include Cafe');
    console.assert(result7Categories.has('Museum'), 'Should include Museum');
    console.log('Test 7 passed\n');

    // Test 8: Do not fill with unrequested categories
    console.log('Test 8: Do not fill with unrequested categories');
    const result8 = selectPlacesByBudget(places7, 500, {
        categories: ['Cafe'],
        maxPlaces: 4
    });
    console.assert(result8.selectedPlaces.every(place => place.category === 'Cafe'), 'Should only select requested categories');
    console.log('Test 8 passed\n');

    // Test 9: Duplicate place records
    console.log('Test 9: Duplicate place records');
    const duplicatePlaces = [
        { _id: '1', name: 'Same Cafe', address: 'Ubon', price_min: 50, rating: 4.5, category: 'Cafe' },
        { _id: '2', name: 'Same Cafe', address: 'Ubon', price_min: 50, rating: 4.5, category: 'Cafe' },
        { _id: '3', name: 'Another Cafe', address: 'Ubon', price_min: 50, rating: 4.2, category: 'Cafe' }
    ];
    const result9 = selectPlacesByBudget(duplicatePlaces, 200, {
        categories: ['Cafe'],
        maxPlaces: 5,
        random: () => 0
    });
    console.assert(result9.selectedPlaces.length === 2, 'Should remove duplicate place records before selecting');
    console.log('Test 9 passed\n');

    // Test 10: Exclude places used by a previous search
    console.log('Test 10: Exclude places used by a previous search');
    const result10 = selectPlacesByBudget(places5, 100, {
        maxPlaces: 2,
        excludePlaceIds: ['1', '2'],
        random: () => 0
    });
    console.assert(result10.selectedPlaces.every(place => !['1', '2'].includes(String(place._id))), 'Should exclude places from previous searches');
    console.log('Test 10 passed\n');

    console.log('=== All Tests Passed! ===');
}

// Export the function
module.exports = {
    selectPlacesByBudget,
    runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}
