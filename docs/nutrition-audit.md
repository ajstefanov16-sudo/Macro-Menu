# Nutrition Audit Notes

MacroMenu should only label a restaurant as `Official baseline` after its seeded rows have been checked against current official restaurant nutrition data.

## Audited Seeds

- Panda Express: checked against the official nutrition page on 2026-06-02.
- Jimmy John's: checked against the official NutritionGuide PDF effective 2024-07-22 for seeded sandwich and add-on rows.
- Culver's: checked against the official Nutrition & Allergen Guide PDF published in 2026 for seeded rows.

## Preview Seeds

These restaurants have representative demo rows but still need a complete import pass before they should be treated as official baselines:

- Chipotle
- Chick-fil-A
- Potbelly
- Jersey Mike's
- McDonald's
- Starbucks
- Taco Bell

## Modeling Notes

- Sandwich restaurants should use component logging: bread, meats, cheese, spreads, toppings, then optional premade favorites.
- Menu coverage needs explicit checks for easily missed rows: limited-time proteins such as Chipotle Honey Chicken, kids meals, bacon at sub shops, and Jersey Mike's rosemary parmesan bread.
- Published restaurant values are the baseline. Light, Heavy, and Double controls are estimated multipliers on top of the published serving size.
- Do not mark a restaurant as audited only because one or two rows were checked.
