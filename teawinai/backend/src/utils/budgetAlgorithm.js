/**
 * Budget Algorithm for selecting places based on budget and preferences
 * Uses Greedy Algorithm to maximize rating/price ratio
 */

function selectPlacesByBudget(places, budget, options = {}) {
    const { categories = [], maxPlaces = 10 } = options;
    
    // Validate inputs
    if (!Array.isArray(places) || typeof budget !== 'number' || budget <= 0) {
        return {
            selectedPlaces: [],
            budget_total: budget,
            budget_used: 0,
            budget_remaining: budget
        };
    }

    // Step 1: Filter by categories
    let filteredPlaces = places;
    if (categories.length > 0) {
        filteredPlaces = places.filter(place => 
            categories.includes(place.category?.name || place.category)
        );
    }

    // Step 2: Calculate rating/price_min ratio and sort
    const placesWithRatio = filteredPlaces.map(place => {
        const priceMin = place.price_min || 0;
        const rating = place.rating || 0;
        const ratio = priceMin > 0 ? rating / priceMin : rating; // Handle free places
        
        return {
            ...place,
            ratio
        };
    });

    // Sort by ratio (highest first), then by rating (highest first)
    placesWithRatio.sort((a, b) => {
        if (b.ratio !== a.ratio) {
            return b.ratio - a.ratio;
        }
        return b.rating - a.rating;
    });

    // Step 3: Greedy selection
    const selectedPlaces = [];
    let budgetUsed = 0;

    for (const place of placesWithRatio) {
        if (selectedPlaces.length >= maxPlaces) {
            break;
        }

        const placeCost = place.price_min || 0;
        const remainingBudget = budget - budgetUsed;

        // Check if we can afford this place
        if (placeCost <= remainingBudget) {
            selectedPlaces.push({
                ...place,
                selectedCost: placeCost
            });
            budgetUsed += placeCost;
        }
    }

    // Step 4: Calculate results
    const budgetRemaining = budget - budgetUsed;

    return {
        selectedPlaces,
        budget_total: budget,
        budget_used: budgetUsed,
        budget_remaining: budgetRemaining
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
        { name: 'Place 1', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { name: 'Place 2', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { name: 'Place 3', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' },
        { name: 'Place 4', price_min: 10, price_max: 20, rating: 4.0, category: 'คาเฟ่' }
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
    const result6 = selectPlacesByBudget(places6, 150, { maxPlaces: 1 });
    console.assert(result6.selectedPlaces[0]?.name === 'High Ratio', 'Should select place with higher ratio first');
    console.log('✅ Test 6 passed\n');

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
