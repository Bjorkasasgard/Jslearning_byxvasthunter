import math

def polynomial_approximation_tool(function_name, order, x):    
    derivatives_at_zero = {}
    true_value = 0.0

    if function_name == 'cos':
        derivatives_at_zero = [1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1] # f(0), f'(0), f''(0), ...
        true_value = math.cos(x)
    elif function_name == 'sin':
        derivatives_at_zero = [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0]
        true_value = math.sin(x)
    elif function_name == 'ln':
        # For f(x) = ln(1+x)
        derivatives_at_zero = [0, 1, -1, 2, -6, 24, -120]
        true_value = math.log(1 + x)   
    else:
        print(f"Error: Function '{function_name}' is not supported.")
        return

    if order >= len(derivatives_at_zero):
        print(f"Error: The maximum supported order for '{function_name}' is {len(derivatives_at_zero)-1}.")
        return

    approximated_value = 0.0
    for n in range(order + 1):
        term = (derivatives_at_zero[n] / math.factorial(n)) * (x**n)
        approximated_value += term

    absolute_error = abs(true_value - approximated_value)

    print(f"--- Approximation Tool Results ---")
    if function_name == 'ln':
      # Special print case for ln(1+x)
      print(f"Function: {function_name}(1+{x})")
    else:
      print(f"Function: {function_name}({x})")
    print(f"Polynomial Order: {order}\n")
    
    print(f"True Value:        {true_value:.8f}")
    print(f"Approximated Value: {approximated_value:.8f}")
    print(f"Absolute Error:     {absolute_error:.8f}")
    print("-" * 35 + "\n")


# --- Examples of how to use the tool ---
print("--- Using the Polynomial Approximation Tool ---\n")

# 1. Re-check our cos(0.3) example with order 2
polynomial_approximation_tool('cos', 2, 0.3)

# 2. Re-check our sin(0.2) example with order 5
polynomial_approximation_tool('sin', 5, 0.2)

# 3. Re-check our ln(1.2) example with order 3
polynomial_approximation_tool('ln', 3, 0.2)