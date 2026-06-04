"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Bookmark, Check, ChevronLeft, ChevronRight, Flame,
  Heart, Moon, Plus, Search, ShoppingBag, Sparkles, Sun,
  Trash2, UserRound, Utensils, X, Zap
} from "lucide-react";
import { macroTotal, menuItems, restaurants, type Macro, type MenuItem } from "../lib/data";

type Selected = { item: MenuItem; quantity: number };
type View = "home" | "restaurant";
type MealChoice = { name: string; description: string; baseIds?: string[] };
type BuilderGroup = { label: string; help: string; categories: string[]; variant?: "kids" | "extras"; showWhen?: string[] };
type BuilderConfig = { meals: MealChoice[]; groups: BuilderGroup[]; tip: string };
const portionMultipliers = { Light: .8, Normal: 1, Heavy: 1.25 };
const jerseyMikesSizes = [
  { label: "Mini", value: .58, description: "Smaller sub" },
  { label: "Regular", value: 1, description: "Standard size" },
  { label: "Giant", value: 2, description: "Double regular" },
] as const;
const starbucksSizes = [
  { label: "Tall", value: .75, description: "12 fl oz" },
  { label: "Grande", value: 1, description: "16 fl oz" },
  { label: "Venti", value: 1.25, description: "20-24 fl oz" },
] as const;
const itemSizeOptions = [
  { label: "Small", value: .7 },
  { label: "Medium", value: 1 },
  { label: "Large", value: 1.35 },
] as const;
const round = (number: number) => Math.round(number);
const officialBaselineRestaurants = new Set(["panda", "jimmyjohns", "culvers"]);

function Logo({ id, small = false }: { id: string; small?: boolean }) {
  const restaurant = restaurants.find(r => r.id === id)!;
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`brand-logo ${loaded ? "brand-logo-loaded" : ""} ${small ? "brand-logo-small" : ""}`} style={{ background: restaurant.color }}>
      <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} loading="lazy" onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />
      <b>{restaurant.short}</b>
      <small>{restaurant.logo}</small>
    </span>
  );
}

