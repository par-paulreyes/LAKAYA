// algorithm for knapsack
function knapsack(weights, values, capacity) {
    const n = weights.length;
    
    let dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][capacity];
}

document.getElementById('knapsack-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const weightsInput = document.getElementById('weights').value; // value of weights
    const valuesInput = document.getElementById('values').value; // price or investment
    const capacityInput = parseInt(document.getElementById('capacity').value); // capacity
    
    const weights = weightsInput.split(',').map(Number);
    const values = valuesInput.split(',').map(Number);
    
    if (weights.length !== values.length) {
        document.getElementById('output').textContent = "Error: The number of weights and values must be the same.";
        return;
    }
    
    const maxValue = knapsack(weights, values, capacityInput);
    
    document.getElementById('output').textContent = `Maximum value: ${maxValue}`; // maximum value or investment
});
