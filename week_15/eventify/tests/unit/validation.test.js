const authValidations = require("../../validations/authValidations");
const orderValidation = require("../../validations/orderValidation");

describe("Validation schemas", () => {
  test("register validation rejects short password", () => {
    const { error } = authValidations.register.validate({
      name: "Test User",
      email: "test@example.com",
      password: "123",
    });

    expect(error).toBeTruthy();
  });

  test("order validation requires items", () => {
    const { error } = orderValidation.createOrder.validate({ items: [] });
    expect(error).toBeTruthy();
  });
});