function MacroStats({ macro, multiplier = 1 }: { macro: Macro; multiplier?: number }) {
  return (
    <div className="macro-stats">
      <span><b>{round(macro.calories * multiplier)}</b><small>cal</small></span>
      <span><b>{round(macro.protein * multiplier)}g</b><small>protein</small></span>
      <span><b>{round(macro.carbs * multiplier)}g</b><small>carbs</small></span>
      <span><b>{round(macro.fat * multiplier)}g</b><small>fat</small></span>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [restaurantId, setRestaurantId] = useState("panda");
  const [selected, setSelected] = useState<Selected[]>([
    { item: menuItems[1], quantity: 1 }, { item: menuItems[2], quantity: 1 }
  ]);
  const [search, setSearch] = useState("");
  const [portion, setPortion] = useState<keyof typeof portionMultipliers>("Normal");
  const [dark, setDark] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orderType, setOrderType] = useState<string | null>(null);
  const [jerseySize, setJerseySize] = useState<(typeof jerseyMikesSizes)[number]["label"]>("Regular");
  const [starbucksSize, setStarbucksSize] = useState<(typeof starbucksSizes)[number]["label"]>("Grande");
  const restaurant = restaurants.find(item => item.id === restaurantId)!;
  const multiplier = portionMultipliers[portion];

  const jerseySizeMultiplier = restaurantId === "jerseymikes" ? jerseyMikesSizes.find(size => size.label === jerseySize)!.value : 1;
  const starbucksSizeMultiplier = restaurantId === "starbucks" ? starbucksSizes.find(size => size.label === starbucksSize)!.value : 1;
  const totals = useMemo(() => macroTotal(selected.map(({ item, quantity }) => ({
    item,
    quantity: quantity * multiplier * (item.restaurantId === "jerseymikes" ? jerseySizeMultiplier : 1) * (item.restaurantId === "starbucks" && ["Drinks", "Customizations"].includes(item.category) ? starbucksSizeMultiplier : 1),
  }))), [selected, multiplier, jerseySizeMultiplier, starbucksSizeMultiplier]);
  const shownRestaurants = restaurants.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const openRestaurant = (id: string) => {
    setRestaurantId(id); setView("restaurant"); setSearch("");
    setSelected([]); setOrderType(null); setJerseySize("Regular"); setStarbucksSize("Grande"); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addItem = (item: MenuItem) => setSelected(current => current.some(row => row.item.id === item.id) ? current : [...current, { item, quantity: 1 }]);
  const removeItem = (id: string) => setSelected(current => current.filter(row => row.item.id !== id));
  const updateQuantity = (id: string, quantity: number) => quantity <= 0 ? removeItem(id) : setSelected(current => current.some(row => row.item.id === id) ? current.map(row => row.item.id === id ? { ...row, quantity } : row) : [...current, { item: menuItems.find(item => item.id === id)!, quantity }]);

  return (
    <main className={dark ? "dark app" : "app"}>
      <header className="site-header">
        <div className="shell header-inner">
          <button className="logo" onClick={() => setView("home")}><span><Flame size={17} fill="currentColor" /></span>MacroMenu</button>
          <nav><button onClick={() => setView("home")}>Explore</button><button>Saved meals</button><button>Favorites</button></nav>
          <div className="header-actions">
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
            <button className="login"><UserRound size={16}/> Log in</button>
            <button className="signup">Get started</button>
          </div>
        </div>
      </header>

      {view === "home" ? (
        <>
          <section className="hero">
            <div className="shell hero-content">
              <div className="eyebrow"><Sparkles size={14}/> Made for eating out</div>
              <h1>Track restaurant<br/><em>macros in seconds.</em></h1>
              <p>Build meals from the places you love and instantly calculate calories, protein, carbs, and fat. No PDFs. No guesswork.</p>
              <div className="global-search">
                <Search size={21}/>
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search for a restaurant" />
                <span>⌘ K</span>
                <button>Search</button>
              </div>
              {search && <div className="search-results">{shownRestaurants.map(r => <button key={r.id} onClick={() => openRestaurant(r.id)}><Logo id={r.id} small/><span><b>{r.name}</b><small>{r.description}</small></span><ArrowRight size={16}/></button>)}</div>}
              <div className="popular-search"><span>Popular:</span>{["Panda Express", "Chipotle", "Chick-fil-A", "Jersey Mike's", "McDonald's", "Starbucks"].map(item => <button key={item} onClick={() => openRestaurant(restaurants.find(r => r.name === item)!.id)}>{item}</button>)}</div>
              <div className="hero-proof"><div><span>12k+</span><small>menu items</small></div><div><span>80+</span><small>restaurants</small></div><div><span>&lt; 10s</span><small>to build a meal</small></div></div>
            </div>
            <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          </section>

          <section className="shell popular section">
            <div className="section-heading"><div><p className="kicker">EXPLORE</p><h2>Popular restaurants</h2><span>Start building a meal from a fan favorite.</span></div><button>View all <ArrowRight size={16}/></button></div>
            <div className="restaurant-grid">
              {restaurants.map(r => <button className="restaurant-card" key={r.id} onClick={() => openRestaurant(r.id)}>
                <div className="restaurant-top"><Logo id={r.id}/><Heart size={17}/></div>
                <h3>{r.name}</h3><p>{r.description}</p>
                <div><span className="pill">{r.category}</span><ArrowRight size={17}/></div>
              </button>)}
            </div>
          </section>

          <section className="shell feature-banner">
            <div><div className="eyebrow"><Zap size={14}/> Fast and flexible</div><h2>Your macros. Your order.<br/><em>Your goals.</em></h2><p>Adjust serving sizes, account for heavy scoops, and save your go-to meals for next time.</p><button onClick={() => openRestaurant("panda")}>Build your first meal <ArrowRight size={17}/></button></div>
            <div className="mini-meal">
              <p>YOUR MEAL <span><Check size={13}/> Live totals</span></p>
              {[["Grilled Teriyaki Chicken","275 cal","33g protein"],["Super Greens","130 cal","9g protein"],["White Steamed Rice","520 cal","10g protein"]].map(item => <div key={item[0]}><span className="check"><Check size={14}/></span><b>{item[0]}</b><small>{item[1]} · {item[2]}</small></div>)}
              <footer><span><b>925</b><small>CALORIES</small></span><span><b>52g</b><small>PROTEIN</small></span><span><b>146g</b><small>CARBS</small></span><span><b>14g</b><small>FAT</small></span></footer>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="restaurant-hero">
            <div className="shell">
              <button className="back" onClick={() => setView("home")}><ChevronLeft size={16}/> All restaurants</button>
              <div className="restaurant-title"><Logo id={restaurant.id}/><div><div className="tag-row"><span>{restaurant.category}</span><span><Sparkles size={12}/> {officialBaselineRestaurants.has(restaurant.id) ? "Official baseline" : "Nutrition preview"}</span></div><h1>{restaurant.name}</h1><p>{restaurant.description} · Updated nutrition data</p></div><button className="favorite-rest"><Heart size={18}/> Favorite</button></div>
            </div>
          </section>
          <section className="shell builder-layout">
            <div className="catalog">
              <RestaurantBuilder restaurantId={restaurantId} meal={orderType} setMeal={setOrderType} selected={selected} addItem={addItem} removeItem={removeItem} updateQuantity={updateQuantity} jerseySize={jerseySize} setJerseySize={setJerseySize} starbucksSize={starbucksSize} setStarbucksSize={setStarbucksSize}/>
            </div>
            <MealPanel selected={selected} totals={totals} portion={portion} setPortion={setPortion} removeItem={removeItem} updateQuantity={updateQuantity} saved={saved} setSaved={setSaved} officialBaseline={officialBaselineRestaurants.has(restaurantId)}/>
          </section>
          <button className="mobile-meal-button" onClick={() => setDrawer(true)}><span><ShoppingBag size={18}/>{selected.length} items</span><b>{round(totals.calories)} cal</b><ChevronRight size={17}/></button>
          {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}><div className="drawer" onClick={e => e.stopPropagation()}><button className="drawer-close" onClick={() => setDrawer(false)}><X/></button><MealPanel selected={selected} totals={totals} portion={portion} setPortion={setPortion} removeItem={removeItem} updateQuantity={updateQuantity} saved={saved} setSaved={setSaved} officialBaseline={officialBaselineRestaurants.has(restaurantId)}/></div></div>}
        </>
      )}
    </main>
  );
}

const builderConfigs: Record<string, BuilderConfig> = {
  panda: { meals: [{name:"Bowl",description:"1 side + 1 entree"},{name:"Plate",description:"1 side + 2 entrees"},{name:"Bigger Plate",description:"1 side + 3 entrees"},{name:"A la Carte",description:"Build your own combo"}], groups: [{label:"Choose your entrees",help:"Mix favorites or make an entree double",categories:["Entrees"]},{label:"Choose your sides",help:"Pick rice, noodles, greens, or go half and half",categories:["Sides"]},{label:"Extras",help:"Add appetizers, drinks, and something sweet",categories:["Appetizers","Drinks","Desserts"]}], tip:"Use Light, Regular, or Double for every scoop, including half rice and half greens." },
  chipotle: { meals: [{name:"Bowl",description:"The classic build"},{name:"Burrito",description:"Includes flour tortilla",baseIds:["chip-tortilla"]},{name:"Salad",description:"Fresh greens base"},{name:"Tacos",description:"Includes 3 crispy shells",baseIds:["chip-taco-shells"]},{name:"Kid's Meal",description:"Quesadilla or build-your-own"}], groups: [{label:"Choose your protein",help:"Pick one, mix two, or go double, including limited-time proteins",categories:["Protein"],showWhen:["Bowl","Burrito","Salad","Tacos"]},{label:"Rice",help:"Make it light, regular, or double",categories:["Rice"],showWhen:["Bowl","Burrito","Salad","Tacos"]},{label:"Beans",help:"Add one or both",categories:["Beans"],showWhen:["Bowl","Burrito","Salad","Tacos"]},{label:"Toppings",help:"Finish it exactly how you order it",categories:["Toppings"],showWhen:["Bowl","Burrito","Salad","Tacos"]},{label:"Sides and extras",help:"Add protein cups, chips, or a tortilla on the side",categories:["Protein Cups","Sides"],variant:"extras",showWhen:["Bowl","Burrito","Salad","Tacos"]},{label:"Kids base",help:"Choose the kid-size taco tortillas, crispy shells, or quesadilla tortilla",categories:["Kids Base"],variant:"kids",showWhen:["Kid's Meal"]},{label:"Kids protein",help:"Kid-sized 2 oz meat or sofritas portions",categories:["Kids Proteins"],variant:"kids",showWhen:["Kid's Meal"]},{label:"Kids rice and beans",help:"Kid-sized rice and bean portions",categories:["Kids Rice & Beans"],variant:"kids",showWhen:["Kid's Meal"]},{label:"Kids toppings",help:"Kid-sized toppings like cheese, salsa, sour cream, guac, and lettuce",categories:["Kids Toppings"],variant:"kids",showWhen:["Kid's Meal"]},{label:"Kids fruit, chips, and drinks",help:"Add the kid side and drink options",categories:["Kids Fruit & Drinks","Kids Drinks"],variant:"kids",showWhen:["Kid's Meal"]}], tip:"Choose double steak, honey chicken, extra rice, protein cups, chips, tortillas, kids meals, and every topping individually." },
  chickfila: { meals: [{name:"Entree",description:"Sandwich, nuggets, or grilled protein"},{name:"Combo",description:"Entree + side + drink"},{name:"Sides & Treats",description:"Build a snack or lighter meal"}], groups: [{label:"Choose your entree",help:"Add one or combine items",categories:["Entrees"]},{label:"Choose your sides",help:"Fries, fruit, or both",categories:["Sides"]},{label:"Sauces",help:"Track every dipping sauce packet",categories:["Sauces"]},{label:"Drinks",help:"Finish your combo",categories:["Drinks"]}], tip:"Sauces count too. Add each packet and adjust the quantity if you use more than one." },
  potbelly: { meals: [{name:"Build your own sandwich",description:"Bread, meat, cheese, toppings"},{name:"Toasty favorite",description:"Start with a known sandwich"},{name:"Pick-your-pair",description:"Sandwich + side"}], groups: [{label:"Choose your bread",help:"Start with the bread style you actually ordered",categories:["Bread"]},{label:"Choose meats",help:"Add turkey, ham, roast beef, or double portions",categories:["Meats"]},{label:"Choose cheese",help:"Add or skip cheese",categories:["Cheese"]},{label:"Spreads and toppings",help:"Mayo, mustard, avocado, peppers, lettuce, tomato",categories:["Spreads","Toppings"]},{label:"Premade favorites and sides",help:"Optional shortcuts or add-ons",categories:["Sandwiches","Sides"]}], tip:"Potbelly is shown as preview data until its current official component feed is imported; the flow is ready for bread, meats, cheese, spreads, and toppings." },
  jimmyjohns: { meals: [{name:"Build your own sandwich",description:"Bread, meats, cheese, freebies"},{name:"Original 8-inch",description:"Classic French bread order"},{name:"Unwich",description:"Lettuce-wrapped low-carb order"}], groups: [{label:"Choose your bread",help:"French, sliced wheat, or Unwich lettuce wrap",categories:["Bread"]},{label:"Choose meats",help:"Regular, light, or double meat portions",categories:["Meats"]},{label:"Choose cheese",help:"Add provolone or skip it",categories:["Cheese"]},{label:"Spreads",help:"Mayo, oil and vinegar, and other add-ons",categories:["Spreads"]},{label:"Toppings",help:"Freebies like peppers, tomato, and lettuce",categories:["Toppings"]},{label:"Premade favorites",help:"Optional shortcuts if you know the sandwich name",categories:["Sandwiches"]}], tip:"Jimmy John's component macros use its official add-on guide for 8-inch French, Unwich, sliced wheat, and wraps." },
  jerseymikes: { meals: [{name:"Build your own sub",description:"Bread, meats, cheese, Mike's Way"},{name:"Regular sub",description:"Classic regular-size sub"},{name:"Sub in a Tub",description:"No-bread bowl order"}], groups: [{label:"Choose your bread",help:"White, wheat, rosemary parmesan, or no-bread Sub in a Tub",categories:["Bread"]},{label:"Choose meats",help:"Add fresh-sliced meats, bacon, and double portions",categories:["Meats"]},{label:"Choose cheese",help:"Add provolone or skip it",categories:["Cheese"]},{label:"Spreads and Mike's Way",help:"Mayo, oil, vinegar, lettuce, tomato, onion",categories:["Spreads","Toppings"]},{label:"Premade favorites",help:"Optional shortcuts while the official import is pending",categories:["Sandwiches"]}], tip:"Jersey Mike's is set up for bread-first sub logging, including rosemary parmesan bread and bacon. Current rows are preview data until the official component import is complete." },
  mcdonalds: { meals: [{name:"Combo meal",description:"Entree + fries + drink"},{name:"Burger or sandwich",description:"Track an entree"},{name:"Breakfast",description:"Morning order"},{name:"Nuggets and sauces",description:"Pieces, sides, and sauces"}], groups: [{label:"Choose your entree",help:"Burgers, chicken, nuggets, and sandwiches",categories:["Entrees"]},{label:"Breakfast",help:"Track breakfast sandwiches",categories:["Breakfast"]},{label:"Sides",help:"Fries, apple slices, and add-ons",categories:["Sides"]},{label:"Drinks",help:"Fountain drinks and coffee",categories:["Drinks"]},{label:"Sauces",help:"Add each sauce packet",categories:["Sauces"]}], tip:"McDonald's is ready for combo-style logging. Current rows are preview data until the full official calculator import is complete." },
  culvers: { meals: [{name:"Basket",description:"Entree + side"},{name:"Entree",description:"Build a lighter meal"},{name:"Custard run",description:"Treats and extras"}], groups: [{label:"Choose your entree",help:"Burgers, chicken, and more",categories:["Entrees"]},{label:"Choose your sides",help:"Curds, broccoli, or your favorites",categories:["Sides"]},{label:"Desserts",help:"Add your custard scoop",categories:["Desserts"]}], tip:"Build a basket item by item so substitutions and extra sides stay accurate." },
  starbucks: { meals: [{name:"Drink",description:"Coffee, tea, refreshers, or espresso"},{name:"Drink + food",description:"Your cafe order"},{name:"Food",description:"Track a quick bite"}], groups: [{label:"Choose your drink",help:"Start with the closest menu drink",categories:["Drinks"]},{label:"Customize your drink",help:"Track milk, syrup pumps, foam, and extra shots",categories:["Customizations"]},{label:"Add food",help:"Include breakfast or a snack",categories:["Food"]}], tip:"Choose a drink size first. Drink and customization macros scale by size; food items do not." },
  tacobell: { meals: [{name:"Tacos",description:"Build a taco order"},{name:"Burrito",description:"Start with a wrapped favorite"},{name:"Combo",description:"Mix entrees and extras"}], groups: [{label:"Choose your entrees",help:"Mix tacos, burritos, and favorites",categories:["Entrees"]},{label:"Customize it",help:"Add extra beef, potatoes, and more",categories:["Extras"]},{label:"Sauces",help:"Track creamy add-ons",categories:["Sauces"]}], tip:"Add extras individually so swaps, potatoes, and extra beef land in your totals." },
};

function RestaurantBuilder({ restaurantId, meal, setMeal, selected, addItem, removeItem, updateQuantity, jerseySize, setJerseySize, starbucksSize, setStarbucksSize }: {
  restaurantId: string; meal: string | null; setMeal: (meal: string | null) => void; selected: Selected[];
  addItem: (item: MenuItem) => void; removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void;
  jerseySize: (typeof jerseyMikesSizes)[number]["label"]; setJerseySize: (size: (typeof jerseyMikesSizes)[number]["label"]) => void;
  starbucksSize: (typeof starbucksSizes)[number]["label"]; setStarbucksSize: (size: (typeof starbucksSizes)[number]["label"]) => void;
}) {
  const config = builderConfigs[restaurantId];
  const restaurant = restaurants.find(item => item.id === restaurantId)!;
  const chooseMeal = (choice: MealChoice) => {
    config.meals.flatMap(option => option.baseIds ?? []).forEach(removeItem);
    choice.baseIds?.forEach(id => addItem(menuItems.find(item => item.id === id)!));
    setMeal(choice.name);
  };
  if (!meal) return <div className="chipotle-start">
    <div className="catalog-head"><div><span className="step-label">STEP 1 OF 2</span><h2>What are you building?</h2><p>Choose a meal type, then make it match your actual {restaurant.name} order.</p></div></div>
    <div className="meal-type-grid">
      {config.meals.map(choice => <button onClick={() => chooseMeal(choice)} key={choice.name}>
        <span><Utensils size={21}/></span><b>{choice.name}</b><small>{choice.description}</small><ArrowRight size={17}/>
      </button>)}
    </div>
    <div className="chipotle-note"><Sparkles size={15}/><span><b>Built for real orders.</b> {config.tip}</span></div>
  </div>;
  return <div className="chipotle-builder">
    <div className="catalog-head chipotle-builder-head"><div><span className="step-label">STEP 2 OF 2</span><h2>{meal.toLowerCase().includes("build") ? meal : `Build your ${meal.toLowerCase()}`}</h2><p>Tap an item, then choose a portion. Customize it the way you really order it.</p></div><button onClick={() => setMeal(null)}><ChevronLeft size={15}/> Change meal</button></div>
    <div className="chipotle-base"><span><Check size={15}/></span><div><b>{meal}</b><small>{restaurant.name} custom order</small></div></div>
    {restaurantId === "jerseymikes" && <div className="size-selector"><div><b>Choose sandwich size</b><small>Macros scale from the regular-size baseline.</small></div><div>{jerseyMikesSizes.map(size => <button className={jerseySize === size.label ? "active" : ""} onClick={() => setJerseySize(size.label)} key={size.label}><b>{size.label}</b><small>{size.description}</small></button>)}</div></div>}
    {restaurantId === "starbucks" && <div className="size-selector"><div><b>Choose drink size</b><small>Applies to drinks and drink customizations only.</small></div><div>{starbucksSizes.map(size => <button className={starbucksSize === size.label ? "active" : ""} onClick={() => setStarbucksSize(size.label)} key={size.label}><b>{size.label}</b><small>{size.description}</small></button>)}</div></div>}
    <div className={restaurantId === "chipotle" && meal !== "Kid's Meal" ? "chipotle-columns" : ""}>
      <div>
    {config.groups.filter(group => !group.showWhen || group.showWhen.includes(meal)).filter(group => group.variant !== "extras").map(group => <section className={`ingredient-group ${group.variant === "kids" ? "kids-group" : ""}`} key={group.label}>
      <header><div><h3>{group.label}</h3><p>{group.help}</p></div></header>
      <div>{menuItems.filter(item => item.restaurantId === restaurantId && group.categories.includes(item.category)).map(item => {
        const quantity = selected.find(row => row.item.id === item.id)?.quantity ?? 0;
        return <article className={quantity ? "ingredient-row selected" : "ingredient-row"} key={item.id}>
          <button className="ingredient-main" onClick={() => quantity ? removeItem(item.id) : addItem(item)}>
            <span className="ingredient-check">{quantity ? <Check size={14}/> : <Plus size={14}/>}</span>
            <span><b>{item.name}</b><small>{item.description}</small></span>
          </button>
          <MacroStats macro={item}/>
          <ItemControls item={item} quantity={quantity} removeItem={removeItem} updateQuantity={updateQuantity}/>
        </article>;
      })}</div>
    </section>)}
      </div>
      {restaurantId === "chipotle" && meal !== "Kid's Meal" && <aside className="extras-column">{config.groups.filter(group => group.variant === "extras" && (!group.showWhen || group.showWhen.includes(meal))).map(group => <section className="ingredient-group extras-group" key={group.label}>
        <header><div><h3>{group.label}</h3><p>{group.help}</p></div></header>
        <div>{menuItems.filter(item => item.restaurantId === restaurantId && group.categories.includes(item.category)).map(item => {
          const quantity = selected.find(row => row.item.id === item.id)?.quantity ?? 0;
          return <article className={quantity ? "ingredient-row selected" : "ingredient-row"} key={item.id}>
            <button className="ingredient-main" onClick={() => quantity ? removeItem(item.id) : addItem(item)}>
              <span className="ingredient-check">{quantity ? <Check size={14}/> : <Plus size={14}/>}</span>
              <span><b>{item.name}</b><small>{item.description}</small></span>
            </button>
            <MacroStats macro={item}/>
            <ItemControls item={item} quantity={quantity} removeItem={removeItem} updateQuantity={updateQuantity}/>
          </article>;
        })}</div>
      </section>)}</aside>}
    </div>
  </div>;
}

function ItemControls({ item, quantity, removeItem, updateQuantity }: {
  item: MenuItem; quantity: number; removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void;
}) {
  if (item.control === "size") return <div className="scoop-control size-control">
    <button className={quantity === 0 ? "active" : ""} onClick={() => removeItem(item.id)}>None</button>
    {itemSizeOptions.map(size => <button className={quantity === size.value ? "active" : ""} onClick={() => updateQuantity(item.id, size.value)} key={size.label}>{size.label}</button>)}
  </div>;

  if (item.control === "quantity" || ["Entrees", "Sandwiches", "Breakfast", "Food", "Desserts", "Sauces"].includes(item.category)) return <div className="scoop-control quantity-control">
    <button className={quantity === 0 ? "active" : ""} onClick={() => removeItem(item.id)}>None</button>
    {[1, 2, 3].map(value => <button className={quantity === value ? "active" : ""} onClick={() => updateQuantity(item.id, value)} key={value}>{value === 1 ? "1 item" : `${value} items`}</button>)}
  </div>;

  return <div className="scoop-control">
    {[0, .5, 1, 2].map(value => <button className={quantity === value ? "active" : ""} onClick={() => value === 0 ? removeItem(item.id) : updateQuantity(item.id, value)} key={value}>{value === 0 ? "None" : value === .5 ? "Light" : value === 1 ? "Regular" : "Double"}</button>)}
  </div>;
}

function MealPanel({ selected, totals, portion, setPortion, removeItem, updateQuantity, saved, setSaved, officialBaseline }: {
  selected: Selected[]; totals: Macro; portion: keyof typeof portionMultipliers;
  setPortion: (value: keyof typeof portionMultipliers) => void; removeItem: (id: string) => void;
  updateQuantity: (id: string, value: number) => void; saved: boolean; setSaved: (value: boolean) => void; officialBaseline: boolean;
}) {
  return <aside className="meal-panel">
    <div className="meal-heading"><div><span>YOUR MEAL</span><h2>Meal builder</h2></div><button onClick={() => selected.forEach(row => removeItem(row.item.id))}>Clear</button></div>
    <div className="portion-box"><div><span>Portion estimate</span><small>Adjust for restaurant portions</small></div><div>{Object.keys(portionMultipliers).map(item => <button className={portion === item ? "active" : ""} onClick={() => setPortion(item as keyof typeof portionMultipliers)} key={item}>{item}</button>)}</div></div>
    <div className="meal-items">
      {!selected.length && <div className="empty-meal"><ShoppingBag size={25}/><b>Your meal is empty</b><span>Add menu items to start tracking.</span></div>}
      {selected.map(({ item, quantity }) => <div className="meal-row" key={item.id}><span className="meal-row-icon"><Check size={13}/></span><div><b>{item.name}</b><small>{round(item.calories * quantity)} cal · {round(item.protein * quantity)}g protein</small><div className="qty"><button onClick={() => updateQuantity(item.id, quantity - .5)}>−</button><span>{quantity}x</span><button onClick={() => updateQuantity(item.id, quantity + .5)}>+</button></div></div><button onClick={() => removeItem(item.id)}><Trash2 size={15}/></button></div>)}
    </div>
    <div className="totals"><div className="total-cal"><span>TOTAL CALORIES</span><b>{round(totals.calories)}</b></div><div className="total-macros"><span><b>{round(totals.protein)}g</b><small>PROTEIN</small></span><span><b>{round(totals.carbs)}g</b><small>CARBS</small></span><span><b>{round(totals.fat)}g</b><small>FAT</small></span></div></div>
    <button className={saved ? "save-meal saved" : "save-meal"} onClick={() => setSaved(!saved)}>{saved ? <Check size={17}/> : <Bookmark size={17}/>} {saved ? "Meal saved" : "Save this meal"}</button>
    <p className="meal-note"><Sparkles size={13}/> {officialBaseline ? "Baseline macros use published restaurant nutrition data. Portion adjustments are estimates." : "Nutrition preview data is being audited against official restaurant sources."}</p>
  </aside>
}
